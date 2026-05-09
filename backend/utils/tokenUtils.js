'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('./AppError');

// ── Token lifetimes (ms) ──────────────────────────────────────────────────────
const parseMs = (str) => {
    const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

    const match = String(str).match(/^(\d+)([smhd])$/);

    if (!match) throw new Error(`Invalid time string: ${str}`);
    return parseInt(match[1], 10) * units[match[2]];
};

const ACCESS_TOKEN_MS = parseMs(env.JWT_EXPIRES_IN);
const REFRESH_TOKEN_MS = parseMs(env.JWT_REFRESH_EXPIRES_IN);

// ── Access token ──────────────────────────────────────────────────────────────

/**
 * Signs a short-lived JWT access token.
 *
 * Payload contains only what middleware needs — no PII in token body.
 */
const signAccessToken = (user) =>
    jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            // businessId injected after business context middleware — not here
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN,
            issuer: 'gst-billing',
            audience: 'gst-billing-client',
        },
    );

/**
 * Verifies a JWT access token.
 * Throws AppError on invalid/expired tokens.
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, {
            issuer: 'gst-billing',
            audience: 'gst-billing-client',
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
        }
        throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
    }
};

// ── Refresh token ─────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically random opaque refresh token.
 * Returns both the raw token (for the cookie) and its SHA-256 hash
 * (for storage in MongoDB — never store raw tokens).
 */
const generateRefreshToken = () => {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hash };
};

/**
 * Hashes a raw refresh token for DB lookup.
 */
const hashRefreshToken = (raw) =>
    crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Returns the expiry Date for a new refresh token.
 */
const refreshTokenExpiresAt = () => new Date(Date.now() + REFRESH_TOKEN_MS);

// ── Cookie helpers ────────────────────────────────────────────────────────────

const REFRESH_COOKIE_NAME = 'gst_rt';

/**
 * Sets the refresh token as an httpOnly, Secure, SameSite=Strict cookie.
 * Path is scoped to the refresh endpoint only — reduces attack surface.
 */
const setRefreshCookie = (res, rawToken) => {
    res.cookie(REFRESH_COOKIE_NAME, rawToken, {
        httpOnly: true,
        secure: env.isProd,
        sameSite: 'strict',
        path: '/api/v1/auth/refresh', // Cookie only sent to this path
        maxAge: REFRESH_TOKEN_MS,
    });
};

/**
 * Clears the refresh token cookie.
 */
const clearRefreshCookie = (res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.isProd,
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
    });
};

/**
 * Reads the raw refresh token from the request cookie.
 */
const getRefreshTokenFromCookie = (req) => req.cookies?.[REFRESH_COOKIE_NAME] || null;

module.exports = {
    signAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    refreshTokenExpiresAt,
    setRefreshCookie,
    clearRefreshCookie,
    getRefreshTokenFromCookie,
    REFRESH_COOKIE_NAME,
};