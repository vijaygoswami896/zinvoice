import * as customerService from '../services/customer.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import getBusinessId from '../utils/getBusinessId.js';
// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Resolves the business context for the request.
 * Uses businessId from JWT payload if present (multi-business users),
 * otherwise falls back to the user's own ID (single-business users).
 * Throws if neither is available — should never happen after authenticate.
 */
// ── Controllers ───────────────────────────────────────────────────────────────
/**
 * GET /api/v1/customers
 * List with pagination, search, and filters.
 */
const listCustomers = asyncHandler(async (req, res) => {
    const result = await customerService.listCustomers(getBusinessId(req), req.query);
    sendPaginated(res, {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'Customers retrieved.',
    });
});
/**
 * GET /api/v1/customers/:id
 */
const getCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomer(getBusinessId(req), req.params.id);
    sendSuccess(res, { data: { customer }, message: 'Customer retrieved.' });
});
/**
 * POST /api/v1/customers
 */
const createCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.createCustomer(getBusinessId(req), req.body);
    sendSuccess(res, { data: { customer }, message: 'Customer created.', status: 201 });
});
/**
 * PUT /api/v1/customers/:id
 */
const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(getBusinessId(req), req.params.id, req.body);
    sendSuccess(res, { data: { customer }, message: 'Customer updated.' });
});
/**
 * DELETE /api/v1/customers/:id
 * Soft delete — sets deletedAt, does not remove the document.
 */
const deleteCustomer = asyncHandler(async (req, res) => {
    await customerService.deleteCustomer(getBusinessId(req), req.params.id, req.user.id);
    sendSuccess(res, { data: null, message: 'Customer deleted.' });
});
export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
//# sourceMappingURL=customer.controller.js.map