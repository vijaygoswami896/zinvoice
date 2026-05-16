import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

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

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    app.use(requestLogger);

    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    app.use(mongoSanitize());

    app.use('/api', apiLimiter);
    app.use('/api/v1', routes);
    app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
};

export default createApp;


// import path from 'path';
// import express from 'express';
// import helmet from 'helmet';
// import cors from 'cors';
// import mongoSanitize from 'express-mongo-sanitize';

// import env from './config/env';
// import requestLogger from './middleware/requestLogger';
// import { apiLimiter } from './middleware/rateLimiter';
// import { errorHandler, notFoundHandler } from './middleware/errorHandler';
// import routes from './routes/index';

// const createApp = () => {
//     const app = express();

//     // ── 1. Trust proxy (required when behind Nginx, load balancers, etc.) ──────
//     if (env.isProd) {
//         app.set('trust proxy', 1);
//     }

//     // ── 2. Security headers (Helmet) ────────────────────────────────────────────
//     app.use(
//         helmet({
//             contentSecurityPolicy: {
//                 directives: {
//                     defaultSrc: ["'self'"],
//                     scriptSrc: ["'self'"],
//                     styleSrc: ["'self'", "'unsafe-inline'"],
//                     imgSrc: ["'self'", 'data:', 'blob:'],
//                     fontSrc: ["'self'"],
//                     objectSrc: ["'none'"],
//                     frameSrc: ["'none'"],
//                     upgradeInsecureRequests: env.isProd ? [] : null,
//                 },
//             },
//             crossOriginEmbedderPolicy: false,
//             hsts: env.isProd
//                 ? { maxAge: 31536000, includeSubDomains: true, preload: true }
//                 : false,
//         }),
//     );

//     // ── 3. CORS ─────────────────────────────────────────────────────────────────
//     const corsOptions: cors.CorsOptions = {
//         origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//             const allowed = [env.CLIENT_URL];
//             if (!origin || allowed.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error(`CORS: origin '${origin}' not allowed`));
//             }
//         },
//         credentials: true,
//         methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//         allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
//         exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
//         maxAge: 86400,
//     };

//     app.use(cors(corsOptions));
//     app.options('*', cors(corsOptions));

//     // ── 4. Request logging ───────────────────────────────────────────────────────
//     app.use(requestLogger);

//     // ── 5. Body parsers ──────────────────────────────────────────────────────────
//     app.use(express.json({ limit: '10kb' }));
//     app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//     // ── 6. NoSQL injection sanitisation ─────────────────────────────────────────
//     app.use(mongoSanitize());

//     // ── 7. General API rate limiting ─────────────────────────────────────────────
//     app.use('/api', apiLimiter);

//     // ── 8. Feature routes ────────────────────────────────────────────────────────
//     app.use('/api/v1', routes);

//     app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

//     // ── 9. 404 ────────────────────────────────────────────────────────────────────
//     app.use(notFoundHandler);

//     // ── 10. Global error handler ──────────────────────────────────────────────────
//     app.use(errorHandler);

//     return app;
// };

// export default createApp;


// // import path from 'path';         // ✅ built-in, no extension
// // import express from 'express';
// // import helmet from 'helmet';
// // import cors from 'cors';
// // import mongoSanitize from 'express-mongo-sanitize';

// // import env from './config/env.js';
// // import requestLogger from './middleware/requestLogger';
// // import { apiLimiter } from './middleware/rateLimiter';
// // import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
// // import routes from './routes/index';

// // const createApp = () => {
// //     const app = express();

// //     // ── 1. Trust proxy (required when behind Nginx, load balancers, etc.) ──────
// //     if (env.isProd) {
// //         app.set('trust proxy', 1);
// //     }

// //     // ── 2. Security headers (Helmet) ────────────────────────────────────────────
// //     app.use(
// //         helmet({
// //             contentSecurityPolicy: {
// //                 directives: {
// //                     defaultSrc: ["'self'"],
// //                     scriptSrc: ["'self'"],
// //                     styleSrc: ["'self'", "'unsafe-inline'"],
// //                     imgSrc: ["'self'", 'data:', 'blob:'],
// //                     fontSrc: ["'self'"],
// //                     objectSrc: ["'none'"],
// //                     frameSrc: ["'none'"],
// //                     upgradeInsecureRequests: env.isProd ? [] : null,
// //                 },
// //             },
// //             crossOriginEmbedderPolicy: false,
// //             hsts: env.isProd
// //                 ? { maxAge: 31536000, includeSubDomains: true, preload: true }
// //                 : false,
// //         }),
// //     );

// //     // ── 3. CORS ─────────────────────────────────────────────────────────────────
// //     const corsOptions = {
// //         origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
// //             const allowed = [env.CLIENT_URL];
// //             if (!origin || allowed.includes(origin)) {
// //                 callback(null, true);
// //             } else {
// //                 callback(new Error(`CORS: origin '${origin}' not allowed`));
// //             }
// //         },
// //         credentials: true,
// //         methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //         allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
// //         exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
// //         maxAge: 86400,
// //     };

// //     app.use(cors(corsOptions));
// //     app.options('*', cors(corsOptions));

// //     // ── 4. Request logging ───────────────────────────────────────────────────────
// //     app.use(requestLogger);

// //     // ── 5. Body parsers ──────────────────────────────────────────────────────────
// //     app.use(express.json({ limit: '10kb' }));
// //     app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// //     // ── 6. NoSQL injection sanitisation ─────────────────────────────────────────
// //     app.use(mongoSanitize());

// //     // ── 7. General API rate limiting ─────────────────────────────────────────────
// //     app.use('/api', apiLimiter);

// //     // ── 8. Feature routes ────────────────────────────────────────────────────────
// //     app.use('/api/v1', routes);

// //     app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

// //     // ── 9. 404 ────────────────────────────────────────────────────────────────────
// //     app.use(notFoundHandler);

// //     // ── 10. Global error handler ──────────────────────────────────────────────────
// //     app.use(errorHandler);

// //     return app;
// // };

// // export default createApp;