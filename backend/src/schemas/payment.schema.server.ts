import { z } from 'zod';

import { PAYMENT_MODES } from '../models/payment.model.js';

const mongoId = (msg = 'Invalid ID') => z.string().regex(/^[a-f\d]{24}$/i, msg);
const optStr = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

// ── Record payment ────────────────────────────────────────────────────────────

export const RecordPaymentSchema = z.object({
    invoiceId: mongoId('Invalid invoice ID'),
    amount: z.coerce.number({ required_error: 'Amount is required' }).positive('Amount must be greater than zero').multipleOf(0.01, 'Max 2 decimal places'),
    mode: z.enum(PAYMENT_MODES, { required_error: 'Payment mode is required', invalid_type_error: `Mode must be one of: ${PAYMENT_MODES.join(', ')}` }),
    paymentDate: z.coerce.date({ required_error: 'Payment date is required' }),
    reference: optStr(100),
    notes: optStr(500),
});

// ── Update payment ────────────────────────────────────────────────────────────

export const UpdatePaymentSchema = z.object({
    amount: z.coerce.number().positive().multipleOf(0.01).optional(),
    mode: z.enum(PAYMENT_MODES).optional(),
    paymentDate: z.coerce.date().optional(),
    reference: optStr(100),
    notes: optStr(500),
});

// ── List query ────────────────────────────────────────────────────────────────

export const PaymentListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    invoiceId: mongoId().optional(),
    mode: z.enum(PAYMENT_MODES).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z.enum(['paymentDate', 'amount', 'createdAt']).default('paymentDate'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────

export const PaymentIdParamSchema = z.object({
    id: mongoId('Invalid payment ID'),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type PaymentListQuery = z.infer<typeof PaymentListQuerySchema>;