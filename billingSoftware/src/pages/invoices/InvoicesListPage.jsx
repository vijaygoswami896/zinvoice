import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import { useInvoices, useDeleteInvoice, useUpdateInvoiceStatus } from '@hooks/useInvoices';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { ROUTES } from '@constants';
import '@styles/InvoicesPage.css';
import { FaTrash } from "react-icons/fa6";

// ── Helpers ───────────────────────────────────────────────────────────────────

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

const fmtAmount = (n) => INR.format(n ?? 0);
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const STATUS_BADGE = {
  draft: 'badge-neutral',
  sent: 'badge-info',
  paid: 'badge-success',
  cancelled: 'badge-danger',
  overdue: 'badge-warning',
};

const isOverdue = (inv) =>
  inv.status !== 'paid' &&
  inv.status !== 'cancelled' &&
  inv.dueDate &&
  new Date(inv.dueDate) < new Date();

const useDebounce = (fn, delay = 350) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn]);
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_BADGE[status] || 'badge-neutral'}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const EmptyState = ({ search, onClear }) => (
  <div className="itable__empty">
    <div className="itable__empty-icon" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </div>
    {search ? (
      <>
        <p className="itable__empty-title">No invoices found</p>
        <p className="itable__empty-sub">{`No results for "${search}"`}</p>
        <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear search</button>
      </>
    ) : (
      <>
        <p className="itable__empty-title">No invoices yet</p>
        <p className="itable__empty-sub">Create your first invoice to get started.</p>
      </>
    )}
  </div>
);

