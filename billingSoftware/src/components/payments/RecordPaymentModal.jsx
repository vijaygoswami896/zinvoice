import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecordPaymentSchema, derivePaymentStatus } from '@schemas/payment.schema.client';
import { PAYMENT_MODE_OPTIONS, REFERENCE_LABEL, PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABEL } from '@constants'
import { useRecordPayment, useDeletePayment, useInvoicePayments } from '@hooks/usePayments';

// ── Formatters ────────────────────────────────────────────────────────────────

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2,
});
const fmt = (n) => INR.format(n ?? 0);
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';
const today = () => new Date().toISOString().split('T')[0];

const getApiError = (err) =>
  err?.response?.data?.error?.message || 'Something went wrong. Please try again.';

// ── Progress bar ──────────────────────────────────────────────────────────────

const PaymentProgress = ({ totalPaid, invoiceTotal }) => {
  const pct = invoiceTotal > 0 ? Math.min(100, Math.round((totalPaid / invoiceTotal) * 100)) : 0;
  const status = derivePaymentStatus(totalPaid, invoiceTotal);
  const color = status === 'paid' ? 'var(--color-success)' : status === 'partial' ? 'var(--color-warning)' : 'var(--color-text-tertiary)';

  return (
    <div className="pay-modal__progress">
      <div className="pay-modal__progress-header">
        <span className={`badge ${PAYMENT_STATUS_BADGE[status]}`}>
          {PAYMENT_STATUS_LABEL[status]}
        </span>
        <span className="pay-modal__progress-pct mono">{pct}%</span>
      </div>
      <div className="pay-modal__progress-track">
        <div
          className="pay-modal__progress-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="pay-modal__progress-amounts">
        <span>Paid: <strong>{fmt(totalPaid)}</strong></span>
        <span>Balance: <strong>{fmt(Math.max(0, invoiceTotal - totalPaid))}</strong></span>
      </div>
    </div>
  );
};

// ── Main modal ────────────────────────────────────────────────────────────────

/**
 * RecordPaymentModal
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen
 * @param {object}   props.invoice     - { _id, invoiceNumber, grandTotal, customerName }
 * @param {Function} props.onClose
 * @param {Function} [props.onSuccess] - Called after a payment is recorded
 */
