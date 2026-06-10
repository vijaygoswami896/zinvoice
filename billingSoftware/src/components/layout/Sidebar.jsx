import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
    selectSidebarCollapsed,
    selectSidebarMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    setSidebarCollapsed,
} from '@features/ui/uiSlice';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants';
import {
    LuHouse,        // Dashboard
    LuFileText,     // Invoices
    LuUsers,        // Customers
    LuPackage,      // Products
    LuDollarSign,   // Payments
    LuChartBar,    // Reports
    LuSettings,     // Settings
    LuShield,       // Admin
    LuRuler,       //units
    LuChevronLeft,
    LuChevronRight,
    LuLogOut,
} from "react-icons/lu";

// ── SVG icon components (inline, no external dep) ────────────────────────────

const Icon = ({ d, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

// const Icons = {
//     Dashboard: () => <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />,
//     Invoices: () => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
//     Customers: () => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
//     Products: () => <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
//     Payments: () => <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
//     Reports: () => <Icon d="M18 20V10M12 20V4M6 20v-6" />,
//     Settings: () => <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />,
//     Admin: () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
//     ChevronLeft: () => <Icon d="M15 18l-6-6 6-6" size={16} />,
//     ChevronRight: () => <Icon d="M9 18l6-6-6-6" size={16} />,
//     LogOut: () => <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={16} />,
// };

// ── Nav configuration ─────────────────────────────────────────────────────────

const Icons = {
    Dashboard: () => <LuHouse size={18} strokeWidth={1.75} />,
    Invoices: () => <LuFileText size={18} strokeWidth={1.75} />,
    Customers: () => <LuUsers size={18} strokeWidth={1.75} />,
    Products: () => <LuPackage size={18} strokeWidth={1.75} />,
    Units: () => <LuRuler size={18} strokeWidth={1.75} />,
    Payments: () => <LuDollarSign size={18} strokeWidth={1.75} />,
    Reports: () => <LuChartBar size={18} strokeWidth={1.75} />,
    Settings: () => <LuSettings size={18} strokeWidth={1.75} />,
    Admin: () => <LuShield size={18} strokeWidth={1.75} />,
    ChevronLeft: () => <LuChevronLeft size={16} strokeWidth={1.75} />,
    ChevronRight: () => <LuChevronRight size={16} strokeWidth={1.75} />,
    LogOut: () => <LuLogOut size={16} strokeWidth={1.75} />,
};

const NAV_SECTIONS = [
    {
        label: 'Main',
        items: [
            { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: Icons.Dashboard },
            { to: ROUTES.INVOICES, label: 'Invoices', icon: Icons.Invoices },
            { to: ROUTES.CUSTOMERS, label: 'Customers', icon: Icons.Customers },
            { to: ROUTES.UNITS, label: 'Units', icon: Icons.Units },
            { to: ROUTES.PRODUCTS, label: 'Products', icon: Icons.Products },
            { to: ROUTES.PAYMENTS, label: 'Payments', icon: Icons.Payments },
        ],
    },
    {
        label: 'Insights',
        items: [
            { to: ROUTES.REPORTS, label: 'Reports', icon: Icons.Reports },
        ],
    },
    {
        label: 'System',
        items: [
            { to: ROUTES.SETTINGS, label: 'Settings', icon: Icons.Settings },
            { to: ROUTES.ADMIN, label: 'Admin', icon: Icons.Admin, adminOnly: true },
        ],
    },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const collapsed = useSelector(selectSidebarCollapsed);
    const mobileOpen = useSelector(selectSidebarMobileOpen);
    const { user, isAdmin, logout, isLoggingOut } = useAuth();

    const handleNavClick = () => {
        dispatch(closeMobileSidebar());
    };

    const getInitials = (name = '') =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => dispatch(closeMobileSidebar())}
                    aria-hidden="true"
                />
            )}

            <aside
                className={clsx('sidebar', {
                    'sidebar--collapsed': collapsed,
                    'sidebar--mobile-open': mobileOpen,
                })}
                aria-label="Main navigation"
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">₹</div>
                    <div className="sidebar-brand-text">
                        <div className="sidebar-brand-name">GST Billing</div>
                        <div className="sidebar-brand-tagline">India</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav" aria-label="App navigation">
                    {NAV_SECTIONS.map((section) => {
                        const visibleItems = section.items.filter(
                            (item) => !item.adminOnly || isAdmin,
                        );
                        if (!visibleItems.length) return null;

                        return (
                            <div key={section.label} className="sidebar-section">
                                <div className="sidebar-section-label">{section.label}</div>
                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={handleNavClick}
                                        className={({ isActive }) =>
                                            clsx('sidebar-item', { 'sidebar-item--active': isActive })
                                        }
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <span className="sidebar-item-icon" aria-hidden="true">
                                            <item.icon />
                                        </span>
                                        <span className="sidebar-item-label">{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    {/* User profile */}
                    <div
                        className="sidebar-user"
                        onClick={() => navigate(ROUTES.SETTINGS)}
                        title={collapsed ? `${user?.name} · ${user?.role}` : undefined}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.SETTINGS)}
                    >
                        <div className="sidebar-avatar" aria-hidden="true">
                            {getInitials(user?.name)}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                    </div>

                    {/* Logout */}
                    {!collapsed && (
                        <button
                            className="sidebar-item"
                            onClick={() => logout()}
                            disabled={isLoggingOut}
                            style={{ marginTop: '4px', color: 'var(--color-danger)', opacity: isLoggingOut ? 0.5 : 1 }}
                        >
                            <span className="sidebar-item-icon"><Icons.LogOut /></span>
                            <span className="sidebar-item-label">
                                {isLoggingOut ? 'Logging out…' : 'Log out'}
                            </span>
                        </button>
                    )}

                    {/* Collapse toggle (desktop only) */}
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
