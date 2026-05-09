'use strict';

// Load env vars before anything else
require('dotenv').config();

const env = require('./config/env');
// const logger = require('./config/logger');
const logger = require('./middleware/logger');
const { connectDB, disconnectDB } = require('./config/db');
const createApp = require('./app');

let server;

const start = async () => {
    // 1. Connect to MongoDB first — fail fast if unavailable
    await connectDB();

    // 2. Build the Express app
    const app = createApp();

    // 3. Start listening
    server = app.listen(env.PORT, () => {
        logger.info({
            msg: `Server started`,
            port: env.PORT,
            env: env.NODE_ENV,
            pid: process.pid,
        });
    });

    // Handle cases where the port is already in use
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error({ msg: `Port ${env.PORT} is already in use`, err });
        } else {
            logger.error({ msg: 'Server error', err });
        }
        process.exit(1);
    });
};

/**
 * Graceful shutdown.
 * Stops accepting new connections, waits for in-flight requests to complete,
 * then closes the DB connection.
 */
const shutdown = async (signal) => {
    logger.info({ msg: `${signal} received — starting graceful shutdown` });

    if (!server) {
        await disconnectDB();
        process.exit(0);
        return;
    }

    server.close(async (err) => {
        if (err) {
            logger.error({ msg: 'Error during server close', err });
            process.exit(1);
        }

        await disconnectDB();
        logger.info({ msg: 'Graceful shutdown complete' });
        process.exit(0);
    });

    // Force-kill if shutdown takes too long (e.g. stuck requests)
    setTimeout(() => {
        logger.error({ msg: 'Graceful shutdown timed out — forcing exit' });
        process.exit(1);
    }, 15_000).unref();
};

// ── Process signal handlers ───────────────────────────────────────────────────

process.on('SIGTERM', () => shutdown('SIGTERM')); // Container/orchestrator stop
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C in dev

// Catch unhandled promise rejections (programming errors, not operational)
process.on('unhandledRejection', (reason) => {
    logger.error({ msg: 'Unhandled promise rejection', reason });
    shutdown('unhandledRejection');
});

// Catch synchronous throws outside request scope
process.on('uncaughtException', (err) => {
    logger.fatal({ msg: 'Uncaught exception', err });
    shutdown('uncaughtException');
});

// ── Boot ─────────────────────────────────────────────────────────────────────
start();