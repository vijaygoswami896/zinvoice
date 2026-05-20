import { z } from 'zod';
import { INDIAN_STATES } from '../constants/india';

export const emptyStringToUndefined = (val: unknown) =>
    val === '' ? undefined : val;

//THIS IS HOW TO USE IT
//z.preprocess(emptyStringToUndefined, z.enum([...]).optional())

export const withDefault = <T>(schema: z.ZodType<T>, defaultVal: T) =>
    z.preprocess(
        (val) => (val === '' || val === undefined ? defaultVal : val),
        schema,
    );

// ── Primitives ────────────────────────────────────────────────────────────────

export const nameField = z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters');

export const emailField = z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim();

export const passwordField = z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );

export const indianMobileField = z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal(''));

export const gstinField = z
    .string()
    .toUpperCase()
    .trim()
    .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)',
    )
    .optional()
    .or(z.literal(''));

export const panField = z
    .string()
    .toUpperCase()
    .trim()
    .regex(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        'Invalid PAN format (e.g. AAPFU0939F)',
    )
    .optional()
    .or(z.literal(''));

export const pincodeField = z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .optional()
    .or(z.literal(''));

export const ifscField = z
    .string()
    .toUpperCase()
    .regex(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        'Invalid IFSC code (e.g. SBIN0001234)',
    )
    .optional()
    .or(z.literal(''));

// ── Composed schemas ──────────────────────────────────────────────────────────

export const AddressSchema = z.object({
    line1: z.string().trim().max(200).optional().or(z.literal('')),
    line2: z.string().trim().max(200).optional().or(z.literal('')),
    city: z.string().trim().max(100).optional().or(z.literal('')),
    state: z.enum(INDIAN_STATES).optional(),
    pincode: pincodeField,
    country: z.string().trim().max(100).default('India').optional(),
});

export const BankDetailsSchema = z.object({
    bankName: z.string().trim().max(100).optional().or(z.literal('')),
    accountName: z.string().trim().max(100).optional().or(z.literal('')),
    accountNumber: z.string().trim().max(20).optional().or(z.literal('')),
    ifscCode: ifscField,
    branch: z.string().trim().max(100).optional().or(z.literal('')),
    upiId: z.string().trim().max(100).optional().or(z.literal('')),
});

// ── Business fields — used in both signup and settings ────────────────────────

// Minimal — used at signup
export const BusinessBaseSchema = z.object({
    businessName: z.string().trim().min(2).max(150),
    businessEmail: emailField.optional().or(z.literal('')),
    businessPhone: indianMobileField,
    businessGstin: gstinField,
    gstRegistrationType: z.enum(['regular', 'composition', 'unregistered'], {
        required_error: 'GST registration type is required',
        invalid_type_error: 'Must be regular, composition, or unregistered',
    }),
});

// Full — used in settings, extends the base
export const BusinessSchema = BusinessBaseSchema.extend({
    legalName: z.string().trim().max(150).optional().or(z.literal('')),
    pan: panField,
    // gstRegistrationType: z.enum(['regular', 'composition', 'unregistered']).default('unregistered'),
    // gstRegistrationType: z.enum(['regular', 'composition', 'unregistered'], {
    //     required_error: 'GST registration type is required',
    //     invalid_type_error: 'Must be regular, composition, or unregistered',
    // }),
    address: AddressSchema.optional(),
    bankDetails: BankDetailsSchema.optional(),
    invoicePrefix: z.string().trim().toUpperCase().min(1).max(10)
        .regex(/^[A-Z0-9\-]+$/).default('INV').optional(),
    invoiceNotes: z.string().trim().max(1000).optional().or(z.literal('')),
    invoiceTerms: z.string().trim().max(2000).optional().or(z.literal('')),
    defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
});

// export const BusinessSchema = z.object({
//     businessName: z.string().trim().min(2, 'At least 2 characters').max(150, 'Max 150 characters'),
//     legalName: z.string().trim().max(150).optional().or(z.literal('')),
//     businessEmail: emailField.optional().or(z.literal('')),
//     businessPhone: indianMobileField,
//     businessGstin: gstinField,
//     pan: panField,
//     gstRegistrationType: z
//         .enum(['regular', 'composition', 'unregistered']),
//     // .default('unregistered'),
//     address: AddressSchema.optional(),
//     bankDetails: BankDetailsSchema.optional(),
//     invoicePrefix: z
//         .string().trim().toUpperCase()
//         .min(1).max(10)
//         .regex(/^[A-Z0-9\-]+$/, 'Only letters, numbers and hyphens allowed')
//         .default('INV')
//         .optional(),
//     invoiceNotes: z.string().trim().max(1000).optional().or(z.literal('')),
//     invoiceTerms: z.string().trim().max(2000).optional().or(z.literal('')),
//     defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
// });

export type AddressInput = z.infer<typeof AddressSchema>;
export type BankDetailsInput = z.infer<typeof BankDetailsSchema>;
export type BusinessInput = z.infer<typeof BusinessSchema>;