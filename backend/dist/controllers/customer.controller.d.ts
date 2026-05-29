import { RequestHandler } from 'express';
/**
 * Resolves the business context for the request.
 * Uses businessId from JWT payload if present (multi-business users),
 * otherwise falls back to the user's own ID (single-business users).
 * Throws if neither is available — should never happen after authenticate.
 */
/**
 * GET /api/v1/customers
 * List with pagination, search, and filters.
 */
declare const listCustomers: RequestHandler;
/**
 * GET /api/v1/customers/:id
 */
declare const getCustomer: RequestHandler;
/**
 * POST /api/v1/customers
 */
declare const createCustomer: RequestHandler;
/**
 * PUT /api/v1/customers/:id
 */
declare const updateCustomer: RequestHandler;
/**
 * DELETE /api/v1/customers/:id
 * Soft delete — sets deletedAt, does not remove the document.
 */
declare const deleteCustomer: RequestHandler;
export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
