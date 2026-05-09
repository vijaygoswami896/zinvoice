'use strict';

const { Router } = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');

const router = Router();

/**
 * GET /api/v1/health
 *
 * Returns server and database status.
 * Used by load balancers, container orchestrators, and uptime monitors.
 */
router.get('/', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    // const dbState = 1;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    }[dbState] || 'unknown';

    const isHealthy = dbState === 1;

    return sendSuccess(res, {
        data: {
            status: isHealthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV,
            database: dbStatus,
        },
        message: isHealthy ? 'All systems operational' : 'Service degraded',
        status: isHealthy ? 200 : 503,
    });
});

module.exports = router;