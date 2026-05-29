import { useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import {
    useCustomers,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
    useCustomer,
} from '@hooks/useCustomers';
import CustomerForm from '@components/CustomerForm';
import DeleteConfirmModal from '@components/DeleteConfirmModal';
import '@styles/CustomersPage.css';
import { FaRegEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";

// ── Constants ─────────────────────────────────────────────────────────────────
const AVATAR_COLOR = {
    B2B: { bg: '#B5D4F4', color: '#0C447C' },
    B2C: { bg: '#FAC775', color: '#633806' },
    export: { bg: '#9FE1CB', color: '#085041' },
};

const GST_BADGE = {
    B2B: 'badge-info',
    B2C: 'badge-neutral',
    export: 'badge-warning',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
//TODO: If possible, add one search button
const useDebounce = (fn, delay = 350) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const EmptyState = ({ search, onClear }) => (
    <div className="ctable__empty">
        <div className="ctable__empty-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        </div>
        {search
            ? <><p className="ctable__empty-title">No customers found</p>
                <p className="ctable__empty-sub">{`No results for "${search}"`}</p>
                <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear search</button></>
            : <><p className="ctable__empty-title">No customers yet</p>
                <p className="ctable__empty-sub">Add your first customer to get started.</p></>}
    </div>
);

// ── Pagination bar ────────────────────────────────────────────────────────────

const Pagination = ({ meta, page, onPage }) => {
    console.log("### META", meta)
    console.log("### PAGE", page)
    // if (!meta || meta.totalPages <= 1) return null;
    return (
        <div className="ctable__pagination">
            <span className="ctable__pagination-info">
                {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
            </span>
            <div className="ctable__pagination-btns">
                <button className="btn btn-secondary btn-sm" onClick={() => onPage(page - 1)}
                    disabled={!meta.hasPrevPage}>← Prev</button>
                <span className="ctable__pagination-page">{page} / {meta.totalPages}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => onPage(page + 1)}
                    disabled={!meta.hasNextPage}>Next →</button>
            </div>
        </div>
    );
};

// ── Drawer (create / edit) ────────────────────────────────────────────────────

const DrawerOverlay = ({ children, onClose }) => (
    <>
        <div className="drawer-overlay" onClick={onClose} aria-hidden="true" />
        <aside className="drawer" role="dialog" aria-modal="true">
            {children}
        </aside>
    </>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const CustomersPage = () => {
    usePageTitle('Customers');
    // const navigate = useNavigate();

    // ── State ──────────────────────────────────────────────────────────────────

    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [gstFilter, setGstFilter] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    // Drawer state: null | 'create' | customerId (edit)
    const [drawer, setDrawer] = useState(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

    // ── Data ───────────────────────────────────────────────────────────────────

    const queryParams = { page, limit: 25, search, gstType: gstFilter || undefined, sortBy, sortDir };
    const { data, isLoading, isError, isFetching } = useCustomers(queryParams);

    // Load the customer being edited
    const editId = drawer && drawer !== 'create' ? drawer : null;
    const { data: editCustomer, isLoading: editLoading } = useCustomer(editId);

    // ── Mutations ──────────────────────────────────────────────────────────────

    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer(editId);
    const deleteMutation = useDeleteCustomer();

    // ── Handlers ───────────────────────────────────────────────────────────────

    const debouncedSearch = useCallback(
        useDebounce((val) => { setSearch(val); setPage(1); }),
        []);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchInput(''); setSearch(''); setPage(1);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field); setSortDir('asc');
        }
        setPage(1);
    };

    const handleCreate = async (data) => {

        // console.log("######data inside handleCreate: ", data);

        if (data.sameAsShipping) {
            delete data.shippingAddress;
        }

        // console.log("$$$$$$$data inside handleCreate: ", data);

        await createMutation.mutateAsync(data);
        setDrawer(null);
    };

    const handleUpdate = async (data) => {

        // console.log("######data inside handleUpdate: ", data);
        if (data.sameAsShipping) {
            delete data.shippingAddress;
        }
        // console.log("$$$$$$$data inside handleCreate: ", data);

        await updateMutation.mutateAsync(data);
        setDrawer(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        await deleteMutation.mutateAsync(deleteTarget.id);
        setDeleteTarget(null);
    };

    const sortIcon = (field) =>
        sortBy !== field ? '↕' : sortDir === 'asc' ? '↑' : '↓';

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="customers-page">

            {/* Page header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Customers</h2>
                    <p className="page-subtitle">
                        {data?.meta?.total != null
                            ? `${data.meta.total} customer${data.meta.total !== 1 ? 's' : ''}`
                            : 'Manage your customer directory'}
                    </p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => setDrawer('create')}>
                        <span aria-hidden="true">+</span> Add customer
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="ctable__toolbar">
                <div className="ctable__search-wrap">
                    <span className="ctable__search-icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </span>
                    <input
                        type="search"
                        className="form-input ctable__search"
                        placeholder="Search name, email, GSTIN…"
                        value={searchInput}
                        onChange={handleSearchChange}
                        aria-label="Search customers"
                    />
                    {searchInput && (
                        <button className="ctable__search-clear" onClick={handleClearSearch} aria-label="Clear search">×</button>
                    )}
                </div>

                <select
                    className="form-select ctable__filter"
                    value={gstFilter}
                    onChange={(e) => { setGstFilter(e.target.value); setPage(1); }}
                    aria-label="Filter by GST type"
                >
                    <option value="">All types</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                    <option value="export">Export</option>
                </select>

                {isFetching && <span className="spinner spinner-sm" aria-label="Loading" />}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {isError ? (
                    <div className="alert alert-error" style={{ margin: '24px' }}>
                        Failed to load customers. Please refresh.
                    </div>
                ) : isLoading ? (
                    <div className="ctable__loading">
                        <span className="spinner spinner-lg" />
                    </div>
                ) : (
                    <>
                        <div className="ctable__scroll">
                            <table className="ctable" aria-label="Customers table">
                                <thead>
                                    <tr>
                                        <th>
                                            <button className="ctable__sort-btn" onClick={() => handleSort('name')}>
                                                Name {sortIcon('name')}
                                            </button>
                                        </th>
                                        <th>Type</th>
                                        <th>GSTIN</th>
                                        <th>Email / Phone</th>
                                        <th>State</th>
                                        <th>
                                            <button className="ctable__sort-btn" onClick={() => handleSort('createdAt')}>
                                                Added {sortIcon('createdAt')}
                                            </button>
                                        </th>
                                        <th><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.items?.length === 0 ? (
                                        <tr>
                                            <td colSpan={7}>
                                                <EmptyState search={search} onClear={handleClearSearch} />
                                            </td>
                                        </tr>
                                    ) : (
                                        data?.items?.map((c) => (
                                            <tr key={c._id} className="ctable__row">
                                                <td className="ctable__name">
                                                    <span
                                                        className="ctable__avatar"
                                                        aria-hidden="true"
                                                        style={{ background: AVATAR_COLOR[c.gstType]?.bg, color: AVATAR_COLOR[c.gstType]?.color }}
                                                    >
                                                        {c.name[0].toUpperCase()}
                                                    </span>
                                                    <span className="truncate">{c.name}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${GST_BADGE[c.gstType] || 'badge-neutral'}`}>
                                                        {c.gstType}
                                                    </span>
                                                </td>
                                                <td className="mono ctable__gstin">
                                                    {c.gstin || <span className="text-tertiary">—</span>}
                                                </td>
                                                <td className="ctable__contact">
                                                    {c.email && <span>{c.email}</span>}
                                                    {c.phone && <span className="text-muted">{c.phone}</span>}
                                                    {!c.email && !c.phone && <span className="text-tertiary">—</span>}
                                                </td>
                                                <td className="ctable__state">
                                                    {c.billingAddress?.state || <span className="text-tertiary">—</span>}
                                                </td>
                                                <td className="ctable__date text-muted">
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="ctable__actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm btn-icon"
                                                        onClick={() => setDrawer(c._id)}
                                                        aria-label={`Edit ${c.name}`}
                                                        title="Edit"
                                                    >
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm btn-icon"
                                                        onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                                                        aria-label={`Delete ${c.name}`}
                                                        title="Delete"
                                                        style={{ color: 'var(--color-danger)' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination meta={data?.meta} page={page} onPage={setPage} />
                    </>
                )}
            </div>

            {/* Create / Edit drawer */}
            {drawer && (
                <DrawerOverlay onClose={() => setDrawer(null)}>
                    <div className="drawer-header">
                        <h2 className="drawer-title">
                            {drawer === 'create' ? 'New customer' : 'Edit customer'}
                        </h2>
                        <button className="btn btn-ghost btn-icon" onClick={() => setDrawer(null)} aria-label="Close">
                            <IoCloseSharp />
                        </button>
                    </div>
                    <div className="drawer-body">
                        {editLoading && drawer !== 'create' ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                <span className="spinner spinner-lg" />
                            </div>
                        ) : (
                            <CustomerForm
                                customer={drawer !== 'create' ? editCustomer : undefined}
                                onSubmit={drawer === 'create' ? handleCreate : handleUpdate}
                                onCancel={() => setDrawer(null)}
                                isSubmitting={createMutation.isPending || updateMutation.isPending}
                                submitError={createMutation.error || updateMutation.error}
                            />
                        )}
                    </div>
                </DrawerOverlay>
            )}

            {/* Delete confirmation */}
            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                title="Delete customer"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};

export default CustomersPage;
