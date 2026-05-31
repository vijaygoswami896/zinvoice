import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { paymentsApi } from '@api/payments.api';
import { QUERY_KEYS } from '@constants';

const KEY = QUERY_KEYS.PAYMENTS;
const INV_KEY = QUERY_KEYS.INVOICES;

// ── List all payments ─────────────────────────────────────────────────────────

export const usePayments = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    select: (res) => ({ items: res.data, meta: res.meta }),
  });

// ── Payments for a specific invoice ──────────────────────────────────────────

/**
 * Fetches payment history + summary for one invoice.
 * Used on InvoiceDetailPage and RecordPaymentModal.
 *
 * @param {string} invoiceId
 */
export const useInvoicePayments = (invoiceId) =>
  useQuery({
    queryKey: [KEY, 'invoice', invoiceId],
    queryFn: () => paymentsApi.getByInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 1000 * 30,
  });

// ── Record payment ────────────────────────────────────────────────────────────

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.record,
    onSuccess: (data) => {
      // Invalidate the invoice list and the specific invoice's payment history
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [INV_KEY] });
      if (data?.payment?.invoiceId) {
        qc.invalidateQueries({ queryKey: [KEY, 'invoice', String(data.payment.invoiceId)] });
      }
    },
  });
};

// ── Delete payment ────────────────────────────────────────────────────────────

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [INV_KEY] });
    },
  });
};
