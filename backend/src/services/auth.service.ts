import { User } from '../models/user.model';
import AppError from '../utils/AppError';
import logger from '../middleware/logger';
import {
    signAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    refreshTokenExpiresAt,
} from '../utils/tokenUtils';

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
    rawToken: string;
    userAgent: string;
    ip: string;
}

interface LogoutParams {
    rawToken?: string;
}

interface SanitisedUser {
    id: unknown;
    name: string;
    email: string;
    role: string;
    businesses: unknown[];
    lastLoginAt: Date | null;
    createdAt: Date;
}

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
    const passwordMatch = user
        ? await user.comparePassword(password)
        : (await import('bcryptjs').then((m) => m.compare(password, DUMMY_HASH)), false);

    if (!user || !passwordMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact an administrator.', 403, 'ACCOUNT_INACTIVE');
    }

    const { raw, hash } = generateRefreshToken();

    user.removeExpiredTokens();
    user.refreshTokens.push({
        token: raw.slice(0, 8) + '…',
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

const refresh = async ({ rawToken, userAgent, ip }: RefreshParams) => {
    if (!rawToken) {
        throw new AppError('Refresh token not provided', 401, 'TOKEN_MISSING');
    }

    const tokenHash = hashRefreshToken(rawToken);

    const user = await User.findOne({
        'refreshTokens.tokenHash': tokenHash,
        deletedAt: null,
    }).select('+refreshTokens');

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

export default { register, login, refresh, logout, logoutAll };


// 'use strict';

// const { User } = require('../models/user.model');
// const AppError = require('../utils/AppError');
// const logger = require('../middleware/logger');
// const {
//     signAccessToken,
//     generateRefreshToken,
//     hashRefreshToken,
//     refreshTokenExpiresAt,
// } = require('../utils/tokenUtils');

// // ── Helpers ───────────────────────────────────────────────────────────────────

// /**
//  * Builds the safe user object returned in API responses.
//  * Strips all sensitive fields.
//  */
// const sanitiseUser = (user) => ({
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     businesses: user.businesses,
//     lastLoginAt: user.lastLoginAt,
//     createdAt: user.createdAt,
// });

// // ── Service methods ───────────────────────────────────────────────────────────

// /**
//  * Registers a new user.
//  * Only admins should be able to create other admins — enforced in the
//  * route layer via the `requireRole` middleware before this is called.
//  */
// const register = async ({ name, email, password, role }) => {
//     const existing = await User.findOne({ email, deletedAt: null });
//     if (existing) {
//         throw new AppError('An account with this email already exists', 409, 'EMAIL_TAKEN');
//     }

//     const user = new User({
//         name,
//         email,
//         // Pre-save hook will bcrypt this
//         passwordHash: password,
//         role,
//     });

//     await user.save();

//     logger.info({ msg: 'User registered', userId: user._id, role: user.role });

//     return sanitiseUser(user);
// };

// /**
//  * Authenticates a user with email + password.
//  * Returns a signed access token, a raw refresh token, and the sanitised user.
//  *
//  * Timing-safe: we always run bcrypt even for non-existent emails to
//  * prevent user enumeration via response time differences.
//  */
// const login = async ({ email, password, userAgent, ip }) => {
//     const user = await User.findByEmailWithPassword(email);

//     // Run bcrypt regardless of whether user exists — prevents timing attacks
//     const DUMMY_HASH = '$2b$12$invalidhashpaddingtomatch.bcrypt.output.length.xxxxxxxxx';
//     const passwordMatch = await (user
//         ? user.comparePassword(password)
//         : (await import('bcryptjs').then(m => m.default || m).then(b => b.compare(password, DUMMY_HASH)), false));

//     if (!user || !passwordMatch) {
//         throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
//     }

//     if (!user.isActive) {
//         throw new AppError('Your account has been deactivated. Please contact an administrator.', 403, 'ACCOUNT_INACTIVE');
//     }

//     // Generate and store refresh token
//     const { raw, hash } = generateRefreshToken();

//     user.removeExpiredTokens();
//     user.refreshTokens.push({
//         token: raw.slice(0, 8) + '…', // Store only a hint, never the full raw token
//         tokenHash: hash,
//         userAgent: userAgent || '',
//         ip: ip || '',
//         expiresAt: refreshTokenExpiresAt(),
//     });
//     user.pruneRefreshTokens();
//     user.lastLoginAt = new Date();

//     await user.save();

//     const accessToken = signAccessToken(user);

//     logger.info({ msg: 'User logged in', userId: user._id, ip });

//     return { accessToken, rawRefreshToken: raw, user: sanitiseUser(user) };
// };

// /**
//  * Rotates a refresh token.
//  *
//  * Refresh token rotation: each use issues a new refresh token and
//  * invalidates the old one. If a token is used twice, both are invalidated
//  * (detects theft via the "reuse detection" pattern).
//  */
// const refresh = async ({ rawToken, userAgent, ip }) => {
//     if (!rawToken) {
//         throw new AppError('Refresh token not provided', 401, 'TOKEN_MISSING');
//     }

//     const tokenHash = hashRefreshToken(rawToken);

//     // Find user who owns this token hash
//     const user = await User.findOne({
//         'refreshTokens.tokenHash': tokenHash,
//         deletedAt: null,
//     }).select('+refreshTokens');

//     if (!user) {
//         // Token not found — could be a replay attack with a stolen+used token.
//         // Log as a security event; nothing more we can do without knowing the user.
//         logger.warn({ msg: 'Refresh token reuse or forgery detected', ip, userAgent });
//         throw new AppError('Refresh token is invalid or has been revoked', 401, 'TOKEN_INVALID');
//     }

//     // Find the specific token subdocument
//     const storedToken = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

//     if (!storedToken || storedToken.expiresAt < new Date()) {
//         // Remove the expired token
//         user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);
//         await user.save();
//         throw new AppError('Refresh token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
//     }

//     if (!user.isActive) {
//         throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
//     }

//     // ── Rotation: remove old token, issue new one ─────────────────────────────
//     user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== tokenHash);

//     const { raw: newRaw, hash: newHash } = generateRefreshToken();

//     user.refreshTokens.push({
//         token: newRaw.slice(0, 8) + '…',
//         tokenHash: newHash,
//         userAgent: userAgent || storedToken.userAgent,
//         ip: ip || storedToken.ip,
//         expiresAt: refreshTokenExpiresAt(),
//     });

//     user.pruneRefreshTokens();
//     await user.save();

//     const accessToken = signAccessToken(user);

//     logger.info({ msg: 'Refresh token rotated', userId: user._id });

//     return { accessToken, rawRefreshToken: newRaw, user: sanitiseUser(user) };
// };

// /**
//  * Logs out a user by revoking the provided refresh token.
//  * If no token is provided, silently succeeds (idempotent logout).
//  */
// const logout = async ({ rawToken }) => {
//     if (!rawToken) return;

//     const tokenHash = hashRefreshToken(rawToken);

//     await User.updateOne(
//         { 'refreshTokens.tokenHash': tokenHash },
//         { $pull: { refreshTokens: { tokenHash } } },
//     );

//     logger.info({ msg: 'User logged out — refresh token revoked' });
// };

// /**
//  * Revokes ALL refresh tokens for a user (logout from all devices).
//  */
// const logoutAll = async (userId) => {
//     await User.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
//     logger.info({ msg: 'All refresh tokens revoked', userId });
// };

// module.exports = { register, login, refresh, logout, logoutAll };