import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import { useInvoice, useUpdateInvoiceStatus, useDeleteInvoice } from '@hooks/useInvoices';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { ROUTES } from '@constants';
import "@styles/InvoicesPage.css"
import RecordPaymentModal from '@/components/payments/RecordPaymentModal';
// import InvoiceActions from '@/features/invoices/pdf/InvoiceActions';

const InvoiceActions = lazy(() => import('@/features/invoices/pdf/InvoiceActions'));

// ── Formatters ────────────────────────────────────────────────────────────────

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2,
});
const fmt = (n) => INR.format(n ?? 0);
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  : '—';

const STATUS_BADGE = {
  draft: 'badge-neutral',
  sent: 'badge-info',
  paid: 'badge-success',
  cancelled: 'badge-danger',
  overdue: 'badge-warning',
};

// ── Address formatter ─────────────────────────────────────────────────────────

const formatAddress = (addr) => {
  if (!addr) return null;
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
    .filter(Boolean);
  return parts.length ? parts.join(', ') : null;
};

// ── Status actions config ─────────────────────────────────────────────────────

const STATUS_ACTIONS = {
  draft: [{ label: 'Mark as sent', next: 'sent' }, { label: 'Mark as paid', next: 'paid' }],
  sent: [{ label: 'Mark as paid', next: 'paid' }],
  overdue: [{ label: 'Mark as paid', next: 'paid' }],
  paid: [],
  cancelled: [],
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, mono }) => (
  value ? (
    <div className="inv-detail__info-row">
      <span className="inv-detail__info-label">{label}</span>
      <span className={`inv-detail__info-value${mono ? ' mono' : ''}`}>{value}</span>
    </div>
  ) : null
);

