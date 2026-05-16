import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import settingsRoutes from './auth.routes';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/settings', settingsRoutes);

export default router;



// 'use strict';

// const { Router } = require('express');
// const healthRoutes = require('./health.routes');
// const { authLimiter } = require('../middleware/rateLimiter');

// const router = Router();

// /**
//  * Central route registry.
//  * Mount feature routes here as they are built.
//  *
//  * Order matters: more specific paths before generic ones.
//  */

// // Core
// router.use('/health', healthRoutes);
// router.use('/auth', authLimiter, require('./auth.routes'));
// router.use('/settings', require('./settings.routes'));
// // router.use('/customers', require('./customer.routes'));

// // Feature routes — uncomment and add as implemented:
// // router.use('/products',   require('./product.routes'));
// // router.use('/invoices',   require('./invoice.routes'));
// // router.use('/payments',   require('./payment.routes'));
// // router.use('/reports',    require('./report.routes'));

// module.exports = router;