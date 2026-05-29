/**
 * gstValidator.ts
 *
 * GST input validation built on Zod schemas.
 *
 * Validator shape conventions:
 *   - validateGSTIN / validateStateCode / validateGSTRate
 *       → single-error  { valid, error?, code?, value? }  (ValidationResult<T>)
 *   - validateLineItem
 *       → multi-error   { valid, errors, cleaned }         (LineItemValidation)
 *   - validateInvoiceInput
 *       → multi-error   { valid, errors }                  (InvoiceValidation)
 *
 * Zod schemas are exported so callers can compose them into larger schemas
 * (e.g. a Mongoose pre-save hook or an Express route handler) without
 * re-implementing the rules.
 */

import { z } from 'zod';
import {
    VALID_GST_RATES,
    VALID_STATE_CODES,
    VALID_UNIT_CODES,
    GSTIN_REGEX,
    PAN_REGEX,
    STATE_CODE_MAP,
    GST_TYPES,
} from './gstConstants.js';
import type { GSTRate, GSTType } from './gstConstants.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Encodes a machine code into the Zod message so we can extract it later. */
export const withCode = (code: string, message: string) => `${code}::${message}`;

/** Splits a coded Zod message back into { code, message }. */
const parseIssue = (issue: z.ZodIssue): { code: string; message: string } => {
    const sep = issue.message.indexOf('::');
    if (sep === -1) return { code: 'INVALID', message: issue.message };
    return {
        code: issue.message.slice(0, sep),
        message: issue.message.slice(sep + 2),
    };
};

// ── Shared result types ───────────────────────────────────────────────────────

export interface ValidationResult<T = unknown> {
    valid: boolean;
    value?: T;
    error?: string;
    code?: string;
}

const ok = <T>(value: T): ValidationResult<T> => ({ valid: true, value });
const err = (error: string, code = 'INVALID'): ValidationResult<never> =>
    ({ valid: false, error, code });

// ── Zod primitives ────────────────────────────────────────────────────────────

/** Validates a raw GSTIN string and refines to a normalised uppercase value. */
export const GSTINSchema = z
    .string({ required_error: 'GSTIN is required' })
    .trim()
    .toUpperCase()
    .refine((v) => v.length === 15, {
        message: withCode('LENGTH_ERROR', 'GSTIN must be exactly 15 characters'),
    })
    .refine((v) => GSTIN_REGEX.test(v), {
        message: withCode(
            'FORMAT_ERROR',
            'Invalid GSTIN format. Expected: 2-digit state code + 10-char PAN + 1 entity + Z + 1 checksum (e.g. 27AAPFU0939F1ZV)',
        ),
    })
    .refine((v) => VALID_STATE_CODES.includes(v.slice(0, 2)), {
        message: withCode('INVALID_STATE_CODE', 'First 2 digits are not a recognised Indian state code'),
    })
    .refine((v) => PAN_REGEX.test(v.slice(2, 12)), {
        message: withCode('INVALID_PAN', 'PAN portion of GSTIN is invalid'),
    })
    .refine((v) => v[13] === 'Z', {
        message: withCode('FORMAT_ERROR', 'Position 14 of a GSTIN must always be "Z"'),
    });

// .refine((v) => v.length === 15, {
//     message: 'GSTIN must be exactly 15 characters',
//     params: { code: 'LENGTH_ERROR' },
// })
// .refine((v) => GSTIN_REGEX.test(v), {
//     message:
//         'Invalid GSTIN format. Expected: 2-digit state code + 10-char PAN + 1 entity + Z + 1 checksum (e.g. 27AAPFU0939F1ZV)',
//     params: { code: 'FORMAT_ERROR' },
// })
// .refine((v) => VALID_STATE_CODES.includes(v.slice(0, 2)), {
//     message: 'First 2 digits are not a recognised Indian state code',
//     params: { code: 'INVALID_STATE_CODE' },
// })
// .refine((v) => PAN_REGEX.test(v.slice(2, 12)), {
//     message: 'PAN portion of GSTIN is invalid',
//     params: { code: 'INVALID_PAN' },
// })
// .refine((v) => v[13] === 'Z', {
//     message: 'Position 14 of a GSTIN must always be "Z"',
//     params: { code: 'FORMAT_ERROR' },
// });

