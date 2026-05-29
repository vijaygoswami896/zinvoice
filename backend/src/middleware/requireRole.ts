import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';
// import { AuthenticatedRequest } from '../types';

const requireRole = (...roles: string[]) => {
    if (roles.length === 0) {
        throw new Error('[requireRole] At least one role must be specified');
    }

    const allowedSet = new Set(roles);

    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401, 'TOKEN_MISSING'));
        }

        if (!allowedSet.has(req.user.role)) {
            return next(new AppError(
                `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
                403,
                'FORBIDDEN',
            ));
        }

        next();
    };
};

export default requireRole;

