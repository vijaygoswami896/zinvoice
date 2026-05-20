import { z } from 'zod';
import {
  gstinField,
  panField,
  indianMobileField,
  AddressSchema,
  BankDetailsSchema,
  BusinessSchema,
} from './shared.schema';

// export const UpdateSettingsSchema = z.object({
//   businessName: z
//     .string({ required_error: 'Business name is required' })
//     .trim()
//     .min(2, 'At least 2 characters')
//     .max(150),

//   legalName: z.string().trim().max(150).optional().or(z.literal('')),
//   gstin: gstinField,
//   pan: panField,
//   gstRegistrationType: z.enum(['regular', 'composition', 'unregistered']).default('unregistered'),
//   email: z.string().email().toLowerCase().trim().optional().or(z.literal('')),
//   phone: indianMobileField,
//   website: z.string().trim().max(200).optional().or(z.literal('')),
//   address: AddressSchema.optional(),
//   bankDetails: BankDetailsSchema.optional(),

//   invoicePrefix: z
//     .string().trim().toUpperCase()
//     .min(1).max(10)
//     .regex(/^[A-Z0-9\-]+$/, 'Only letters, numbers and hyphens allowed')
//     .default('INV')
//     .optional(),

//   invoiceNotes: z.string().trim().max(1000).optional().or(z.literal('')),
//   invoiceTerms: z.string().trim().max(2000).optional().or(z.literal('')),
//   defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
// });

export const UpdateSettingsSchema = BusinessSchema.extend({
  // settings-only fields like website, phone (as non-business phone)
  website: z.string().trim().max(200).optional().or(z.literal('')),
  defaultDueDays: z.coerce.number().int().min(0).max(365).default(30).optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// Re-export shared types so importers don't need two imports
export type { AddressInput, BankDetailsInput } from './shared.schema';