/** Valid Indian 2-digit state code. */
export const StatecodeSchema = z
    .string({ required_error: 'State code is required' })
    .trim()
    .transform((v) => v.padStart(2, '0'))
    .refine((v) => VALID_STATE_CODES.includes(v), {
        message: withCode('INVALID_STATE_CODE', 'Not a valid Indian state code')
    });
// .refine((v) => VALID_STATE_CODES.includes(v), {
//     message: 'Not a valid Indian state code',
//     params: { code: 'INVALID_STATE_CODE' },
// });

/** One of the legal Indian GST slab rates. Accepts number or numeric string. */
export const GSTRateSchema = z
    .union([z.number(), z.string().transform(Number)])
    .refine((n): n is GSTRate => !isNaN(n as number) && (VALID_GST_RATES as readonly number[]).includes(n as number), {
        message: withCode('INVALID_RATE', `GST rate must be one of: ${VALID_GST_RATES.join(', ')}%`),
        // params: { code: 'INVALID_RATE' },
    }) as z.ZodType<GSTRate>;

/** Schema for a single validated + cleaned line item. */
export const LineItemSchema = z.object({
    name: z.string().trim().min(1, 'Item name is required'),
    description: z.string().trim().optional().default(''),
    hsnSacCode: z
        .string()
        .trim()
        .regex(/^\d{4,8}$/, 'HSN/SAC code must be 4–8 digits')
        .optional()
        .default('')
        .transform((v) => v ?? ''),
    unit: z.enum(VALID_UNIT_CODES as [string, ...string[]]).default('OTH'),
    itemType: z.enum(['goods', 'service']).default('goods'),
    quantity: z.number({ invalid_type_error: 'Quantity must be a number' }).positive('Quantity must be positive'),
    rate: z.number({ invalid_type_error: 'Rate must be a number' }).nonnegative('Rate must be zero or positive'),
    gstRate: GSTRateSchema,
    taxIncluded: z.boolean().default(false),
    discountPct: z.number().min(0).max(100).default(0),
});

export type LineItemInput = z.input<typeof LineItemSchema>;
export type CleanedLineItem = z.output<typeof LineItemSchema>;

/** Schema for the invoice-level input. */
export const InvoiceInputSchema = z
    .object({
        customerId: z.string({ required_error: 'Customer is required' }).min(1, 'Customer is required'),
        invoiceDate: z
            .string({ required_error: 'Invoice date is required' })
            .refine((v) => !isNaN(new Date(v).getTime()), { message: withCode('', 'Invoice date is not a valid date') }),
        dueDate: z.string().optional(),
        items: z.array(LineItemSchema).min(1, 'Invoice must have at least one line item'),
        customerGstin: GSTINSchema.optional(),
        sellerGstin: GSTINSchema.optional(),
    })
    .superRefine((data, ctx) => {
        if (data.dueDate) {
            const due = new Date(data.dueDate);
            if (isNaN(due.getTime())) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dueDate'], message: 'Due date is not a valid date' });
            } else if (due < new Date(data.invoiceDate)) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dueDate'], message: 'Due date cannot be before invoice date' });
            }
        }
    });

export type InvoiceInput = z.input<typeof InvoiceInputSchema>;

// ── Public validator functions ────────────────────────────────────────────────

/**
 * Validates a GSTIN string.
 *
 * Note: Full GST checksum validation (Luhn-style mod-36) is NOT implemented
 * because CBIC does not publish the algorithm and implementations conflict.
 * Format + state code check catches ~99% of typos.
 */
export const validateGSTIN = (gstin: string): ValidationResult<{
    gstin: string;
    stateCode: string;
    stateName: string;
    pan: string;
    entityNumber: string;
}> => {
    const result = GSTINSchema.safeParse(gstin);
    if (!result.success) {
        const { code, message } = parseIssue(result.error.issues[0]);
        return err(message, code);
        // const issue = result.error.issues[0];
        // return err(issue.message, (issue.params as { code?: string })?.code ?? 'INVALID');
    }
    const normalised = result.data;
    const stateCode = normalised.slice(0, 2);
    return ok({
        gstin: normalised,
        stateCode,
        stateName: STATE_CODE_MAP.get(stateCode) ?? 'Unknown',
        pan: normalised.slice(2, 12),
        entityNumber: normalised[12],
    });
};

