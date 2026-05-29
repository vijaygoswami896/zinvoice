import { Request, Response } from 'express';
import { z } from 'zod';

import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import getBusinessId from '../utils/getBusinessId.js';

// const bizId = (req: Request): string => req.user.businessId || req.user.id;

const QuerySchema = z.object({
    revenueMonths: z.coerce.number().int().min(3).max(24).default(12),
});

/**
 * GET /api/v1/dashboard
 *
 * Returns the complete dashboard payload in a single request.
 * All aggregations run in parallel — typical response time 50–150 ms.
 */
const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const query = QuerySchema.parse(req.query);
    const data = await dashboardService.getDashboardData(getBusinessId(req), query);
    sendSuccess(res, { data, message: 'Dashboard data retrieved.' });
});

/**
 * GET /api/v1/dashboard/summary
 * Invoice status counts + FY totals only (lightweight).
 */
const getSummary = asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getInvoiceSummary(getBusinessId(req));
    sendSuccess(res, { data, message: 'Summary retrieved.' });
});

/**
 * GET /api/v1/dashboard/revenue?months=12
 * Monthly revenue series for the chart.
 */
const getRevenue = asyncHandler(async (req: Request, res: Response) => {
    const { months = 12 } = req.query;
    const data = await dashboardService.getMonthlyRevenue(getBusinessId(req), Number(months));
    sendSuccess(res, { data, message: 'Revenue data retrieved.' });
});

export { getDashboard, getSummary, getRevenue };