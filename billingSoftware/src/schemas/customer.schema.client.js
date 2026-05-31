import { z } from 'zod';
import { emailField } from './shared.schema';

const optStr = (max) =>
  z.string().trim().max(max, `Max ${max} characters`).optional().or(z.literal(''));

const AddressSchema = z.object({
  line1: optStr(200),
  line2: optStr(200),
  city: optStr(100),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Must be 6 digits').optional().or(z.literal('')),
  country: z.string().trim().default('India').optional(),
});

export const CustomerFormSchema = z.object({
  name: z
    .string({ error: 'Customer name is required' })
    .trim()
    .min(2, 'At least 2 characters')
    .max(150, 'Max 150 characters'),

  gstin: z
    .string().trim().toUpperCase()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GSTIN (e.g. 27AAPFU0939F1ZV)',
    )
    .optional()
    .or(z.literal('')),

  gstType: z.enum(['B2B', 'B2C', 'export']).default('B2C'),

  email: emailField,

  // email: z
  //   .string().email({ error: 'Invalid email' }).trim().transform(s => s.toLowerCase())
  //   .optional().or(z.literal('')),

  // email: z
  //   .string().email('Invalid email').toLowerCase().trim()
  //   .optional().or(z.literal('')),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number')
    .optional().or(z.literal('')),

  billingAddress: AddressSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  notes: optStr(1000),
});

/** @typedef {z.infer<typeof CustomerFormSchema>} CustomerFormValues */
