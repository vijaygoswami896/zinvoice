import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

import { User } from '../models/user.model.js';
import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';
import {
    signAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    refreshTokenExpiresAt,
    parseMs,
} from '../utils/tokenUtils.js';
import env from '../config/env.js';
import { InviteBody, SignupBody } from '../schemas/auth.schema.js';
import { Business } from '../models/business.model.js';
import { Settings } from '../models/settings.model.js';

const REFRESH_TOKEN_MS = parseMs(env.JWT_REFRESH_EXPIRES_IN);

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterParams {
    name: string;
    email: string;
    password: string;
    role: string;
}

interface LoginParams {
    email: string;
    password: string;
    userAgent: string;
    ip: string;
}

interface RefreshParams {
    rawToken: string | null;
    userAgent: string;
    ip: string;
}

interface LogoutParams {
    rawToken: string | null;
}

interface SanitisedUser {
    id: Types.ObjectId;
    businesses: Types.ObjectId[];
    name: string;
    email: string;
    role: string;
    lastLoginAt: Date | null;
    createdAt: Date;
}
// interface SanitisedUser {
//     id: unknown;
//     name: string;
//     email: string;
//     role: string;
//     businesses: unknown[];
//     lastLoginAt: Date | null;
//     createdAt: Date;
// }

// ── Helpers ───────────────────────────────────────────────────────────────────

const sanitiseUser = (user: InstanceType<typeof User>): SanitisedUser => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    businesses: user.businesses,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
});

// ── Service methods ───────────────────────────────────────────────────────────

const register = async ({ name, email, password, role }: RegisterParams): Promise<SanitisedUser> => {
    const existing = await User.findOne({ email, deletedAt: null });
    if (existing) {
        throw new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN');
    }

    const user = new User({ name, email, passwordHash: password, role });
    await user.save();

    logger.info({ msg: 'User registered', userId: user._id, role: user.role });

    return sanitiseUser(user);
};

