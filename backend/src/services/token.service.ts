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