/**
 * Validates a 2-digit Indian state code.
 */
export const validateStateCode = (
    code: string,
): ValidationResult<{ code: string; stateName: string }> => {
    const result = StatecodeSchema.safeParse(code);
    if (!result.success) {
        const { code: errCode, message } = parseIssue(result.error.issues[0]);
        return err(message, errCode);

        // const issue = result.error.issues[0];
        // return err(issue.message, (issue.params as { code?: string })?.code ?? 'INVALID');
    }
    return ok({ code: result.data, stateName: STATE_CODE_MAP.get(result.data) ?? 'Unknown' });
};

/**
 * Extracts and validates the state code from a GSTIN.
 */
export const extractStateCodeFromGSTIN = (gstin: string): ValidationResult<string> => {
    const result = validateGSTIN(gstin);
    if (!result.valid) return result as ValidationResult<never>;
    return ok(result.value!.stateCode);
};

/**
 * Validates that a GST rate is one of the legal Indian slab rates.
 */
export const validateGSTRate = (rate: unknown): ValidationResult<GSTRate> => {
    const result = GSTRateSchema.safeParse(rate);
    if (!result.success) {
        const { code, message } = parseIssue(result.error.issues[0]);
        return err(message, code);

        // const issue = result.error.issues[0];
        // return err(issue.message, (issue.params as { code?: string })?.code ?? 'INVALID_RATE');
    }
    return ok(result.data);
};

// ── Line item validation ──────────────────────────────────────────────────────

export interface LineItemValidation {
    valid: boolean;
    errors: string[];
    cleaned: CleanedLineItem | null;
}

/**
 * Validates a single line item before tax computation.
 * Collects all field errors rather than failing on the first.
 */
export const validateLineItem = (item: unknown): LineItemValidation => {
    const result = LineItemSchema.safeParse(item);
    if (!result.success) {
        return {
            valid: false,
            errors: result.error.issues.map((i) => i.message),
            cleaned: null,
        };
    }
    return { valid: true, errors: [], cleaned: result.data };
};

// ── Invoice-level validation ──────────────────────────────────────────────────

export interface InvoiceValidationOptions {
    /** Enforce B2B GSTIN requirement (default: false) */
    requireCustomerGSTIN?: boolean;
}

export interface InvoiceValidation {
    valid: boolean;
    errors: string[];
}

/**
 * Validates the full invoice input before processing.
 * Collects all errors across all fields and line items.
 */
export const validateInvoiceInput = (
    invoice: unknown,
    options: InvoiceValidationOptions = {},
): InvoiceValidation => {
    const { requireCustomerGSTIN = false } = options;
    const errors: string[] = [];

    const result = InvoiceInputSchema.safeParse(invoice);

    if (!result.success) {
        for (const issue of result.error.issues) {
            // Prefix line-item errors with their 1-based index
            const path = issue.path;
            if (path[0] === 'items' && typeof path[1] === 'number') {
                errors.push(`Item ${(path[1] as number) + 1}: ${issue.message}`);
            } else {
                errors.push(issue.message);
            }
        }
    }

    // requireCustomerGSTIN is a runtime option, not part of the static schema
    if (
        requireCustomerGSTIN &&
        !(invoice as Record<string, unknown>)?.customerGstin
    ) {
        errors.push('Customer GSTIN is required for B2B invoices');
    }

    return { valid: errors.length === 0, errors };
};

// ── GST type helpers ──────────────────────────────────────────────────────────

/** Returns true if this customer type requires a GSTIN on invoices. */
export const requiresGSTIN = (gstType: GSTType): boolean =>
    gstType === GST_TYPES.B2B;

/** Returns true if the supply is zero-rated (export). */
export const isZeroRated = (gstType: GSTType): boolean =>
    gstType === GST_TYPES.EXPORT;

