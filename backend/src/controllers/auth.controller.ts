import { Request, Response } from 'express';
import authService from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { setRefreshCookie, clearRefreshCookie, getRefreshTokenFromCookie } from '../utils/tokenUtils';

const getClientMeta = (req: Request) => ({
    userAgent: req.headers['user-agent'] ?? '',
    ip: req.ip ?? req.socket?.remoteAddress ?? '',
});

const register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);

    sendSuccess(res, {
        data: { user },
        message: 'Account created successfully',
        status: 201,
    });
});

const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { userAgent, ip } = getClientMeta(req);

    const { accessToken, rawRefreshToken, user } = await authService.login({ email, password, userAgent, ip });

    setRefreshCookie(res, rawRefreshToken);

    sendSuccess(res, {
        data: { accessToken, user },
        message: 'Logged in successfully',
    });
});

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const rawToken = getRefreshTokenFromCookie(req);
    const { userAgent, ip } = getClientMeta(req);

    const { accessToken, rawRefreshToken, user } = await authService.refresh({ rawToken, userAgent, ip });

    setRefreshCookie(res, rawRefreshToken);

    sendSuccess(res, {
        data: { accessToken, user },
        message: 'Token refreshed successfully',
    });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
    const rawToken = getRefreshTokenFromCookie(req);

    await authService.logout({ rawToken });
    clearRefreshCookie(res);

    sendSuccess(res, {
        data: null,
        message: 'Logged out successfully',
    });
});

const logoutAll = asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res);

    sendSuccess(res, {
        data: null,
        message: 'Logged out from all devices successfully',
    });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, {
        data: { user: req.user },
        message: 'User profile fetched',
    });
});

export default { register, login, refreshToken, logout, logoutAll, getMe };



// 'use strict';

// const authService = require('../services/auth.service');
// const asyncHandler = require('../utils/asyncHandler');
// const { sendSuccess } = require('../utils/apiResponse');
// const {
//     setRefreshCookie,
//     clearRefreshCookie,
//     getRefreshTokenFromCookie,
// } = require('../utils/tokenUtils');

// // ── Helpers ───────────────────────────────────────────────────────────────────

// const getClientMeta = (req) => ({
//     userAgent: req.headers['user-agent'] || '',
//     ip: req.ip || req.socket?.remoteAddress || '',
// });

// // ── Controllers ───────────────────────────────────────────────────────────────

// /**
//  * POST /api/v1/auth/register
//  *
//  * Creates a new user account.
//  * Role defaults to 'staff'. Creating an 'admin' requires the caller to
//  * already be an admin (enforced by requireRole middleware on the route).
//  */
// const register = asyncHandler(async (req, res) => {
//     const user = await authService.register(req.body);

//     return sendSuccess(res, {
//         data: { user },
//         message: 'Account created successfully',
//         status: 201,
//     });
// });

// /**
//  * POST /api/v1/auth/login
//  *
//  * Authenticates a user. Returns:
//  *   - accessToken in the JSON body (stored in memory on the client)
//  *   - refreshToken as an httpOnly cookie (never accessible to JS)
//  */
// const login = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     const { userAgent, ip } = getClientMeta(req);

//     const { accessToken, rawRefreshToken, user } = await authService.login({
//         email,
//         password,
//         userAgent,
//         ip,
//     });

//     setRefreshCookie(res, rawRefreshToken);

//     return sendSuccess(res, {
//         data: { accessToken, user },
//         message: 'Logged in successfully',
//     });
// });

// /**
//  * POST /api/v1/auth/refresh
//  *
//  * Issues a new access token using the httpOnly refresh token cookie.
//  * Also rotates the refresh token (old one is invalidated, new one set).
//  */
// const refreshToken = asyncHandler(async (req, res) => {
//     const rawToken = getRefreshTokenFromCookie(req);
//     const { userAgent, ip } = getClientMeta(req);

//     const { accessToken, rawRefreshToken, user } = await authService.refresh({
//         rawToken,
//         userAgent,
//         ip,
//     });

//     setRefreshCookie(res, rawRefreshToken);

//     return sendSuccess(res, {
//         data: { accessToken, user },
//         message: 'Token refreshed successfully',
//     });
// });

// /**
//  * POST /api/v1/auth/logout
//  *
//  * Revokes the current refresh token and clears the cookie.
//  */
// const logout = asyncHandler(async (req, res) => {
//     const rawToken = getRefreshTokenFromCookie(req);

//     await authService.logout({ rawToken });

//     clearRefreshCookie(res);

//     return sendSuccess(res, {
//         data: null,
//         message: 'Logged out successfully',
//     });
// });

// /**
//  * POST /api/v1/auth/logout-all
//  *
//  * Revokes ALL refresh tokens for the authenticated user.
//  * Requires a valid access token.
//  */
// const logoutAll = asyncHandler(async (req, res) => {
//     await authService.logoutAll(req.user.id);

//     clearRefreshCookie(res);

//     return sendSuccess(res, {
//         data: null,
//         message: 'Logged out from all devices successfully',
//     });
// });

// /**
//  * GET /api/v1/auth/me
//  *
//  * Returns the currently authenticated user's profile.
//  * Lightweight — reads from the JWT payload (no DB call).
//  */
// const getMe = asyncHandler(async (req, res) => {
//     // req.user is populated by the authenticate middleware
//     return sendSuccess(res, {
//         data: { user: req.user },
//         message: 'User profile fetched',
//     });
// });

// module.exports = { register, login, refreshToken, logout, logoutAll, getMe };