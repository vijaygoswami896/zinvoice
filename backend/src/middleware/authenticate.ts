import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import logger from './logger.js';

const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    // const { user } = req;

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
        // console.log('payload: ', payload)

        req.user = {
            id: payload.sub,
            role: payload.role,
            businessId: payload.businessId ?? undefined,
        };

        next();
    } catch (err) {
        next(err);
    }
};

export default authenticate;
