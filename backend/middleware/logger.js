'use strict';

const pino = require('pino');
const env = require('../config/env');

const redactPaths = [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    'req.body.passwordHash',
    'req.body.token',
    'req.body.refreshToken',
    '*.gstin',
    '*.pan',
    '*.bankAccountNumber',
    '*.ifsc',
];

const transport =
    env.isDev
        ? pino.transport({
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname',
            },
        })
        : undefined;

const logger = pino(
    {
        level: env.LOG_LEVEL,
        redact: {
            paths: redactPaths,
            censor: '[REDACTED]',
        },
        base: {
            env: env.NODE_ENV,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        serializers: {
            err: pino.stdSerializers.err,
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res,
        },
    },
    transport,
);

module.exports = logger;