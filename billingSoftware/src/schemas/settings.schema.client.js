import { z } from 'zod';
import { AddressSchema, BankDetailsSchema, emailField, gstinField, indianMobileField, panField } from './shared.schema';

// ── Reusables ─────────────────────────────────────────────────────────────────

const optStr = (max, msg) =>
  z.string().trim().max(max, msg).optional().or(z.literal(''));

// const gstinSchema = z
//   .string()
//   .trim()
//   .transform(s => s.toUpperCase())
//   .regex(
//     /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//     'Invalid GSTIN (e.g. 27AAPFU0939F1ZV)',
//   )
//   .optional()
//   .or(z.literal(''));

// const panSchema = z
//   .string()
//   .trim()
//   .transform(s => s.toUpperCase())
//   .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN (e.g. AAPFU0939F)')
//   .optional()
//   .or(z.literal(''));

// const pincodeSchema = z
//   .string()
//   .regex(/^\d{6}$/, 'Must be exactly 6 digits')
//   .optional()
//   .or(z.literal(''));

// const ifscSchema = z
//   .string()
//   .trim()
//   .transform(s => s.toUpperCase())
//   .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC (e.g. SBIN0001234)')
//   .optional()
//   .or(z.literal(''));

// // const phoneSchema = z
// //   .string()
// //   .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
// //   .optional()
// //   .or(z.literal(''));

// // ── Address ───────────────────────────────────────────────────────────────────

// const AddressSchema = z.object({
//   line1: optStr(200, 'Too long'),
//   line2: optStr(200, 'Too long'),
//   city: optStr(100, 'Too long'),
//   state: z.string().optional(),
//   pincode: pincodeSchema,
//   country: z.string().trim().default('India').optional(),
// });

// // ── Bank ──────────────────────────────────────────────────────────────────────

// const BankDetailsSchema = z.object({
//   bankName: optStr(100, 'Too long'),
//   accountName: optStr(100, 'Too long'),
//   accountNumber: optStr(20, 'Too long'),
//   ifscCode: ifscSchema,
//   branch: optStr(100, 'Too long'),
//   upiId: optStr(100, 'Too long'),
// });

// ── Main form schema ──────────────────────────────────────────────────────────

export const SettingsFormSchema = z.object({
  // Business identity
  businessName: z
    .string({ error: 'Business name is required' })
    .trim()
    .min(2, 'At least 2 characters')
    .max(150, 'Max 150 characters'),
  legalName: optStr(150, 'Max 150 characters'),
  gstin: gstinField,
  pan: panField,
  gstRegistrationType: z.enum(['regular', 'composition', 'unregistered']).default('regular'),

  // Contact
  // email: z.string().email('Enter a valid email').toLowerCase().trim().optional().or(z.literal('')),

  email: emailField,

  phone: indianMobileField,
  website: optStr(200, 'Max 200 characters'),

  // Address
  address: AddressSchema.optional(),

  // Bank
  bankDetails: BankDetailsSchema.optional(),

  // Invoice defaults
  invoicePrefix: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'Required')
    .max(10, 'Max 10 characters')
    .regex(/^[A-Z0-9-]+$/, 'Only letters, numbers and hyphens')
    .default('INV'),
  invoiceNotes: optStr(1000, 'Max 1000 characters'),
  invoiceTerms: optStr(2000, 'Max 2000 characters'),
  defaultDueDays: z.coerce.number().int().min(0).max(365).default(30),
});
