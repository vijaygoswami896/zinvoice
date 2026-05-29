// import { z } from 'zod';
// import { INDIAN_STATES } from '../models/customer.model';

// const indianMobile = z
//   .string()
//   .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
//   .optional()
//   .or(z.literal(''));

// const gstinSchema = z
//   .string()
//   .toUpperCase()
//   .trim()
//   .regex(
//     /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//     'Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)',
//   )
//   .optional()
//   .or(z.literal(''));

// const panSchema = z
//   .string()
//   .toUpperCase()
//   .trim()
//   .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. AAPFU0939F)')
//   .optional()
//   .or(z.literal(''));

// const pincodeSchema = z
//   .string()
//   .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
//   .optional()
//   .or(z.literal(''));

// const ifscSchema = z
//   .string()
//   .toUpperCase()
//   .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0001234)')
//   .optional()
//   .or(z.literal(''));

// export const AddressSchema = z.object({
//   line1: z.string().trim().max(200).optional().or(z.literal('')),
//   line2: z.string().trim().max(200).optional().or(z.literal('')),
//   city: z.string().trim().max(100).optional().or(z.literal('')),
//   // state: z.string().trim().optional().or(z.literal('')),
//   state: z.enum(INDIAN_STATES).optional(),
//   pincode: pincodeSchema,
//   country: z.string().trim().max(100).default('India').optional(),
// });

// export const BankDetailsSchema = z.object({
//   bankName: z.string().trim().max(100).optional().or(z.literal('')),
//   accountName: z.string().trim().max(100).optional().or(z.literal('')),
//   accountNumber: z.string().trim().max(20).optional().or(z.literal('')),
//   ifscCode: ifscSchema,
//   branch: z.string().trim().max(100).optional().or(z.literal('')),
//   upiId: z.string().trim().max(100).optional().or(z.literal('')),
// });

// export const UpdateSettingsSchema = z.object({
//   businessName: z
//     .string({ required_error: 'Business name is required' })
//     .trim()
//     .min(2, 'Business name must be at least 2 characters')
//     .max(150),

//   legalName: z.string().trim().max(150).optional().or(z.literal('')),
//   gstin: gstinSchema,
//   pan: panSchema,

//   gstRegistrationType: z.enum(['regular', 'composition', 'unregistered']),

//   email: z.string().email('Enter a valid email address').toLowerCase().trim().optional().or(z.literal('')),

//   phone: indianMobile,
//   website: z.string().trim().max(200).optional().or(z.literal('')),

//   address: AddressSchema.optional(),
//   bankDetails: BankDetailsSchema.optional(),

//   invoicePrefix: z
//     .string()
//     .trim()
//     .toUpperCase()
//     .min(1, 'Invoice prefix is required')
//     .max(10, 'Invoice prefix must be 1-10 characters')
//     .regex(/^[A-Z0-9\-]+$/, 'Only letters, numbers and hyphens allowed')
//     .default('INV')
//     .optional(),

//   invoiceNotes: z.string().trim().max(1000).optional().or(z.literal('')),
//   invoiceTerms: z.string().trim().max(2000).optional().or(z.literal('')),
//   defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
// });

// export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
// export type AddressInput = z.infer<typeof AddressSchema>;
// export type BankDetailsInput = z.infer<typeof BankDetailsSchema>;