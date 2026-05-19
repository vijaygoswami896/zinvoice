import { z } from 'zod';

// ── Reusable primitives ───────────────────────────────────────────────────────

const optStr = (max: number) =>
    z.string().trim().max(max, `Max ${max} characters`).optional().or(z.literal(''));

const gstinSchema = z
    .string().trim().toUpperCase()
    .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GSTIN (e.g. 27AAPFU0939F1ZV)',
    )
    .optional().or(z.literal(''));

const AddressSchema = z.object({
    line1: optStr(200),
    line2: optStr(200),
    city: optStr(100),
    state: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Must be 6 digits').optional().or(z.literal('')),
    country: z.string().trim().max(100).default('India').optional(),
});

// ── Create / Update ───────────────────────────────────────────────────────────

const CustomerBodySchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(2, 'At least 2 characters')
        .max(150, 'Max 150 characters'),

    gstin: gstinSchema,
    gstType: z.enum(['B2B', 'B2C', 'export']).default('B2C'),

    email: z
        .string().email('Invalid email').toLowerCase().trim()
        .optional().or(z.literal('')),

    phone: z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number')
        .optional().or(z.literal('')),

    billingAddress: AddressSchema.optional(),
    shippingAddress: AddressSchema.optional(),
    sameAsShipping: z.boolean().default(true),

    notes: optStr(1000),
});

// ── List query params ─────────────────────────────────────────────────────────

const CustomerListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().trim().max(100).optional(),
    gstType: z.enum(['B2B', 'B2C', 'export']).optional(),
    state: z.string().trim().optional(),
    sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────

const CustomerIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid customer ID'),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CustomerBody = z.infer<typeof CustomerBodySchema>;
export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;
export type CustomerIdParam = z.infer<typeof CustomerIdParamSchema>;
export type Address = z.infer<typeof AddressSchema>;

export { CustomerBodySchema, CustomerListQuerySchema, CustomerIdParamSchema };