const login = async ({ email, password, userAgent, ip }: LoginParams) => {
    const user = await User.findByEmailWithPassword(email);

    const DUMMY_HASH = '$2b$12$invalidhashpaddingtomatch.bcrypt.output.length.xxxxxxxxx';

    let passwordMatch = false;

    if (user) {
        passwordMatch = await user.comparePassword(password);
    } else {
        // Run a real bcrypt compare to consume equivalent time
        await bcrypt.compare(password, DUMMY_HASH);
        passwordMatch = false;
    }

    // const passwordMatch = user
    //     ? await user.comparePassword(password)
    //     : (await import('bcryptjs').then((m) => m.compare(password, DUMMY_HASH)), false);

    if (!user || !passwordMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact an administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    const { raw, hash } = generateRefreshToken();

    user.removeExpiredTokens();

    user.refreshTokens.push({
        token: raw.slice(0, 8) + '…',           //What is the use of it?
        tokenHash: hash,
        userAgent: userAgent ?? '',
        ip: ip ?? '',
        expiresAt: refreshTokenExpiresAt(),
    });

    user.pruneRefreshTokens();
    user.lastLoginAt = new Date();

    await user.save();

    const accessToken = signAccessToken(user);

    logger.info({ msg: 'User logged in', userId: user._id, ip });

    return { accessToken, rawRefreshToken: raw, user: sanitiseUser(user) };
};

const signup = async ({
    name, email, password,
    businessName, businessEmail, businessPhone, businessGstin, gstRegistrationType
}: SignupBody) => {

    // 1. Check email not already taken
    const existing = await User.findOne({ email, deletedAt: null });

    if (existing) {
        throw new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN');
    }

    // 2. Use a session for atomicity — both docs created or neither
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 3. Create the owner account
        const user = new User({
            name,
            email,
            passwordHash: password,
            role: 'admin',
        });
        await user.save({ session });

        // 4. Create the business
        const business = new Business({
            name: businessName,
            // email: businessEmail,
            // phone: businessPhone,
            // gstin: businessGstin,
            owner: user._id,
        });
        await business.save({ session });

        // 3. Seed Settings with business details from signup
        await Settings.create([{
            businessId: business._id,
            businessName,
            email: businessEmail,
            phone: businessPhone,
            gstin: businessGstin,
            gstRegistrationType
            // gstRegistrationType left out — owner sets this in onboarding
        }], { session });

        // 5. Link business to user
        user.businesses.push(business._id);
        await user.save({ session });

        await session.commitTransaction();

        logger.info({
            msg: 'Owner signed up',
            userId: user._id,
            businessId: business._id,
        });

        return sanitiseUser(user);

    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
};

const invite = async (
    adminBusinessId: string,
    { name, email, password, role }: InviteBody,
) => {
    // 1. Check email not already taken
    const existing = await User.findOne({ email, deletedAt: null });
    if (existing) {
        throw new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN');
    }

    // 2. Verify the business exists
    const business = await Business.findById(adminBusinessId);
    if (!business) {
        throw new AppError('Business not found', 404, 'NOT_FOUND');
    }

    // 3. Create staff user linked to same business
    const user = new User({
        name,
        email,
        passwordHash: password,
        role, // 'staff' | 'manager' — admin cannot be invited
        businesses: [business._id],
    });
    await user.save();

    logger.info({
        msg: 'Staff invited',
        userId: user._id,
        businessId: business._id,
        role,
    });

    return sanitiseUser(user);
};

// Note: userAgent/ip are stored for audit purposes only,
// not used for validation. Strict UA matching causes
// false rejections on browser/OS updates.
const refresh = async ({ rawToken, userAgent, ip }: RefreshParams) => {
    if (!rawToken) {
        throw new AppError('Refresh token not provided', 401, 'TOKEN_MISSING');
    }

    // Double-check this returns what you expect:
    // console.log('$$$$$$REFRESH_TOKEN_MS:', REFRESH_TOKEN_MS);
    // console.log('########Token expires at:', refreshTokenExpiresAt());

    const tokenHash = hashRefreshToken(rawToken);
    // console.log('Computed hash:', tokenHash);
    // console.log('Expected hash:', '2a4b3795a806b32ae0bbf4d5f8126cf4f3bb30249c1417da0660c1663c54e5e0');
    // console.log('Match:', tokenHash === '2a4b3795a806b32ae0bbf4d5f8126cf4f3bb30249c1417da0660c1663c54e5e0');

    const user = await User.findOne({
        'refreshTokens.tokenHash': tokenHash,
        deletedAt: null,
    }).select('+refreshTokens');

    if (!user) {
        logger.warn({ msg: 'Refresh token reuse or forgery detected', ip, userAgent });
        throw new AppError('Refresh token is invalid or has been revoked', 401, 'TOKEN_INVALID');
    }

    const storedToken = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

    // console.log('storedToken:', storedToken);
    // console.log('expiresAt:', storedToken?.expiresAt);
    // console.log('now:', new Date());
    // console.log('expired?', storedToken && storedToken.expiresAt < new Date());

    if (!storedToken || storedToken.expiresAt < new Date()) {
        user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
        await user.save();
        throw new AppError('Refresh token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
    }

    if (!user.isActive) {
        throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);

    const { raw: newRaw, hash: newHash } = generateRefreshToken();

    user.refreshTokens.push({
        token: newRaw.slice(0, 8) + '…',
        tokenHash: newHash,
        userAgent: userAgent ?? storedToken.userAgent,
        ip: ip ?? storedToken.ip,
        expiresAt: refreshTokenExpiresAt(),
    });

    user.pruneRefreshTokens();
    await user.save();

    const accessToken = signAccessToken(user);

    logger.info({ msg: 'Refresh token rotated', userId: user._id });

    return { accessToken, rawRefreshToken: newRaw, user: sanitiseUser(user) };
};

const logout = async ({ rawToken }: LogoutParams): Promise<void> => {
    if (!rawToken) return;

    const tokenHash = hashRefreshToken(rawToken);

    await User.updateOne(
        { 'refreshTokens.tokenHash': tokenHash },
        { $pull: { refreshTokens: { tokenHash } } },
    );

    logger.info({ msg: 'User logged out — refresh token revoked' });
};

const logoutAll = async (userId: string): Promise<void> => {
    await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
    logger.info({ msg: 'All refresh tokens revoked', userId });
};

export default { register, signup, invite, login, refresh, logout, logoutAll };
