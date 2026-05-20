import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';

import env from './config/env';
import requestLogger from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes/index';

const createApp = () => {
    const app = express();

    if (env.isProd) {
        app.set('trust proxy', 1);
    }

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'blob:'],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    frameSrc: ["'none'"],
                    upgradeInsecureRequests: env.isProd ? [] : null,
                },
            },
            crossOriginEmbedderPolicy: false,
            hsts: env.isProd
                ? { maxAge: 31536000, includeSubDomains: true, preload: true }
                : false,
        }),
    );

    const corsOptions: cors.CorsOptions = {
        origin: (origin, callback) => {
            if (!origin || origin === env.CLIENT_URL) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin '${origin}' not allowed`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
        maxAge: 86400,
    };

    app.options('*', cors(corsOptions));
    app.use(cors(corsOptions));
    app.use(cookieParser());

    app.use(requestLogger);

    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    app.use(mongoSanitize());

    app.use('/api', apiLimiter);
    app.use('/api/v1', routes);
    // app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

export default createApp;
