import { useState, useCallback, useRef } from 'react';
import { usePageTitle } from '@hooks/usePageTitle';
import {
  useProducts, useCreateProduct, useUpdateProduct,
  useDeleteProduct, useProduct,
} from '@hooks/useProducts';
import ProductForm from '@components/ProductForm';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import { GST_RATE_OPTIONS } from '@schemas/product.schema.client';
import '@styles/ProductsPage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

// const fmtDate = (d) =>
//   new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const useDebounce = (fn, delay = 350) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn]);
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => (
  <span className={`badge ${type === 'goods' ? 'ptable__badge-goods' : 'ptable__badge-service'}`}>
    {type === 'goods' ? '📦' : '⚙️'} {type}
  </span>
);

const StockCell = ({ product }) => {
  if (!product.inventoryEnabled) {
    return <span className="text-tertiary">—</span>;
  }
  const cls = product.isLowStock ? 'ptable__stock ptable__stock--low' : 'ptable__stock';
  return (
    <span className={cls}>
      {product.stockQuantity}
      {product.isLowStock && (
        <span className="ptable__low-badge" title="Low stock">⚠</span>
      )}
    </span>
  );
};

const EmptyState = ({ search, onClear }) => (
  <div className="ptable__empty">
    <div className="ptable__empty-icon" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    </div>
    {search
      ? <>
        <p className="ptable__empty-title">No products found</p>
        <p className="ptable__empty-sub">{`No results for "${search}"`}</p>
        <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear search</button>
      </>
      : <>
        <p className="ptable__empty-title">No products yet</p>
        <p className="ptable__empty-sub">Add goods and services to use them on invoices.</p>
      </>}
  </div>
);

