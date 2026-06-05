import { z } from 'zod';
import { AddressSchema, BankDetailsSchema, emailField, gstinField, indianMobileField, panField } from './shared.schema';

// ── Reusables ─────────────────────────────────────────────────────────────────

const optStr = (max, msg) =>
  z.string().trim().max(max, msg).optional().or(z.literal(''));

// ── Main form schema ──────────────────────────────────────────────────────────

export const SettingsFormSchema = z.object({
  // Business identity
  businessName: z
    .string({ error: 'Business name is required' })
    .trim()
    .min(2, 'At least 2 characters')
    .max(150, 'Max 150 characters'),
  legalName: optStr(150, 'Max 150 characters'),
  tagLine: z.string().optional(),
  gstin: gstinField,
  pan: panField,
  gstRegistrationType: z.enum(['regular', 'composition', 'unregistered']).default('regular'),

  // Contact
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
  invoiceTemplate: z.enum(['classic', 'modern']).default('classic'),
  showGstBreakdown: z.boolean().default(true),
});
