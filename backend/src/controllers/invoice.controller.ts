import type { Request, RequestHandler, Response } from 'express';

import * as invoiceService from '../services/invoice.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { InvoiceListQuerySchema } from '../schemas/invoice.schema.server.js';

/** Resolves the business ID from the authenticated user on the request. */
const bizId = (req: Request): string =>
    (req.user as Record<string, string>).businessId ?? (req.user as Record<string, string>).id;

/** GET /api/v1/invoices */
export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
    const query = InvoiceListQuerySchema.parse(req.query);
    const { items, total, page, limit } = await invoiceService.listInvoices(bizId(req), query);
    sendPaginated(res, { items, total, page, limit, message: 'Invoices retrieved.' });
});

/** GET /api/v1/invoices/:id */
export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.getInvoice(bizId(req), req.params.id);
    sendSuccess(res, { data: { invoice }, message: 'Invoice retrieved.' });
});

/** POST /api/v1/invoices */
export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.createInvoice(bizId(req), req.body);
    sendSuccess(res, { data: { invoice }, message: 'Invoice created.', status: 201 });
});

/** PUT /api/v1/invoices/:id */
export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.updateInvoice(bizId(req), req.params.id, req.body);
    sendSuccess(res, { data: { invoice }, message: 'Invoice updated.' });
});

/** PATCH /api/v1/invoices/:id/status */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    const invoice = await invoiceService.updateStatus(bizId(req), req.params.id, status);
    sendSuccess(res, { data: { invoice }, message: `Invoice marked as ${status}.` });
});

/** DELETE /api/v1/invoices/:id — soft delete + cancel */
export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
    await invoiceService.deleteInvoice(
        bizId(req),
        req.params.id,
        (req.user as Record<string, string>).id,
    );
    sendSuccess(res, { data: null, message: 'Invoice cancelled and deleted.' });
});