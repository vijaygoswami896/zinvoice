'use strict';

const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * authenticate
 *
 * Verifies the JWT access token from the Authorization header.
 * Populates req.user with the decoded payload on success.
 *
 * Expected header: Authorization: Bearer <token>
 *
 * On success, req.user contains:
 *   {
 *     id:   string  (user ObjectId)
 *     role: string  ('admin' | 'staff')
 *   }
 *
 * Usage:
 *   router.get('/resource', authenticate, controller.get);
 */
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Authentication required. Please provide a Bearer token.', 401, 'TOKEN_MISSING'));
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    if (!token) {
        return next(new AppError('Authentication token is empty', 401, 'TOKEN_MISSING'));
    }

    try {
        const payload = verifyAccessToken(token);

        // Attach minimal context — never attach sensitive fields
        req.user = {
            id: payload.sub,
            role: payload.role,
        };

        return next();
    } catch (err) {
        return next(err); // AppError from verifyAccessToken flows to errorHandler
    }
};

module.exports = authenticate;