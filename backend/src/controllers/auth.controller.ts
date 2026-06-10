import { Request, Response } from 'express';
import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { setRefreshCookie, clearRefreshCookie, getRefreshTokenFromCookie } from '../utils/tokenUtils.js';
import { MSG_OTP_SENT } from '../constants/messages.js';
// import { AuthenticatedRequest } from '../types';

const getClientMeta = (req: Request) => ({
    userAgent: req.headers['user-agent'] ?? '',
    ip: req.ip ?? req.socket?.remoteAddress ?? '',
});

const signup = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.signup(req.body);
    sendSuccess(res, {
        data: { user },
        message: 'Account created successfully. You can now log in.',
        status: 201,
    });
});

const invite = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.invite(
        req.user!.businessId ?? req.user!.id,
        req.body,
    );
    sendSuccess(res, {
        data: { user },
        message: 'Staff account created successfully.',
        status: 201,
    });
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
    // console.log('##############rawToken: ', rawToken);
    const { userAgent, ip } = getClientMeta(req);
    // console.log('##############userAgent,ip', userAgent, ip)

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
    // await authService.logoutAll((req as AuthenticatedRequest).user.id);
    await authService.logoutAll(req.user!.id);
    clearRefreshCookie(res);

    sendSuccess(res, {
        data: null,
        message: 'Logged out from all devices successfully',
    });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, {
        // data: { user: (req as AuthenticatedRequest).user },
        data: { user: req.user },
        message: 'User profile fetched',
    });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.requestOtp(req.body.email);

    // Always same response — no user enumeration
    sendSuccess(res, {
        data: null,
        message: MSG_OTP_SENT
    })
});

const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);

    sendSuccess(res, {
        data: null,
        message: 'Password reset successfully.'
    })
})

export default { signup, invite, register, login, refreshToken, logout, logoutAll, getMe, forgotPassword, resetPassword };
