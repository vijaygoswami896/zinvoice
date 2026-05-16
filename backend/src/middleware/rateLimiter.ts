import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse';
import env from '../config/env';

interface LimiterOptions {
    windowMs: number;
    max: number;
    code: string;
    message: string;
}

/**
 * Generic rate-limiter factory.
 * Reuses the standard API error format instead of the default text response.
 */
const createLimiter = ({ windowMs, max, code, message }: LimiterOptions) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,  // Return RateLimit-* headers (RFC 6585)
        legacyHeaders: false,   // Disable X-RateLimit-* headers
        skipSuccessfulRequests: false,
        handler: (_req, res) =>
            sendError(res, {
                message,
                status: 429,
                code,
            }),
    });

/**
 * General API rate limiter — applied to all /api/* routes.
 * Default: 100 requests per 15 minutes per IP.
 */
const apiLimiter = createLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
});

/**
 * Strict auth limiter — applied only to /api/v1/auth/* routes.
 * Default: 10 requests per 15 minutes per IP.
 */
const authLimiter = createLimiter({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_AUTH_MAX,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again later.',
});

export { apiLimiter, authLimiter };