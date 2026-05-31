import { INVOICE_STATUSES, GST_RATES } from '@/constants';
import { z } from 'zod';

// ── Zod schemas ───────────────────────────────────────────────────────────────

export const LineItemSchema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string({ error: 'Item name is required' }).trim().min(1, 'Required').max(200),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  hsnSacCode: z.string().trim().max(8).optional().or(z.literal('')),
  unit: z.string().default('PCS'),
  itemType: z.enum(['goods', 'service']).default('goods'),
  quantity: z.coerce.number().positive('Must be > 0'),
  rate: z.coerce.number().min(0, 'Cannot be negative'),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  gstRate: z.coerce.number().refine((v) => GST_RATES.includes(v), { error: 'Invalid GST rate' }),
  taxIncluded: z.boolean().default(false),
});

export const InvoiceFormSchema = z.object({
  customerId: z.string({ error: 'Customer is required' }).min(1, 'Select a customer'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().optional().or(z.literal('')),
  items: z.array(LineItemSchema).min(1, 'Add at least one item'),
  status: z.enum(INVOICE_STATUSES).default('draft'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  termsAndConditions: z.string().trim().max(2000).optional().or(z.literal('')),
  internalNotes: z.string().trim().max(1000).optional().or(z.literal('')),
});
