import { Request, Response } from 'express';

import * as paymentService from '../services/payment.service.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import getBusinessId from '../utils/getBusinessId.js';
import { PaymentListQuerySchema, RecordPaymentSchema } from '../schemas/payment.schema.server.js';

/** POST /api/v1/payments — Record a new payment against an invoice. */
export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const { payment, invoiceStatus, totalPaid } = await paymentService.recordPayment(getBusinessId(req), req.body);
    sendSuccess(res, { data: { payment, invoiceStatus, totalPaid }, message: 'Payment recorded.', status: 201 });
});

/** GET /api/v1/payments — List all payments with pagination and filters. */
export const listPayments = asyncHandler(async (req: Request, res: Response) => {

    const query = PaymentListQuerySchema.parse(req.query);

    const { items, total, page, limit } = await paymentService.listPayments(getBusinessId(req), query);
    sendPaginated(res, { items, total, page, limit, message: 'Payments retrieved.' });
});

/** GET /api/v1/payments/invoice/:invoiceId — All payments + summary for a specific invoice. */
export const getPaymentsForInvoice = asyncHandler(async (req: Request, res: Response) => {
    const data = await paymentService.getPaymentsForInvoice(getBusinessId(req), req.params.invoiceId);
    sendSuccess(res, { data, message: 'Invoice payments retrieved.' });
});

/** DELETE /api/v1/payments/:id — Soft-delete a payment and recalculate invoice status. */
export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
    await paymentService.deletePayment(getBusinessId(req), req.params.id, req?.user?.id ?? '');
    sendSuccess(res, { data: null, message: 'Payment deleted.' });
});