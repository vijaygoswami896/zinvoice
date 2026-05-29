import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import AppError from './appError.js';
// ── Token lifetimes ───────────────────────────────────────────────────────────
export const parseMs = (str) => {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = String(str).match(/^(\d+)([smhd])$/);
    if (!match)
        throw new Error(`Invalid time string: ${str}`);
    return parseInt(match[1], 10) * units[match[2]];
};
const ACCESS_TOKEN_MS = parseMs(env.JWT_EXPIRES_IN);
const REFRESH_TOKEN_MS = parseMs(env.JWT_REFRESH_EXPIRES_IN);
const JWT_OPTIONS = {
    issuer: 'gst-billing',
    audience: 'gst-billing-client',
};
// ── Access token ──────────────────────────────────────────────────────────────
export const signAccessToken = (user) => jwt.sign({
    sub: user._id.toString(),
    role: user.role,
    businessId: user.businesses?.[0]?.toString() ?? null,
}, env.JWT_SECRET, { ...JWT_OPTIONS, expiresIn: ACCESS_TOKEN_MS });
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, JWT_OPTIONS);
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
        }
        throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
    }
};
// ── Refresh token ─────────────────────────────────────────────────────────────
export const generateRefreshToken = () => {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hash };
};
export const hashRefreshToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');
export const refreshTokenExpiresAt = () => new Date(Date.now() + REFRESH_TOKEN_MS);
// ── Cookie helpers ────────────────────────────────────────────────────────────
export const REFRESH_COOKIE_NAME = 'gst_rt';
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict',
    path: '/api/v1/auth/refresh',
};
export const setRefreshCookie = (res, rawToken) => {
    res.cookie(REFRESH_COOKIE_NAME, rawToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MS });
};
export const clearRefreshCookie = (res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
};
export const getRefreshTokenFromCookie = (req) => {
    // console.log('req.cookies?.[REFRESH_COOKIE_NAME]: ', req.cookies?.[REFRESH_COOKIE_NAME])
    return req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
};
//# sourceMappingURL=tokenUtils.js.map