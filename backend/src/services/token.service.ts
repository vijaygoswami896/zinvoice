import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import env from '../config/env';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenUser {
    id: { toString(): string };
    email: string;
    role: string;
    businessId?: { toString(): string } | null;
}

interface AccessTokenPayload {
    sub: string;
    email: string;
    role: string;
    businessId: string | null;
}

interface RefreshToken {
    token: string;
    family: string;
    expiresAt: Date;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const REFRESH_TOKEN_COOKIE = 'gst_rt';

const COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: env.isProd,
    path: '/api/v1/auth',
};

const JWT_OPTIONS: SignOptions & VerifyOptions = {
    issuer: 'gst-billing',
    audience: 'gst-billing-client',
};

// ── Access token ──────────────────────────────────────────────────────────────

export const signAccessToken = (user: TokenUser): string =>
    jwt.sign(
        {
            sub: user.id.toString(),
            email: user.email,
            role: user.role,
            businessId: user.businessId ? user.businessId.toString() : null,
        },
        env.JWT_SECRET,
        {
            ...JWT_OPTIONS,
            expiresIn: env.JWT_EXPIRES_IN as unknown as number,
        },
    );

export const verifyAccessToken = (token: string): AccessTokenPayload =>
    jwt.verify(token, env.JWT_SECRET, JWT_OPTIONS) as AccessTokenPayload;

// ── Refresh token ─────────────────────────────────────────────────────────────

export const generateRefreshToken = (): RefreshToken => {
    const token = crypto.randomBytes(64).toString('hex');
    const family = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return { token, family, expiresAt };
};

export const rotateRefreshToken = (family: string): RefreshToken => {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return { token, family, expiresAt };
};

// ── Cookie helpers ────────────────────────────────────────────────────────────

export const setRefreshTokenCookie = (res: Response, token: string, expiresAt: Date): void => {
    res.cookie(REFRESH_TOKEN_COOKIE, token, { ...COOKIE_BASE_OPTIONS, expires: expiresAt });
};

export const clearRefreshTokenCookie = (res: Response): void => {
    res.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_BASE_OPTIONS);
};

export const getRefreshTokenFromCookie = (req: Request): string | undefined =>
    req.cookies?.[REFRESH_TOKEN_COOKIE];



// 'use strict';

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const env = require('../config/env');

// // ── Constants ─────────────────────────────────────────────────────────────────

// const REFRESH_TOKEN_COOKIE = 'gst_rt';

// const COOKIE_BASE_OPTIONS = {
//     httpOnly: true,
//     sameSite: 'strict',
//     secure: env.isProd,
//     path: '/api/v1/auth', // Scoped: browser only sends cookie to auth routes
// };

// // ── Access token (JWT) ────────────────────────────────────────────────────────

// /**
//  * Signs a short-lived access JWT.
//  *
//  * Payload is intentionally minimal — just what middleware needs to
//  * identify the user and authorise without a DB lookup on every request.
//  *
//  * @param {{ id: string, email: string, role: string, businessId: string|null }} user
//  * @returns {string} Signed JWT
//  */
// const signAccessToken = (user) =>
//     jwt.sign(
//         {
//             sub: user.id.toString(),
//             email: user.email,
//             role: user.role,
//             businessId: user.businessId ? user.businessId.toString() : null,
//         },
//         env.JWT_SECRET,
//         {
//             expiresIn: env.JWT_EXPIRES_IN,
//             issuer: 'gst-billing',
//             audience: 'gst-billing-client',
//         },
//     );

// /**
//  * Verifies and decodes an access JWT.
//  * Throws JsonWebTokenError or TokenExpiredError on failure.
//  *
//  * @param {string} token
//  * @returns {object} Decoded payload
//  */
// const verifyAccessToken = (token) =>
//     jwt.verify(token, env.JWT_SECRET, {
//         issuer: 'gst-billing',
//         audience: 'gst-billing-client',
//     });

// // ── Refresh token ─────────────────────────────────────────────────────────────

// /**
//  * Generates a cryptographically random refresh token string.
//  * Not a JWT — stored in DB for rotation and revocation control.
//  *
//  * @returns {{ token: string, family: string, expiresAt: Date }}
//  */
// const generateRefreshToken = () => {
//     const token = crypto.randomBytes(64).toString('hex');
//     const family = crypto.randomBytes(16).toString('hex'); // Token family for reuse detection

//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

//     return { token, family, expiresAt };
// };

// /**
//  * Creates a rotated refresh token, carrying the original family ID.
//  * Used when rotating: old token → new token, same family.
//  *
//  * @param {string} family - Family ID from the token being replaced
//  * @returns {{ token: string, family: string, expiresAt: Date }}
//  */
// const rotateRefreshToken = (family) => {
//     const token = crypto.randomBytes(64).toString('hex');

//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);

//     return { token, family, expiresAt };
// };

// // ── Cookie helpers ────────────────────────────────────────────────────────────

// /**
//  * Sets the refresh token as an httpOnly cookie on the response.
//  *
//  * @param {import('express').Response} res
//  * @param {string} token
//  * @param {Date}   expiresAt
//  */
// const setRefreshTokenCookie = (res, token, expiresAt) => {
//     res.cookie(REFRESH_TOKEN_COOKIE, token, {
//         ...COOKIE_BASE_OPTIONS,
//         expires: expiresAt,
//     });
// };

// /**
//  * Clears the refresh token cookie (logout).
//  *
//  * @param {import('express').Response} res
//  */
// const clearRefreshTokenCookie = (res) => {
//     res.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_BASE_OPTIONS);
// };

// /**
//  * Reads the refresh token from the httpOnly cookie.
//  *
//  * @param {import('express').Request} req
//  * @returns {string|undefined}
//  */
// const getRefreshTokenFromCookie = (req) => req.cookies?.[REFRESH_TOKEN_COOKIE];

// module.exports = {
//     signAccessToken,
//     verifyAccessToken,
//     generateRefreshToken,
//     rotateRefreshToken,
//     setRefreshTokenCookie,
//     clearRefreshTokenCookie,
//     getRefreshTokenFromCookie,
//     REFRESH_TOKEN_COOKIE,
// };
