import { z } from 'zod';

export const VALID_GST_RATES = [0, 5, 12, 18, 28] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled', 'overdue'] as const;

export type GstRate = typeof VALID_GST_RATES[number];
export type InvoiceStatus = typeof INVOICE_STATUSES[number];

// ── Line item ─────────────────────────────────────────────────────────────────

export const LineItemSchema = z.object({
    productId: z
        .string().regex(/^[a-f\d]{24}$/i, 'Invalid product ID')
        .nullable().optional(),

    name: z.string({ required_error: 'Item name is required' }).trim().min(1, 'Required').max(200),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    hsnSacCode: z.string().trim().max(8).optional().or(z.literal('')),
    unit: z.string().trim().max(5).default('PCS'),
    itemType: z.enum(['goods', 'service']).default('goods'),

    quantity: z.coerce
        .number({ required_error: 'Quantity is required' })
        .positive('Must be greater than 0'),

    rate: z.coerce
        .number({ required_error: 'Rate is required' })
        .min(0, 'Cannot be negative'),

    discountPct: z.coerce.number().min(0).max(100).default(0),

    gstRate: z.coerce
        .number({ required_error: 'GST rate is required' })
        .refine((v): v is GstRate => (VALID_GST_RATES as readonly number[]).includes(v), {
            message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}`,
        }),

    taxIncluded: z.boolean().default(false),
});

// ── Create body ───────────────────────────────────────────────────────────────

export const CreateInvoiceSchema = z.object({
    customerId: z
        .string({ required_error: 'Customer is required' })
        .regex(/^[a-f\d]{24}$/i, 'Invalid customer ID'),

    invoiceDate: z.coerce.date({ required_error: 'Invoice date is required' }),

    dueDate: z.coerce.date().nullable().optional(),

    items: z
        .array(LineItemSchema, { required_error: 'At least one item is required' })
        .min(1, 'Invoice must have at least one line item'),

    status: z.enum(INVOICE_STATUSES).default('draft'),

    notes: z.string().trim().max(1000).optional().or(z.literal('')),
    termsAndConditions: z.string().trim().max(2000).optional().or(z.literal('')),
    internalNotes: z.string().trim().max(1000).optional().or(z.literal('')),
});

// ── Update body (all optional, cannot change invoice number or customer) ──────

export const UpdateInvoiceSchema = z.object({
    invoiceDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    items: z.array(LineItemSchema).min(1).optional(),
    status: z.enum(INVOICE_STATUSES).optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
    termsAndConditions: z.string().trim().max(2000).optional().or(z.literal('')),
    internalNotes: z.string().trim().max(1000).optional().or(z.literal('')),
});

// ── Status-only patch ─────────────────────────────────────────────────────────

export const UpdateStatusSchema = z.object({
    status: z.enum(INVOICE_STATUSES, { required_error: 'Status is required' }),
});

// ── List query ────────────────────────────────────────────────────────────────

export const InvoiceListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(100).optional(),
    status: z.enum(INVOICE_STATUSES).optional(),
    customerId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sortBy: z.enum(['invoiceDate', 'dueDate', 'grandTotal', 'createdAt']).default('invoiceDate'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────

export const InvoiceIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid invoice ID'),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type LineItemInput = z.infer<typeof LineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
export type InvoiceListQueryInput = z.infer<typeof InvoiceListQuerySchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;