const TotalRow = ({ label, value, grand, muted }) => (
  <div className={`inv-detail__total-row ${grand ? 'inv-detail__total-row--grand' : ''} ${muted ? 'inv-detail__total-row--muted' : ''}`}>
    <span>{label}</span>
    <span className="mono">{fmt(value)}</span>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const statusMutation = useUpdateInvoiceStatus();
  const deleteMutation = useDeleteInvoice();

  usePageTitle(invoice?.invoiceNumber ?? 'Invoice', 'Invoices');

  // useEffect(() => {
  //   console.log('paymentOpen==> ', paymentOpen);
  // }, [paymentOpen])

  if (isLoading) {
    return (
      <div className="invoices-page">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <span className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="invoices-page">
        <div className="alert alert-error" style={{ maxWidth: 480, margin: '40px auto' }}>
          Invoice not found.
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => navigate(ROUTES.INVOICES)}>
            ← Back to invoices
          </button>
        </div>
      </div>
    );
  }

  const statusActions = STATUS_ACTIONS[invoice.status] ?? [];
  const billingAddr = formatAddress(invoice.billingAddress);
  const shippingAddr = formatAddress(invoice.shippingAddress);

  const handleStatusChange = async (next) => {
    await statusMutation.mutateAsync({ id: invoice._id, status: next });
  };

  const handleCancelConfirm = async () => {
    await deleteMutation.mutateAsync(invoice._id);
    setShowCancelModal(false);
    navigate(ROUTES.INVOICES);
  };

  return (
    <div className="invoices-page">
      {/* ── Page header with action bar ──────────────────────────────────────── */}
      <div className="inv-detail__topbar">
        <div className="inv-detail__topbar-left">
          <button className="btn btn-ghost btn-sm"
            onClick={() => navigate(ROUTES.INVOICES)}>
            ← Invoices
          </button>
          <h2 className="inv-detail__number mono">{invoice.invoiceNumber}</h2>
          <span className={`badge ${STATUS_BADGE[invoice.status] || 'badge-neutral'}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>

        <div className="inv-detail__topbar-actions">

          {/* <InvoiceActions invoice={invoice} /> */}
          <Suspense fallback={<span className="spinner spinner-sm" />}>
            <InvoiceActions invoice={invoice} />
          </Suspense>

          <button className="btn btn-primary btn-sm" onClick={() => setPaymentOpen(true)}>
            Record payment
          </button>

          {/* Status change buttons */}
          {statusActions.map(({ label, next }) => (
            <button
              key={next}
              className="btn btn-secondary btn-sm"
              onClick={() => handleStatusChange(next)}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? <span className="spinner spinner-sm" /> : label}
            </button>
          ))}

          {/* Edit (draft/sent only) */}
          {['draft', 'sent'].includes(invoice.status) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/invoices/${id}/edit`)}
            >
              <EditIcon /> Edit
            </button>
          )}

          {/* Cancel */}
          {invoice.status !== 'cancelled' && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-danger)' }}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel invoice
            </button>
          )}
        </div>
      </div>

      {/* ── Invoice document ─────────────────────────────────────────────────── */}
      <div className="inv-detail__doc">

        {/* Parties row */}
        <div className="inv-detail__parties">
          {/* Customer */}
          <div className="inv-detail__party">
            <h3 className="inv-detail__party-label">Bill to</h3>
            <p className="inv-detail__party-name">{invoice.customerName}</p>
            {invoice.customerGstin && (
              <p className="inv-detail__party-gstin mono">GSTIN: {invoice.customerGstin}</p>
            )}
            {invoice.customerEmail && (
              <p className="inv-detail__party-contact">{invoice.customerEmail}</p>
            )}
            {invoice.customerPhone && (
              <p className="inv-detail__party-contact">{invoice.customerPhone}</p>
            )}
            {billingAddr && (
              <p className="inv-detail__party-addr">{billingAddr}</p>
            )}
          </div>

          {/* Invoice meta */}
          <div className="inv-detail__meta">
            <InfoRow label="Invoice #" value={invoice.invoiceNumber} mono />
            <InfoRow label="Invoice date" value={fmtDate(invoice.invoiceDate)} />
            <InfoRow label="Due date" value={fmtDate(invoice.dueDate)} />
            <InfoRow label="Financial year" value={invoice.financialYear} />
            <InfoRow label="Supply type"
              value={invoice.isIGST ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'} />
          </div>
        </div>

        {/* Shipping address (if different) */}
        {shippingAddr && shippingAddr !== billingAddr && (
          <div className="inv-detail__shipping">
            <h3 className="inv-detail__party-label">Ship to</h3>
            <p className="inv-detail__party-addr">{shippingAddr}</p>
          </div>
        )}

        {/* ── Line items table ────────────────────────────────────────────────── */}
        <div className="inv-detail__items-wrap">
          <table className="inv-detail__items" aria-label="Invoice line items">
            <thead>
              <tr>
                <th>#</th>
                <th>Item / Service</th>
                <th>HSN/SAC</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Disc %</th>
                <th className="text-right">Taxable</th>
                <th className="text-right">GST %</th>
                {invoice.isIGST ? (
                  <th className="text-right">IGST</th>
                ) : (
                  <>
                    <th className="text-right">CGST</th>
                    <th className="text-right">SGST</th>
                  </>
                )}
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={item._id ?? i}>
                  <td className="inv-detail__item-num">{i + 1}</td>
                  <td>
                    <span className="inv-detail__item-name">{item.name}</span>
                    {item.description && (
                      <span className="inv-detail__item-desc">{item.description}</span>
                    )}
                    {item.taxIncluded && (
                      <span className="inv-detail__tax-incl-badge">Tax incl.</span>
                    )}
                  </td>
                  <td className="mono inv-detail__hsn">{item.hsnSacCode || '—'}</td>
                  <td className="text-right mono">{item.quantity} {item.unit}</td>
                  <td className="text-right mono">{fmt(item.rate)}</td>
                  <td className="text-right mono">
                    {item.discountPct > 0 ? `${item.discountPct}%` : '—'}
                  </td>
                  <td className="text-right mono">{fmt(item.taxableAmount)}</td>
                  <td className="text-right mono">{item.gstRate}%</td>
                  {invoice.isIGST ? (
                    <td className="text-right mono">{fmt(item.igst)}</td>
                  ) : (
                    <>
                      <td className="text-right mono">{fmt(item.cgst)}</td>
                      <td className="text-right mono">{fmt(item.sgst)}</td>
                    </>
                  )}
                  <td className="text-right mono inv-detail__line-total">{fmt(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Line items cards — mobile only ──────────────────────────────────── */}
        <div className="inv-detail__item-cards">
          {invoice.items.map((item, i) => (
            <div key={item._id ?? i} className="inv-detail__item-card">

              {/* Top: index + name + total */}
              <div className="inv-detail__ic-top">
                <span className="inv-detail__ic-index mono">{i + 1}</span>
                <div className="inv-detail__ic-name-wrap">
                  <span className="inv-detail__item-name">{item.name}</span>
                  {item.description && (
                    <span className="inv-detail__item-desc">{item.description}</span>
                  )}
                  {item.taxIncluded && (
                    <span className="inv-detail__tax-incl-badge">Tax incl.</span>
                  )}
                </div>
                <span className="inv-detail__ic-total mono">{fmt(item.lineTotal)}</span>
              </div>

              {/* Mid: qty × rate, discount */}
              <div className="inv-detail__ic-mid">
                <span className="inv-detail__ic-pill">
                  {item.quantity} {item.unit} × {fmt(item.rate)}
                </span>
                {item.discountPct > 0 && (
                  <span className="inv-detail__ic-pill">Disc {item.discountPct}%</span>
                )}
                {item.hsnSacCode && (
                  <span className="inv-detail__ic-pill mono">HSN {item.hsnSacCode}</span>
                )}
              </div>

              {/* Bot: tax breakdown */}
              <div className="inv-detail__ic-tax">
                <span>Taxable: <span className="mono">{fmt(item.taxableAmount)}</span></span>
                <span>GST {item.gstRate}%</span>
                {invoice.isIGST ? (
                  <span>IGST: <span className="mono">{fmt(item.igst)}</span></span>
                ) : (
                  <>
                    <span>CGST: <span className="mono">{fmt(item.cgst)}</span></span>
                    <span>SGST: <span className="mono">{fmt(item.sgst)}</span></span>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* ── Totals + Notes ──────────────────────────────────────────────────── */}
        <div className="inv-detail__footer">
          {/* Notes */}
          <div className="inv-detail__notes">
            {invoice.notes && (
              <div className="inv-detail__note-block">
                <h4 className="inv-detail__note-label">Notes</h4>
                <p className="inv-detail__note-text">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div className="inv-detail__note-block">
                <h4 className="inv-detail__note-label">Terms & conditions</h4>
                <p className="inv-detail__note-text">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="inv-detail__totals">
            <TotalRow label="Subtotal (excl. GST)" value={invoice.subtotal} />
            {invoice.isIGST ? (
              <TotalRow label="IGST" value={invoice.totalIgst} />
            ) : (
              <>
                <TotalRow label="CGST" value={invoice.totalCgst} />
                <TotalRow label="SGST" value={invoice.totalSgst} />
              </>
            )}
            <TotalRow label="Total tax" value={invoice.totalTax} muted />
            <TotalRow label="Grand total" value={invoice.grandTotal} grand />
          </div>
        </div>

        {/* Internal notes (visible only in app, not on printed invoice) */}
        {invoice.internalNotes && (
          <div className="inv-detail__internal-note">
            <span className="inv-detail__internal-badge">Internal</span>
            {invoice.internalNotes}
          </div>
        )}
      </div>

      <RecordPaymentModal
        isOpen={paymentOpen}
        invoice={invoice}
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => { setPaymentOpen(false); refetch(); }}
      />

      {/* Cancel confirmation */}
      <DeleteConfirmModal
        isOpen={showCancelModal}
        title="Cancel invoice"
        description={`Cancel ${invoice.invoiceNumber}? This permanently retires the invoice number. A new invoice must be raised for re-billing.`}
        confirmLabel="Cancel invoice"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelModal(false)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default InvoiceDetailPage;
