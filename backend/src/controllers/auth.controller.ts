import { Request, Response } from 'express';
import authService from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { setRefreshCookie, clearRefreshCookie, getRefreshTokenFromCookie } from '../utils/tokenUtils';
import { AuthenticatedRequest } from '../types';

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

// debugger;
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
    console.log('##############rawToken: ', rawToken);
    const { userAgent, ip } = getClientMeta(req);
    console.log('##############userAgent,ip', userAgent, ip)

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
    await authService.logoutAll((req as AuthenticatedRequest).user.id);
    clearRefreshCookie(res);

    sendSuccess(res, {
        data: null,
        message: 'Logged out from all devices successfully',
    });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, {
        data: { user: (req as AuthenticatedRequest).user },
        message: 'User profile fetched',
    });
});

export default { register, login, refreshToken, logout, logoutAll, getMe };
