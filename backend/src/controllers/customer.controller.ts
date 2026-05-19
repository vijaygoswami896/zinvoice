import { Request, Response, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import * as customerService from '../services/customer.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { CustomerListQuery } from '../schemas/customer.schema.server.js';

const getBusinessId = (req: Request): string => {
    const { user } = req as AuthenticatedRequest;
    return user.businessId || user.id;
};

/**
 * GET /api/v1/customers
 * List with pagination, search, and filters.
 */
const listCustomers: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { items, total, page, limit } = await customerService.listCustomers(
        getBusinessId(req),
        req.query as CustomerListQuery,
    );
    sendSuccess(res, {
        items,
        total,
        page,
        limit,
        message: 'Customers retrieved.',
    });
});

/**
 * GET /api/v1/customers/:id
 */
const getCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.getCustomer(
        getBusinessId(req),
        req.params.id,
    );
    return sendSuccess(res, { data: { customer }, message: 'Customer retrieved.' });
});

/**
 * POST /api/v1/customers
 */
const createCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(
        getBusinessId(req),
        req.body,
    );
    return sendSuccess(res, { data: { customer }, message: 'Customer created.', status: 201 });
});

/**
 * PUT /api/v1/customers/:id
 */
const updateCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.updateCustomer(
        getBusinessId(req),
        req.params.id,
        req.body,
    );
    return sendSuccess(res, { data: { customer }, message: 'Customer updated.' });
});

/**
 * DELETE /api/v1/customers/:id
 * Soft delete — sets deletedAt, does not remove the document.
 */
const deleteCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    await customerService.deleteCustomer(
        getBusinessId(req),
        req.params.id,
        user.id,
    );
    return sendSuccess(res, { data: null, message: 'Customer deleted.' });
});

export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };