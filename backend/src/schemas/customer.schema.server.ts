import { z } from 'zod';
import {
    emailField,
    indianMobileField,
    gstinField,
    pincodeField,
    AddressSchema,
    emptyStringToUndefined,
    withDefault,
} from './shared.schema';
import { INDIAN_STATES } from '../constants/india';

// ── Customer-specific primitives ──────────────────────────────────────────────

const optStr = (max: number) =>
    z.string().trim().max(max, `Max ${max} characters`).optional().or(z.literal(''));

// ── Create / Update ─────────────────────────────────────────────────────────── 

const CustomerBodySchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(2, 'At least 2 characters')
        .max(150, 'Max 150 characters'),

    gstin: gstinField,
    // gstType: z.enum(['B2B', 'B2C', 'export']).default('B2C'),
    gstType: withDefault(z.enum(['B2B', 'B2C', 'export']), 'B2C'),
    email: emailField.optional().or(z.literal('')),
    phone: indianMobileField,

    billingAddress: AddressSchema.optional(),
    shippingAddress: AddressSchema.optional(),
    sameAsShipping: z.boolean().default(true),

    notes: optStr(1000),
}).superRefine((data, ctx) => {
    if (data.gstin && data.gstType === 'B2C') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'B2C customers cannot have a GSTIN. Use B2B or export.',
            path: ['gstType'],
        });
    }
});

// ── List query params ─────────────────────────────────────────────────────────

const CustomerListQuerySchema = z.object({
    page: z.preprocess(emptyStringToUndefined, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess(emptyStringToUndefined, z.coerce.number().int().min(1).max(100).default(25)),
    search: z.string().trim().max(100).optional(),
    gstType: z.preprocess(emptyStringToUndefined, z.enum(['B2B', 'B2C', 'export']).optional()),
    state: z.preprocess(emptyStringToUndefined, z.enum(INDIAN_STATES).optional()),
    sortBy: withDefault(z.enum(['name', 'createdAt', 'updatedAt']), 'createdAt'),
    sortDir: withDefault(z.enum(['asc', 'desc']), 'desc'),
});

// ── ID param ──────────────────────────────────────────────────────────────────

const CustomerIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid customer ID'),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type CustomerBody = z.infer<typeof CustomerBodySchema>;
export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;
export type CustomerIdParam = z.infer<typeof CustomerIdParamSchema>;

export { CustomerBodySchema, CustomerListQuerySchema, CustomerIdParamSchema };

// Re-export for consumers that need address type
export type { AddressInput as Address } from './shared.schema';


