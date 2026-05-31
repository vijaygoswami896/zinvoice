import { PAYMENT_MODES } from '@/constants';
import { z } from 'zod';

/**
 * Derives payment status from totalPaid vs invoiceTotal.
 * @param {number} totalPaid
 * @param {number} invoiceTotal
 * @returns {'paid'|'partial'|'pending'}
 */
export const derivePaymentStatus = (totalPaid, invoiceTotal) => {
  if (totalPaid <= 0) return 'pending';
  if (totalPaid >= invoiceTotal) return 'paid';
  return 'partial';
};

// ── Zod schema ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

export const RecordPaymentSchema = z.object({
  invoiceId: z.string({ error: 'Invoice is required' }).min(1, 'Invoice is required'),

  amount: z.coerce.number({ error: 'Amount is required' }).positive('Must be greater than zero'),

  mode: z.enum(PAYMENT_MODES, { error: 'Payment mode is required' }),

  paymentDate: z.string({ error: 'Payment date is required' }).min(1, 'Payment date is required'),

  // invoiceId: z
  //   .string({ error: 'Invoice is required' })
  //   .min(1, 'Invoice is required'),

  // amount: z.coerce
  //   .number({ error: 'Amount is required', invalid_type_error: 'Must be a number' })
  //   .positive('Must be greater than zero'),

  // mode: z.enum(PAYMENT_MODES, { error: 'Payment mode is required' }),

  // paymentDate: z
  //   .string({ error: 'Payment date is required' })
  //   .min(1, 'Payment date is required'),

  reference: z.string().trim().max(100).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});
