import { Router } from 'express';
import * as controller from '../controllers/dashboard.controller.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/dashboard
 * Full dashboard payload — summary + monthly revenue + GST + recent invoices + top customers.
 * Query: ?revenueMonths=12 (default 12, max 24)
 */
router.get('/', controller.getDashboard);

/**
 * GET /api/v1/dashboard/summary
 * Lightweight summary cards only.
 */
router.get('/summary', controller.getSummary);

/**
 * GET /api/v1/dashboard/revenue?months=12
 * Monthly revenue chart data.
 */
router.get('/revenue', controller.getRevenue);

export default router;