const Pagination = ({ meta, page, onPage }) => {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="ptable__pagination">
      <span className="ptable__pagination-info">
        {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
      </span>
      <div className="ptable__pagination-btns">
        <button className="btn btn-secondary btn-sm" disabled={!meta.hasPrevPage}
          onClick={() => onPage(page - 1)}>← Prev</button>
        <span className="ptable__pagination-page">{page} / {meta.totalPages}</span>
        <button className="btn btn-secondary btn-sm" disabled={!meta.hasNextPage}
          onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const ProductsPage = () => {
  usePageTitle('Products');

  // ── Filters ──────────────────────────────────────────────────────────────

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [gstFilter, setGstFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // ── Drawer ────────────────────────────────────────────────────────────────

  const [drawer, setDrawer] = useState(null); // null | 'create' | productId
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  // ── Data ──────────────────────────────────────────────────────────────────

  const queryParams = {
    page, limit: 25,
    search: search || undefined,
    type: typeFilter || undefined,
    gstRate: gstFilter !== '' ? Number(gstFilter) : undefined,
    isActive: activeFilter || undefined,
    lowStock: lowStock ? 'true' : undefined,
    sortBy, sortDir,
  };

  const { data, isLoading, isError, isFetching } = useProducts(queryParams);

  const editId = drawer && drawer !== 'create' ? drawer : null;
  const { data: editProduct, isLoading: editLoading } = useProduct(editId);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(editId);
  const deleteMutation = useDeleteProduct();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const debouncedSetSearch = useDebounce((v) => { setSearch(v); setPage(1); });

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    debouncedSetSearch(e.target.value);
  };
  const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };
  const sortIcon = (field) => sortBy !== field ? '↕' : sortDir === 'asc' ? '↑' : '↓';

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
    setDrawer(null);
  };
  const handleUpdate = async (data) => {
    await updateMutation.mutateAsync(data);
    setDrawer(null);
  };
  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const resetFilters = () => {
    setTypeFilter(''); setGstFilter(''); setActiveFilter('');
    setLowStock(false); setPage(1);
  };
  const hasFilters = typeFilter || gstFilter || activeFilter !== '' || lowStock;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Products & Services</h2>
          <p className="page-subtitle">
            {data?.meta?.total != null
              ? `${data.meta.total} item${data.meta.total !== 1 ? 's' : ''}`
              : 'Your goods and services catalogue'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setDrawer('create')}>
            <span aria-hidden="true">+</span> Add product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ptable__toolbar">
        {/* Search */}
        <div className="ptable__search-wrap">
          <span className="ptable__search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="search" className="form-input ptable__search"
            placeholder="Search name, HSN/SAC, description…"
            value={searchInput} onChange={handleSearchChange}
            aria-label="Search products"
          />
          {searchInput && (
            <button className="ptable__search-clear" onClick={handleClearSearch}
              aria-label="Clear search">×</button>
          )}
        </div>

        {/* Filters */}
        <select className="form-select ptable__filter" value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          aria-label="Filter by type">
          <option value="">All types</option>
          <option value="goods">Goods</option>
          <option value="service">Services</option>
        </select>

        <select className="form-select ptable__filter" value={gstFilter}
          onChange={(e) => { setGstFilter(e.target.value); setPage(1); }}
          aria-label="Filter by GST rate">
          <option value="">All GST rates</option>
          {GST_RATE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select className="form-select ptable__filter" value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          aria-label="Filter by status">
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <label className="ptable__low-stock-filter">
          <input type="checkbox" checked={lowStock}
            onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} />
          <span>⚠ Low stock only</span>
        </label>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            Clear filters
          </button>
        )}

        {isFetching && <span className="spinner spinner-sm" aria-label="Loading" />}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isError ? (
          <div className="alert alert-error" style={{ margin: '24px' }}>
            Failed to load products. Please refresh.
          </div>
        ) : isLoading ? (
          <div className="ptable__loading"><span className="spinner spinner-lg" /></div>
        ) : (
          <>
            <div className="ptable__scroll">
              <table className="ptable" aria-label="Products table">
                <thead>
                  <tr>
                    <th>
                      <button className="ptable__sort-btn" onClick={() => handleSort('name')}>
                        Name {sortIcon('name')}
                      </button>
                    </th>
                    <th>Type</th>
                    <th>HSN / SAC</th>
                    <th>
                      <button className="ptable__sort-btn" onClick={() => handleSort('price')}>
                        Price {sortIcon('price')}
                      </button>
                    </th>
                    <th>Unit</th>
                    <th>GST</th>
                    <th>
                      <button className="ptable__sort-btn" onClick={() => handleSort('stockQuantity')}>
                        Stock {sortIcon('stockQuantity')}
                      </button>
                    </th>
                    <th>Status</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.items?.length ? (
                    <tr><td colSpan={9}>
                      <EmptyState search={search} onClear={handleClearSearch} />
                    </td></tr>
                  ) : data.items.map((p) => (
                    <tr key={p._id} className="ptable__row">
                      <td className="ptable__name">
                        <span className="ptable__avatar" aria-hidden="true"
                          style={{
                            background: p.type === 'goods' ? 'rgba(245,166,35,0.1)' : 'rgba(96,165,250,0.1)',
                            color: p.type === 'goods' ? 'var(--color-accent)' : 'var(--color-info)'
                          }}>
                          {p.type === 'goods' ? '📦' : '⚙️'}
                        </span>
                        <div className="ptable__name-inner">
                          <span className="truncate ptable__name-text">{p.name}</span>
                          {p.description && (
                            <span className="ptable__desc truncate">{p.description}</span>
                          )}
                        </div>
                      </td>
                      <td><TypeBadge type={p.type} /></td>
                      <td className="mono ptable__hsn">
                        {p.hsnSacCode || <span className="text-tertiary">—</span>}
                      </td>
                      <td className="mono ptable__price">
                        {fmtCurrency(p.price)}
                        {p.taxIncluded && (
                          <span className="ptable__tax-incl" title="Tax inclusive">incl.</span>
                        )}
                      </td>
                      <td className="ptable__unit mono">{p.unit}</td>
                      <td className="mono ptable__gst">{p.gstRate}%</td>
                      <td><StockCell product={p} /></td>
                      <td>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="ptable__actions">
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDrawer(p._id)}
                          aria-label={`Edit ${p.name}`} title="Edit">
                          <EditIcon />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => setDeleteTarget({ id: p._id, name: p.name })}
                          aria-label={`Delete ${p.name}`} title="Delete"
                          style={{ color: 'var(--color-danger)' }}>
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data?.meta} page={page} onPage={setPage} />
          </>
        )}
      </div>

      {/* Create / Edit drawer */}
      {drawer && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawer(null)} aria-hidden="true" />
          <aside className="drawer" role="dialog" aria-modal="true"
            aria-label={drawer === 'create' ? 'New product' : 'Edit product'}>
            <div className="drawer-header">
              <h2 className="drawer-title">
                {drawer === 'create' ? 'New product' : 'Edit product'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setDrawer(null)}
                aria-label="Close"><CloseIcon /></button>
            </div>
            <div className="drawer-body">
              {editLoading && drawer !== 'create' ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <span className="spinner spinner-lg" />
                </div>
              ) : (
                <ProductForm
                  product={drawer !== 'create' ? editProduct : undefined}
                  onSubmit={drawer === 'create' ? handleCreate : handleUpdate}
                  onCancel={() => setDrawer(null)}
                  isSubmitting={createMutation.isPending || updateMutation.isPending}
                  submitError={createMutation.error || updateMutation.error}
                />
              )}
            </div>
          </aside>
        </>
      )}

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? It will no longer be available on new invoices.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default ProductsPage;
