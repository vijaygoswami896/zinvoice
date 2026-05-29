import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import logger from './logger.js';
import env from '../config/env.js';

/**
 * HTTP request/response logger using pino-http.
 * Attaches a unique requestId to each request and logs
 * method, url, status, and response time.
 *
 * Skips logging for health-check endpoints to reduce noise.
 */
const requestLogger = pinoHttp({
    logger,
    genReqId: (req: any) => req.headers['x-request-id'] || randomUUID(),
    customSuccessMessage: (req: any, res: any) =>
        `${req.method} ${req.url} — ${res.statusCode}`,
    customErrorMessage: (req: any, res: any, err: any) =>
        `${req.method} ${req.url} — ${res.statusCode} — ${err.message}`,
    autoLogging: {
        ignore: (req: any) => req.url === '/health' || req.url === '/api/v1/health',
    },
    serializers: {
        req(req: any) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
                ip: req.remoteAddress,
            };
        },
        res(res: any) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
    // In dev, log at debug level for 2xx, info for others
    customLogLevel: (_req: any, res: any, err: any) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return env.isDev ? 'debug' : 'info';
    },
});

export default requestLogger;