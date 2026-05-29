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
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    customSuccessMessage: (req, res) => `${req.method} ${req.url} — ${res.statusCode}`,
    customErrorMessage: (req, res, err) => `${req.method} ${req.url} — ${res.statusCode} — ${err.message}`,
    autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/api/v1/health',
    },
    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
                ip: req.remoteAddress,
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
    // In dev, log at debug level for 2xx, info for others
    customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        return env.isDev ? 'debug' : 'info';
    },
});
export default requestLogger;
//# sourceMappingURL=requestLogger.js.map