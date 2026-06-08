import { useState } from 'react';
import { usePageTitle } from '@hooks/usePageTitle';
import { usePayments, useDeletePayment } from '@hooks/usePayments';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { PAYMENT_MODE_OPTIONS } from '@/constants';
import { fmt, fmtDate } from "@utils/index"
import '@styles/PaymentsPage.css';
import { FaTrash } from 'react-icons/fa6';

// ── Formatters ───────────────────────────────────────────────────────────────
const MODE_LABEL = Object.fromEntries(PAYMENT_MODE_OPTIONS.map(({ value, label }) => [value, label]));

// ── Sub-components ────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="ptable__empty">
    <div className="ptable__empty-icon" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    </div>
    <p className="ptable__empty-title">No payments yet</p>
    <p className="ptable__empty-sub">Record payments against invoices to see them here.</p>
  </div>
);

const Pagination = ({ meta, page, onPage }) => {
  // if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="payments-pagination">
      <span className="payments-pagination__info">
        {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
      </span>
      <div className="payments-pagination__btns">
        <button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage}
          onClick={() => onPage(page - 1)}>← Prev</button>
        <span className="payments-pagination__page">{page} / {meta.totalPages}</span>
        <button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage}
          onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const PaymentsPage = () => {
  usePageTitle('Payments');

  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState('');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const queryParams = {
    page, limit: 25,
    mode: modeFilter || undefined,
    sortBy, sortDir,
  };

  const { data, isLoading, isError, isFetching } = usePayments(queryParams);
  const deleteMutation = useDeletePayment();

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };
  const sortIcon = (f) => sortBy !== f ? '↕' : sortDir === 'asc' ? '↑' : '↓';

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="payments-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Payments</h2>
          <p className="page-subtitle">
            {data?.meta?.total != null
              ? `${data.meta.total} payment record${data.meta.total !== 1 ? 's' : ''}`
              : 'All recorded payments'}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="payments-toolbar">
        <select className="form-select payments-filter" value={modeFilter}
          onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}
          aria-label="Filter by payment mode">
          <option value="">All modes</option>
          {PAYMENT_MODE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {isFetching && <span className="spinner spinner-sm" aria-label="Loading" />}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isError ? (
          <div className="alert alert-error" style={{ margin: '24px' }}>
            Failed to load payments. Please refresh.
          </div>
        ) : isLoading ? (
          <div className="payments-loading"><span className="spinner spinner-lg" /></div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="payments-scroll payments-desktop-only">
              <table className="payments-table" aria-label="Payments">
                <thead>
                  <tr>
                    <th>
                      <button className="payments-sort-btn" onClick={() => handleSort('paymentDate')}>
                        Date {sortIcon('paymentDate')}
                      </button>
                    </th>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Mode</th>
                    <th>Reference</th>
                    <th>
                      <button className="payments-sort-btn payments-sort-btn--right"
                        onClick={() => handleSort('amount')}>
                        Amount {sortIcon('amount')}
                      </button>
                    </th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.items?.length ? (
                    <tr><td colSpan={7}><EmptyState /></td></tr>
                  ) : data.items.map((p) => (
                    <tr key={p._id} className="payments-table__row">
                      <td className="payments-table__date">
                        {fmtDate(p.paymentDate)}
                      </td>
                      <td className="payments-table__inv mono">
                        {p.invoiceNumber}
                      </td>
                      <td className="payments-table__customer truncate">
                        {p.customerName || '—'}
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                          {MODE_LABEL[p.mode] ?? p.mode}
                        </span>
                      </td>
                      <td className="mono payments-table__ref">
                        {p.reference || <span className="text-tertiary">—</span>}
                      </td>
                      <td className="text-right mono payments-table__amount">
                        {fmt(p.amount)}
                      </td>
                      <td className="payments-table__actions">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteTarget({ id: p._id })}
                          aria-label="Delete payment"
                          title="Delete"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="payments-mobile-cards">
              {!data?.items?.length ? (
                <EmptyState />
              ) : data.items.map((p) => (
                <div key={p._id} className="pycard">
                  <div className="pycard__top">
                    <div className="pycard__main">
                      <span className="pycard__invoice mono">{p.invoiceNumber}</span>
                      <span className="pycard__customer">{p.customerName || '—'}</span>
                    </div>
                    <div className="pycard__right">
                      <span className="pycard__amount mono">{fmt(p.amount)}</span>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => setDeleteTarget({ id: p._id })}
                        aria-label="Delete payment"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="pycard__meta">
                    <span className="pycard__date">{fmtDate(p.paymentDate)}</span>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {MODE_LABEL[p.mode] ?? p.mode}
                    </span>
                    {p.reference && (
                      <span className="pycard__ref mono">{p.reference}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination meta={data?.meta} page={page} onPage={setPage} />
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete payment"
        description="Delete this payment record? The invoice payment status will be recalculated automatically."
        confirmLabel="Delete payment"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

// const TrashIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6M9 6V4h6v2" />
//   </svg>
// );

export default PaymentsPage;
