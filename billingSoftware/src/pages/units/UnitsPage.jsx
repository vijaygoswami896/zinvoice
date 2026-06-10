import { useState } from 'react';
import {
    useUnits,
    useDeleteUnit,
    useRestoreUnit,
} from '@hooks/useUnits.js';
import UnitFormModal from '@components/units/UnitFormModal';
import styles from '@styles/UnitsPage.module.css';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function UnitsPage() {
    usePageTitle('Units');

    const [tab, setTab] = useState('active');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalUnit, setModalUnit] = useState(undefined);
    // undefined = closed, null = create mode, Unit = edit mode

    const isDeleted = tab === 'deleted';

    const { data, isLoading, isError } = useUnits({
        search: search || undefined,
        includeDeleted: isDeleted,
        isDefault: isDeleted ? undefined : undefined,
        page,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const deleteUnit = useDeleteUnit();
    const restoreUnit = useRestoreUnit();

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleDelete = async (unit) => {
        if (!confirm(`Delete "${unit.name}"? It will be hidden but not permanently removed.`)) return;
        await deleteUnit.mutateAsync(unit._id);
    };

    const handleRestore = async (unit) => {
        await restoreUnit.mutateAsync(unit._id);
    };

    const units = data?.data ?? [];
    const total = data?.meta?.total ?? 0;
    const totalPages = data?.meta?.totalPages ?? 1;

    return (
        <div className={styles.page}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className={styles.header}>
                <div>
                    <h1>Units</h1>
                    <p className={styles.subtitle}>
                        Manage measurement units used across products and invoices.
                    </p>
                </div>
                <button
                    className={styles.addBtn}
                    onClick={() => setModalUnit(null)}
                >
                    + New Unit
                </button>
            </div>

            {/* ── Toolbar ────────────────────────────────────────────────── */}
            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === 'active' ? styles.tabActive : ''}`}
                        onClick={() => { setTab('active'); setPage(1); }}
                    >
                        Active
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'deleted' ? styles.tabActive : ''}`}
                        onClick={() => { setTab('deleted'); setPage(1); }}
                    >
                        Deleted
                    </button>
                </div>

                <input
                    type="search"
                    className={styles.search}
                    placeholder="Search units…"
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            {/* ── Table ──────────────────────────────────────────────────── */}
            <div className={styles.tableWrap}>
                {isLoading && <p className={styles.stateMsg}>Loading…</p>}
                {isError && <p className={styles.stateMsgError}>Failed to load units.</p>}

                {!isLoading && !isError && units.length === 0 && (
                    <p className={styles.stateMsg}>
                        {search ? 'No units match your search.' : `No ${tab} units found.`}
                    </p>
                )}

                {!isLoading && units.length > 0 && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Short Name</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((unit) => (
                                <tr key={unit._id} className={isDeleted ? styles.rowDeleted : ''}>
                                    <td>{unit.name}</td>
                                    <td>
                                        <span className={styles.shortName}>{unit.shortName}</span>
                                    </td>
                                    <td>
                                        {unit.isDefault ? (
                                            <span className={styles.badgeDefault}>Default</span>
                                        ) : (
                                            <span className={styles.badgeCustom}>Custom</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {!isDeleted && (
                                                <>
                                                    {!unit.isDefault && (
                                                        <button
                                                            className={styles.editBtn}
                                                            onClick={() => setModalUnit(unit)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {!unit.isDefault && (
                                                        <button
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDelete(unit)}
                                                            disabled={deleteUnit.isPending}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                    {unit.isDefault && (
                                                        <span className={styles.immutable}>—</span>
                                                    )}
                                                </>
                                            )}
                                            {isDeleted && (
                                                <button
                                                    className={styles.restoreBtn}
                                                    onClick={() => handleRestore(unit)}
                                                    disabled={restoreUnit.isPending}
                                                >
                                                    Restore
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Mobile Cards ───────────────────────────────────────────────── */}
            <div className={styles.cardList}>
                {!isLoading && !isError && units.length === 0 && (
                    <p className={styles.stateMsg}>
                        {search ? 'No units match your search.' : `No ${tab} units found.`}
                    </p>
                )}
                {!isLoading && units.map((unit) => (
                    <div
                        key={unit._id}
                        className={`${styles.card} ${isDeleted ? styles.cardDeleted : ''}`}
                    >
                        <div className={styles.cardLeft}>
                            <span className={styles.cardName}>{unit.name}</span>
                            <span className={styles.cardShort}>{unit.shortName}</span>
                            {unit.isDefault
                                ? <span className={styles.badgeDefault}>Default</span>
                                : <span className={styles.badgeCustom}>Custom</span>
                            }
                        </div>
                        <div className={styles.cardRight}>
                            {!isDeleted && !unit.isDefault && (
                                <>
                                    <button className={styles.editBtn} onClick={() => setModalUnit(unit)}>Edit</button>
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(unit)} disabled={deleteUnit.isPending}>Delete</button>
                                </>
                            )}
                            {isDeleted && (
                                <button className={styles.restoreBtn} onClick={() => handleRestore(unit)} disabled={restoreUnit.isPending}>Restore</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Pagination ─────────────────────────────────────────────── */}
            {/* {totalPages > 1 && ( */}
            <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                    {total} unit{total !== 1 ? 's' : ''}
                </span>
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={styles.pageBtn}
                    >
                        ← Prev
                    </button>
                    <span className={styles.pageIndicator}>
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={styles.pageBtn}
                    >
                        Next →
                    </button>
                </div>
            </div>
            {/* )} */}

            {/* ── Modal ──────────────────────────────────────────────────── */}
            {modalUnit !== undefined && (
                <UnitFormModal
                    unit={modalUnit}
                    onClose={() => setModalUnit(undefined)}
                />
            )}

        </div>
    );
}