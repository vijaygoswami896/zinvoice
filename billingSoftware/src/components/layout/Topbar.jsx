import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import {
    selectSidebarCollapsed,
    selectPageTitle,
    toggleSidebar,
} from '@features/ui/uiSlice';
import { useAuth } from '@hooks/useAuth';

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const MenuIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const BellIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

const HelpIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
);

// ── Topbar ────────────────────────────────────────────────────────────────────

const Topbar = () => {
    const dispatch = useDispatch();
    const collapsed = useSelector(selectSidebarCollapsed);
    const pageTitle = useSelector(selectPageTitle);
    const { user } = useAuth();

    // Derive breadcrumb parts: "Invoices / New Invoice" → ["Invoices", "New Invoice"]
    const parts = pageTitle?.split(' / ') ?? [pageTitle];
    const title = parts.at(-1);
    const ancestors = parts.slice(0, -1);

    const getInitials = (name = '') =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header
            className={clsx('topbar', { 'topbar--collapsed': collapsed })}
            aria-label="Top navigation"
        >
            {/* Hamburger — visible on mobile */}
            <button
                className="topbar-menu-btn"
                onClick={() => dispatch(toggleSidebar())}
                aria-label="Open navigation menu"
            >
                <MenuIcon />
            </button>

            {/* Breadcrumb */}
            <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
                {ancestors.map((ancestor, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="topbar-breadcrumb-item">{ancestor}</span>
                        <span className="topbar-sep" aria-hidden="true">/</span>
                    </span>
                ))}
                <h1 className="topbar-page-title">{title}</h1>
            </nav>

            {/* Actions */}
            <div className="topbar-actions" role="toolbar" aria-label="Toolbar actions">
                <button className="topbar-icon-btn" aria-label="Help">
                    <HelpIcon />
                </button>

                <button className="topbar-icon-btn" aria-label="Notifications">
                    <BellIcon />
                    {/* Uncomment when notifications are implemented: */}
                    {/* <span className="topbar-notification-dot" aria-hidden="true" /> */}
                </button>

                <div className="topbar-divider" aria-hidden="true" />

                {/* User avatar — links to settings */}
                <div
                    style={{
                        width: 32, height: 32,
                        background: 'var(--color-accent-muted)',
                        border: '1px solid rgba(245,166,35,0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        cursor: 'default',
                        flexShrink: 0,
                    }}
                    title={`${user?.name} (${user?.role})`}
                    aria-label={`Signed in as ${user?.name}`}
                >
                    {getInitials(user?.name)}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
