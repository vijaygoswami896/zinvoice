import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { verifyAccessToken } from '../utils/tokenUtils';
import { AuthenticatedRequest } from '../types';

const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    const { user } = req as AuthenticatedRequest;

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('Authentication required. Please provide a Bearer token.', 401, 'TOKEN_MISSING'));
    }

    const token = authHeader.slice(7);

    if (!token) {
        return next(new AppError('Authentication token is empty', 401, 'TOKEN_MISSING'));
    }

    try {
        const payload = verifyAccessToken(token);

        (req as AuthenticatedRequest).user = {
            id: payload.sub,
            role: payload.role,
        };

        next();
    } catch (err) {
        next(err);
    }
};

export default authenticate;
