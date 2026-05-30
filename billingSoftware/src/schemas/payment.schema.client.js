import { z } from 'zod';

// ── Reference data ────────────────────────────────────────────────────────────

export const PAYMENT_MODE_OPTIONS = [
  { value: 'cash',          label: 'Cash' },
  { value: 'upi',           label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'neft',          label: 'NEFT' },
  { value: 'rtgs',          label: 'RTGS' },
  { value: 'imps',          label: 'IMPS' },
  { value: 'other',         label: 'Other' },
];

export const PAYMENT_MODES = PAYMENT_MODE_OPTIONS.map((o) => o.value);

// Reference label for each mode (used in tables)
export const REFERENCE_LABEL = {
  cash:          'Receipt No.',
  upi:           'UPI Transaction ID',
  bank_transfer: 'Transaction Ref.',
  cheque:        'Cheque No.',
  neft:          'UTR Number',
  rtgs:          'UTR Number',
  imps:          'Transaction ID',
  other:         'Reference No.',
};

// ── Payment status (derived, not stored) ──────────────────────────────────────

export const PAYMENT_STATUS_BADGE = {
  paid:    'badge-success',
  partial: 'badge-warning',
  pending: 'badge-neutral',
};

export const PAYMENT_STATUS_LABEL = {
  paid:    'Paid',
  partial: 'Partial',
  pending: 'Pending',
};

/**
 * Derives payment status from totalPaid vs invoiceTotal.
 * @param {number} totalPaid
 * @param {number} invoiceTotal
 * @returns {'paid'|'partial'|'pending'}
 */
export const derivePaymentStatus = (totalPaid, invoiceTotal) => {
  if (totalPaid <= 0)              return 'pending';
  if (totalPaid >= invoiceTotal)   return 'paid';
  return 'partial';
};

// ── Zod schema ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

export const RecordPaymentSchema = z.object({
  invoiceId: z
    .string({ required_error: 'Invoice is required' })
    .min(1, 'Invoice is required'),

  amount: z.coerce
    .number({ required_error: 'Amount is required', invalid_type_error: 'Must be a number' })
    .positive('Must be greater than zero'),

  mode: z.enum(PAYMENT_MODES, { required_error: 'Payment mode is required' }),

  paymentDate: z
    .string({ required_error: 'Payment date is required' })
    .min(1, 'Payment date is required'),

  reference: z.string().trim().max(100).optional().or(z.literal('')),
  notes:     z.string().trim().max(500).optional().or(z.literal('')),
});
