import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';
const router = Router();
const DB_STATES = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};
router.get('/', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = DB_STATES[dbState] ?? 'unknown';
    const isHealthy = dbState === 1;
    sendSuccess(res, {
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
export default router;
//# sourceMappingURL=health.routes.js.map