'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const createApp = () => {
    const app = express();

    // ── 1. Trust proxy (required when behind Nginx, load balancers, etc.) ──────
    if (env.isProd) {
        app.set('trust proxy', 1);
    }

    // ── 2. Security headers (Helmet) ────────────────────────────────────────────
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
            crossOriginEmbedderPolicy: false, // Required for PDF blob serving
            hsts: env.isProd
                ? { maxAge: 31536000, includeSubDomains: true, preload: true }
                : false,
        }),
    );

    // ── 3. CORS ─────────────────────────────────────────────────────────────────
    const corsOptions = {
        origin: (origin, callback) => {
            // Allow server-to-server (no origin) and the configured client URL
            const allowed = [env.CLIENT_URL];
            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin '${origin}' not allowed`));
            }
        },
        credentials: true, // Required for httpOnly cookie refresh tokens
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining'],
        maxAge: 86400, // Pre-flight cache: 24 hours
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions)); // Handle pre-flight for all routes

    // ── 4. Request logging ───────────────────────────────────────────────────────
    app.use(requestLogger);

    // ── 5. Body parsers ──────────────────────────────────────────────────────────
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // ── 6. NoSQL injection sanitisation ─────────────────────────────────────────
    // Strips $ and . from user-supplied keys before they reach Mongoose
    app.use(mongoSanitize());

    // ── 7. General API rate limiting ─────────────────────────────────────────────
    app.use('/api', apiLimiter);

    // ── 8. Feature routes ────────────────────────────────────────────────────────
    app.use('/api/v1', routes);

    app.use('/uploads', express.static(path.join(process.cwd(), 'storage/uploads')));

    // ── 9. 404 — must come after all valid routes ─────────────────────────────────
    app.use(notFoundHandler);

    // ── 10. Global error handler — must be last ────────────────────────────────
    app.use(errorHandler);

    return app;
};

module.exports = createApp;