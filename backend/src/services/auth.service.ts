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
import { generateOtp, hashOtp } from '../utils/otpUtils.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { LoginParams, LogoutParams, RefreshParams, RegisterParams, SanitisedUser } from '../types/index.js';

const REFRESH_TOKEN_MS = parseMs(env.JWT_REFRESH_EXPIRES_IN);
const OTP_EXPIRY_MS = 10 * 60 * 1000;   // 10 minutes
const MAX_ATTEMPTS = 3;

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
    const user = await User.findByEmailWithPassword(email) as InstanceType<typeof User> | null;;

    const DUMMY_HASH = '$2b$12$invalidhashpaddingtomatch.bcrypt.output.length.xxxxxxxxx';

    let passwordMatch = false;

    if (user) {
        passwordMatch = await user.comparePassword(password);
    } else {
        // Run a real bcrypt compare to consume equivalent time
        await bcrypt.compare(password, DUMMY_HASH);
        passwordMatch = false;
    }

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

    const tokenHash = hashRefreshToken(rawToken);

    const user = await User.findOne({
        'refreshTokens.tokenHash': tokenHash,
        deletedAt: null,
    }).select('+refreshTokens') as InstanceType<typeof User> | null;;

    if (!user) {
        logger.warn({ msg: 'Refresh token reuse or forgery detected', ip, userAgent });
        throw new AppError('Refresh token is invalid or has been revoked', 401, 'TOKEN_INVALID');
    }

    const storedToken = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

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

const requestOtp = async (email: string): Promise<void> => {
    const user = await User.findOne({ email: email.toLowerCase().trim(), deletedAt: null });

    // Silently return — don't reveal if email exists
    if (!user) return;

    const plainOtp = generateOtp();

    user.resetOtp = hashOtp(plainOtp);
    user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.resetOtpAttempts = 0;
    await user.save();

    await sendOtpEmail(user.email, plainOtp);
};

const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
): Promise<void> => {
    const user = await User.findOne({ email: email.toLowerCase().trim(), deletedAt: null })
        .select('+resetOtp +resetOtpExpires +resetOtpAttempts');

    // No user, or OTP was never issued
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
        // throw Object.assign(new Error('OTP is invalid or has expired.'), { status: 400 });
        throw new AppError('OTP is invalid or has expired.', 400, 'INVALID_OTP');
    }

    // Expired
    if (user.resetOtpExpires < new Date()) {
        user.resetOtp = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        await user.save();
        // throw Object.assign(new Error('OTP has expired. Please request a new one.'), { status: 400 });
        throw new AppError('OTP has expired. Please request a new one.', 400, 'OTP_EXPIRED');
    }

    // Too many attempts
    if (user.resetOtpAttempts >= MAX_ATTEMPTS) {
        user.resetOtp = null;
        user.resetOtpExpires = null;
        user.resetOtpAttempts = 0;
        await user.save();
        // throw Object.assign(new Error('Too many incorrect attempts. Please request a new OTP.'), { status: 400 });
        throw new AppError('Too many incorrect attempts. Please request a new OTP.', 400, 'OTP_MAX_ATTEMPTS');
    }

    // Wrong OTP
    if (hashOtp(otp) !== user.resetOtp) {
        user.resetOtpAttempts += 1;
        await user.save();
        const attemptsRemaining = MAX_ATTEMPTS - user.resetOtpAttempts;
        // return { attemptsRemaining };
        throw new AppError(
            `Incorrect OTP. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`,
            400,
            'INCORRECT_OTP',
        );
    }

    // ✅ Valid — update password
    // Your pre-save hook hashes passwordHash, so assign plain password to passwordHash
    user.passwordHash = newPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    await user.save();
};

export default {
    register,
    signup,
    invite,
    login,
    refresh,
    logout,
    logoutAll,
    requestOtp,
    resetPassword
};
