import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response } from 'express';
import env from '../config/env';
import AppError from './appError';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TokenUser {
    _id: { toString(): string };
    role: string;
    businesses?: { toString(): string }[];
}

interface AccessTokenPayload {
    sub: string;
    role: string;
    businessId: string | null;
    iat: number;
    exp: number;
}

interface RefreshTokenPair {
    raw: string;
    hash: string;
}

// ── Token lifetimes ───────────────────────────────────────────────────────────

export const parseMs = (str: string): number => {
    const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const match = String(str).match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid time string: ${str}`);
    return parseInt(match[1], 10) * units[match[2]];
};

const ACCESS_TOKEN_MS = parseMs(env.JWT_EXPIRES_IN);
const REFRESH_TOKEN_MS = parseMs(env.JWT_REFRESH_EXPIRES_IN);

const JWT_OPTIONS: SignOptions & VerifyOptions = {
    issuer: 'gst-billing',
    audience: 'gst-billing-client',
};

// ── Access token ──────────────────────────────────────────────────────────────

export const signAccessToken = (user: TokenUser): string =>
    jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            businessId: user.businesses?.[0]?.toString() ?? null,
        },
        env.JWT_SECRET,
        { ...JWT_OPTIONS, expiresIn: ACCESS_TOKEN_MS },
    );

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    try {
        return jwt.verify(token, env.JWT_SECRET, JWT_OPTIONS) as AccessTokenPayload;
    } catch (err) {
        if ((err as Error).name === 'TokenExpiredError') {
            throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
        }
        throw new AppError('Invalid access token', 401, 'TOKEN_INVALID');
    }
};

// ── Refresh token ─────────────────────────────────────────────────────────────

export const generateRefreshToken = (): RefreshTokenPair => {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hash };
};

export const hashRefreshToken = (raw: string): string =>
    crypto.createHash('sha256').update(raw).digest('hex');

export const refreshTokenExpiresAt = (): Date =>
    new Date(Date.now() + REFRESH_TOKEN_MS);

// ── Cookie helpers ────────────────────────────────────────────────────────────

export const REFRESH_COOKIE_NAME = 'gst_rt';

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict' as const,
    path: '/api/v1/auth/refresh',
};

export const setRefreshCookie = (res: Response, rawToken: string): void => {
    res.cookie(REFRESH_COOKIE_NAME, rawToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_MS });
};

export const clearRefreshCookie = (res: Response): void => {
    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
};

export const getRefreshTokenFromCookie = (req: Request): string | null => {
    // console.log('req.cookies?.[REFRESH_COOKIE_NAME]: ', req.cookies?.[REFRESH_COOKIE_NAME])
    return req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
}