const RecordPaymentModal = ({ isOpen, invoice, onClose, onSuccess }) => {
  const firstInputRef = useRef(null);

  const recordMutation = useRecordPayment();
  const deleteMutation = useDeletePayment();

  const { data: paymentData, isLoading: historyLoading } = useInvoicePayments(
    isOpen ? invoice?._id : null,
  );

  const { payments = [], summary = {} } = paymentData ?? {};
  const { totalPaid = 0, invoiceTotal = invoice?.grandTotal ?? 0, balance = 0 } = summary;

  // const watchedMode = useForm({ resolver: zodResolver(RecordPaymentSchema) }).watch?.('mode');

  const {
    register, handleSubmit, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RecordPaymentSchema),
    defaultValues: {
      invoiceId: invoice?._id ?? '',
      amount: '',
      mode: 'upi',
      paymentDate: today(),
      reference: '',
      notes: '',
    },
  });

  const mode = watch('mode');

  // Reset form when invoice changes
  useEffect(() => {
    if (isOpen && invoice) {
      reset({
        invoiceId: invoice._id,
        amount: balance > 0 ? String(Number(balance).toFixed(2)) : '',
        mode: 'upi',
        paymentDate: today(),
        reference: '',
        notes: '',
      });
    }
  }, [isOpen, invoice, balance, reset]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!historyLoading)
      console.log("paymentData==>", paymentData)
  }, [paymentData, historyLoading])

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await recordMutation.mutateAsync(data);
      reset({ ...data, amount: '', reference: '', notes: '' });
      onSuccess?.();
    } catch { /* error surfaced via recordMutation.error */ }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Delete this payment? The invoice status will be recalculated.')) return;
    await deleteMutation.mutateAsync(paymentId);
  };

  const isPaid = summary.paymentStatus === 'paid';

  return (
    <div
      className="pay-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Record payment"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pay-modal">

        {/* Header */}
        <div className="pay-modal__header">
          <div>
            <h2 className="pay-modal__title">Record Payment</h2>
            <p className="pay-modal__subtitle">
              {invoice?.invoiceNumber} · {invoice?.customerName}
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Progress */}
        <div className="pay-modal__section">
          <PaymentProgress totalPaid={totalPaid} invoiceTotal={invoiceTotal} />
        </div>

        {/* Record form */}
        {!isPaid ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="pay-modal__section">
            <h3 className="pay-modal__section-title">New payment</h3>

            {recordMutation.isError && (
              <div className="alert alert-error pay-modal__alert" role="alert">
                {getApiError(recordMutation.error)}
              </div>
            )}

            <div className="pay-form__grid">

              {/* Amount */}
              <div className="form-group pay-form__amount">
                <label className="form-label">
                  Amount (₹) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="pay-form__amount-wrap">
                  <span className="pay-form__rupee">₹</span>
                  <input
                    ref={firstInputRef}
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-input mono pay-form__amount-input${errors.amount ? ' form-input--error' : ''}`}
                    placeholder="0.00"
                    {...register('amount')}
                  />
                </div>
                {balance > 0 && (
                  <button
                    type="button"
                    className="pay-form__full-btn"
                    onClick={() => {
                      const el = document.querySelector('[name="amount"]');
                      if (el) { el.value = balance.toFixed(2); el.dispatchEvent(new Event('input', { bubbles: true })); }
                    }}
                    tabIndex={-1}
                  >
                    Pay full balance {fmt(balance)}
                  </button>
                )}
                {errors.amount && <p className="form-error">{errors.amount.message}</p>}
              </div>

              {/* Mode */}
              <div className="form-group">
                <label className="form-label">
                  Payment mode <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <select
                  className={`form-select${errors.mode ? ' form-select--error' : ''}`}
                  {...register('mode')}
                >
                  {PAYMENT_MODE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.mode && <p className="form-error">{errors.mode.message}</p>}
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">
                  Payment date <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  className={`form-input mono${errors.paymentDate ? ' form-input--error' : ''}`}
                  {...register('paymentDate')}
                />
                {errors.paymentDate && <p className="form-error">{errors.paymentDate.message}</p>}
              </div>

              {/* Reference */}
              <div className="form-group">
                <label className="form-label">{REFERENCE_LABEL[mode] ?? 'Reference No.'}</label>
                <input
                  type="text"
                  className="form-input mono"
                  placeholder={mode === 'upi' ? 'e.g. 3456789012345' : mode === 'cheque' ? 'e.g. 000123' : ''}
                  {...register('reference')}
                />
              </div>

            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea rows={2} className="form-textarea" placeholder="Optional note…"
                {...register('notes')} />
            </div>

            <div className="pay-modal__form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}
                disabled={isSubmitting || recordMutation.isPending}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary"
                disabled={isSubmitting || recordMutation.isPending}>
                {recordMutation.isPending
                  ? <><span className="spinner spinner-sm" /> Recording…</>
                  : 'Record payment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="pay-modal__section">
            <div className="pay-modal__paid-notice">
              ✓ This invoice is fully paid.
            </div>
          </div>
        )}

        {/* Payment history */}
        <div className="pay-modal__section pay-modal__history">
          <h3 className="pay-modal__section-title">Payment history</h3>

          {historyLoading ? (
            <div className="pay-modal__history-loading">
              <span className="spinner spinner-sm" /> Loading…
            </div>
          ) : payments.length === 0 ? (
            <p className="pay-modal__history-empty">No payments recorded yet.</p>
          ) : (
            <div className="pay-history-table-wrap">
              <table className="pay-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Reference</th>
                    <th className="text-right">Amount</th>
                    <th><span className="sr-only">Delete</span></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="pay-history-table__date">{fmtDate(p.paymentDate)}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {p.mode.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="mono pay-history-table__ref">
                        {p.reference || <span className="text-tertiary">—</span>}
                      </td>
                      <td className="text-right mono pay-history-table__amount">
                        {fmt(p.amount)}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => handleDelete(p._id)}
                          disabled={deleteMutation.isPending}
                          aria-label="Delete payment"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="pay-history-table__foot">
                    <td colSpan={3} className="pay-history-table__total-label">Total paid</td>
                    <td className="text-right mono pay-history-table__total">{fmt(totalPaid)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

export default RecordPaymentModal;
