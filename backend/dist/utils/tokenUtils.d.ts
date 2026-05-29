import { Request, Response } from 'express';
interface TokenUser {
    _id: {
        toString(): string;
    };
    role: string;
    businesses?: {
        toString(): string;
    }[];
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
export declare const parseMs: (str: string) => number;
export declare const signAccessToken: (user: TokenUser) => string;
export declare const verifyAccessToken: (token: string) => AccessTokenPayload;
export declare const generateRefreshToken: () => RefreshTokenPair;
export declare const hashRefreshToken: (raw: string) => string;
export declare const refreshTokenExpiresAt: () => Date;
export declare const REFRESH_COOKIE_NAME = "gst_rt";
export declare const setRefreshCookie: (res: Response, rawToken: string) => void;
export declare const clearRefreshCookie: (res: Response) => void;
export declare const getRefreshTokenFromCookie: (req: Request) => string | null;
export {};