const Pagination = ({ meta, page, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="itable__pagination">
      <span className="itable__pagination-info">
        {(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
      </span>
      <div className="itable__pagination-btns">
        <button className="btn btn-secondary btn-sm"
          disabled={!meta.hasPrevPage} onClick={() => onPage(page - 1)}>← Prev</button>
        <span className="itable__pagination-page">{page} / {meta.totalPages}</span>
        <button className="btn btn-secondary btn-sm"
          disabled={!meta.hasNextPage} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const InvoicesListPage = () => {
  usePageTitle('Invoices');
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('invoiceDate');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, invoiceNumber }

  const queryParams = {
    page, limit: 25,
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy, sortDir,
  };

  const { data, isLoading, isError, isFetching } = useInvoices(queryParams);
  // console.log("invoices==>", data)
  const deleteMutation = useDeleteInvoice();
  const statusMutation = useUpdateInvoiceStatus();

  const debouncedSetSearch = useDebounce((v) => { setSearch(v); setPage(1); });

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };
  const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

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

  const handleMarkPaid = async (e, id) => {
    e.stopPropagation();
    await statusMutation.mutateAsync({ id, status: 'paid' });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="invoices-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-subtitle">
            {data?.meta?.total != null
              ? `${data.meta.total} invoice${data.meta.total !== 1 ? 's' : ''}`
              : 'All your GST tax invoices'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate(ROUTES.INVOICE_NEW)}>
            <span aria-hidden="true">+</span> New invoice
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="itable__toolbar">
        <div className="itable__search-wrap">
          <span className="itable__search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="search"
            className="form-input itable__search"
            placeholder="Search invoice # or customer name…"
            value={searchInput}
            onChange={handleSearchChange}
            aria-label="Search invoices"
          />
          {searchInput && (
            <button className="itable__search-clear" onClick={handleClearSearch}
              aria-label="Clear search">×</button>
          )}
        </div>

        <select
          className="form-select itable__filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {isFetching && <span className="spinner spinner-sm" aria-label="Loading" />}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isError ? (
          <div className="alert alert-error" style={{ margin: '24px' }}>
            Failed to load invoices. Please refresh.
          </div>
        ) : isLoading ? (
          <div className="itable__loading"><span className="spinner spinner-lg" /></div>
        ) : (
          <>
            <div className="itable__scroll">
              <table className="itable" aria-label="Invoices table">
                <thead>
                  <tr>
                    <th>
                      <button className="itable__sort-btn" onClick={() => handleSort('invoiceDate')}>
                        Invoice {sortIcon('invoiceDate')}
                      </button>
                    </th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>
                      <button className="itable__sort-btn" onClick={() => handleSort('dueDate')}>
                        Due {sortIcon('dueDate')}
                      </button>
                    </th>
                    <th className="itable__th-right">
                      <button className="itable__sort-btn itable__sort-btn--right"
                        onClick={() => handleSort('grandTotal')}>
                        Amount {sortIcon('grandTotal')}
                      </button>
                    </th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.items?.length ? (
                    <tr><td colSpan={6}>
                      <EmptyState search={search} onClear={handleClearSearch} />
                    </td></tr>
                  ) : data.items.map((inv) => {
                    const overdue = isOverdue(inv);
                    return (
                      <tr
                        key={inv._id}
                        className="itable__row"
                        onClick={() => navigate(`/invoices/${inv._id}`)}
                        style={{ cursor: 'pointer' }}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/invoices/${inv._id}`)}
                        aria-label={`Invoice ${inv.invoiceNumber}`}
                      >
                        {/* # + date */}
                        <td>
                          <span className="itable__inv-num mono">{inv.invoiceNumber}</span>
                          <span className="itable__inv-date">{fmtDate(inv.invoiceDate)}</span>
                        </td>

                        {/* Customer */}
                        <td className="itable__customer">
                          <span className="truncate">{inv.customerName}</span>
                          {inv.customerGstin && (
                            <span className="itable__gstin mono">{inv.customerGstin}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={overdue ? 'overdue' : inv.status} />
                        </td>

                        {/* Due */}
                        <td>
                          <span className={overdue ? 'itable__due-overdue' : 'text-muted'}>
                            {fmtDate(inv.dueDate)}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="itable__amount mono">
                          {fmtAmount(inv.grandTotal)}
                        </td>

                        {/* Actions */}
                        <td
                          className="itable__actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv._id}/edit`); }}
                            aria-label={`Edit ${inv.invoiceNumber}`}
                            title="Edit"
                            disabled={inv.status === 'paid' || inv.status === 'cancelled'}
                          >
                            <EditIcon />
                          </button>

                          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                            <button
                              className="itable__mark-paid-btn"
                              onClick={(e) => handleMarkPaid(e, inv._id)}
                              disabled={statusMutation.isPending}
                            // title="Mark as paid"
                            >
                              {/* ✓ Paid */}
                              Mark as Paid
                            </button>
                          )}

                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: inv._id, invoiceNumber: inv.invoiceNumber });
                            }}
                            aria-label={`Cancel ${inv.invoiceNumber}`}
                            title="Cancel invoice"
                            style={{ color: 'var(--color-danger)' }}
                            disabled={inv.status === 'cancelled'}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Card list — mobile only */}
            <div className="itable__cards">
              {data.items.map((inv) => {
                const overdue = isOverdue(inv);
                return (
                  <div
                    key={inv._id}
                    className="itable__card"
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/invoices/${inv._id}`)}
                  >
                    <div className="itable__card-top">
                      <span className="itable__inv-num mono">{inv.invoiceNumber}</span>
                      <StatusBadge status={overdue ? 'overdue' : inv.status} />
                    </div>
                    <div className="itable__card-mid">
                      <span className="itable__card-customer">{inv.customerName}</span>
                      <span className="itable__amount mono">{fmtAmount(inv.grandTotal)}</span>
                    </div>
                    <div className="itable__card-bot">
                      <span className="itable__inv-date">{fmtDate(inv.invoiceDate)}</span>
                      <div className="itable__actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv._id}/edit`); }}
                          aria-label={`Edit ${inv.invoiceNumber}`}
                          disabled={inv.status === 'paid' || inv.status === 'cancelled'}
                        ><EditIcon /></button>

                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button
                            className="itable__mark-paid-btn"
                            onClick={(e) => handleMarkPaid(e, inv._id)}
                            disabled={statusMutation.isPending}
                          >Mark as Paid</button>
                        )}

                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: inv._id, invoiceNumber: inv.invoiceNumber }); }}
                          aria-label={`Cancel ${inv.invoiceNumber}`}
                          style={{ color: 'var(--color-danger)' }}
                          disabled={inv.status === 'cancelled'}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination meta={data?.meta} page={page} onPage={setPage} />
          </>
        )}
      </div>

      {/* Delete / cancel confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Cancel invoice"
        description={`Cancel invoice "${deleteTarget?.invoiceNumber}"? This cannot be undone. The invoice number will be permanently retired and never reused.`}
        confirmLabel="Cancel invoice"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
// const TrashIcon = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
//     <path d="M10 11v6M14 11v6M9 6V4h6v2" />
//   </svg>
// );

export default InvoicesListPage;
