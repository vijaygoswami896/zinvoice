/**
 * General API rate limiter — applied to all /api/* routes.
 * Default: 100 requests per 15 minutes per IP.
 */
declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict auth limiter — applied only to /api/v1/auth/* routes.
 * Default: 10 requests per 15 minutes per IP.
 */
declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export { apiLimiter, authLimiter };
