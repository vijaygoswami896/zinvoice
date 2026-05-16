import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

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


// 'use strict';

// const AppError = require('../utils/AppError');

// /**
//  * requireRole(...roles)
//  *
//  * Role-based access control middleware.
//  * Must be used AFTER `authenticate` since it reads req.user.
//  *
//  * @param {...string} roles - Allowed roles (e.g. 'admin', 'staff')
//  * @returns {import('express').RequestHandler}
//  *
//  * @example
//  *   // Only admins can access this route
//  *   router.post('/users', authenticate, requireRole('admin'), controller.create);
//  *
//  *   // Admins and staff can access this route
//  *   router.get('/invoices', authenticate, requireRole('admin', 'staff'), controller.list);
//  */
// const requireRole = (...roles) => {
//     if (roles.length === 0) {
//         throw new Error('[requireRole] At least one role must be specified');
//     }

//     const allowedSet = new Set(roles);

//     return (req, _res, next) => {
//         // authenticate must have run first
//         if (!req.user) {
//             return next(
//                 new AppError('Authentication required', 401, 'TOKEN_MISSING'),
//             );
//         }

//         if (!allowedSet.has(req.user.role)) {
//             return next(
//                 new AppError(
//                     `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
//                     403,
//                     'FORBIDDEN',
//                 ),
//             );
//         }

//         return next();
//     };
// };

// module.exports = requireRole;