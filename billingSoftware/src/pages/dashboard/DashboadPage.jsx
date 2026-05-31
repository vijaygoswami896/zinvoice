import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@hooks/usePageTitle';
import { useDashboard } from '@hooks/useDashboard';
import StatCard from '@components/dashboard/StatCard';
import RevenueChart from '@components/dashboard/RevenueChart';
import GSTBreakdownCard from '@components/dashboard/GSTBreakdownCard';
import RecentInvoicesTable from '@components/dashboard/RecentInvoicesTable';
import TopCustomersCard from '@components/dashboard/TopCustomersCard';
import { ROUTES } from '@constants';
import { fmt } from '@utils/index'
import '@styles/DashboardPage.css';

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = ({ d, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const Icons = {
    Invoice: () => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8" />,
    Paid: () => <Icon d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />,
    Pending: () => <Icon d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM12 6v6l4 2" />,
    Overdue: () => <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />,
    Revenue: () => <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
    GST: () => <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
    Customer: () => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    Product: () => <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
};

// ── Revenue range selector ────────────────────────────────────────────────────

const RANGE_OPTIONS = [
    { label: '3 months', value: 3 },
    { label: '6 months', value: 6 },
    { label: '12 months', value: 12 },
];

// ── Main page ─────────────────────────────────────────────────────────────────

const DashboardPage = () => {
    usePageTitle('Dashboard');
    const navigate = useNavigate();

    const [revenueMonths, setRevenueMonths] = useState(12);
    const { data, isLoading, isError, dataUpdatedAt } = useDashboard({ revenueMonths });

    const summary = data?.summary;
    const fy = summary?.fy;
    const lifetime = summary?.lifetime;
    const monthlyRevenue = data?.monthlyRevenue ?? [];
    const gstSummary = data?.gstSummary;
    const recentInvoices = data?.recentInvoices ?? [];
    const topCustomers = data?.topCustomers ?? [];
    const entityCounts = data?.entityCounts;

    const loading = isLoading;

    if (isError) {
        return (
            <div className="dashboard-page">
                <div className="alert alert-error" style={{ maxWidth: 480 }}>
                    Failed to load dashboard. Please refresh.
                </div>
            </div>
        );
    }

    const lastUpdated = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div className="dashboard-page">

            {/* ── Page header ───────────────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Dashboard</h2>
                    <p className="page-subtitle">
                        {summary?.financialYear ? `FY ${summary.financialYear}` : 'Loading…'}
                        {lastUpdated && <span className="dashboard-updated"> · Updated {lastUpdated}</span>}
                    </p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => navigate(ROUTES.INVOICE_NEW)}>
                        + New invoice
                    </button>
                </div>
            </div>

            {/* ── KPI stat cards row ────────────────────────────────────────────── */}
            <div className="dashboard-stats">

                <StatCard
                    label="Total Revenue (FY)"
                    value={fmt(fy?.totalRevenue)}
                    sub={`${fy?.totalInvoices ?? 0} invoices`}
                    icon={<Icons.Revenue />}
                    color="var(--color-accent)"
                    loading={loading}
                    onClick={() => navigate(ROUTES.INVOICES)}
                />

                <StatCard
                    label="Paid"
                    value={fmt(fy?.paid?.value)}
                    sub={`${fy?.paid?.count ?? 0} invoices`}
                    icon={<Icons.Paid />}
                    color="var(--color-success)"
                    loading={loading}
                    onClick={() => navigate(`${ROUTES.INVOICES}?status=paid`)}
                />

                <StatCard
                    label="Pending"
                    value={fmt(fy?.sent?.value)}
                    sub={`${fy?.sent?.count ?? 0} invoices`}
                    icon={<Icons.Pending />}
                    color="var(--color-info)"
                    loading={loading}
                    onClick={() => navigate(`${ROUTES.INVOICES}?status=sent`)}
                />

                <StatCard
                    label="Overdue"
                    value={String(summary?.overdueCount ?? 0)}
                    sub="invoices past due"
                    icon={<Icons.Overdue />}
                    color="var(--color-danger)"
                    loading={loading}
                    onClick={() => navigate(ROUTES.INVOICES)}
                />

                <StatCard
                    label="GST Collected (FY)"
                    value={fmt(fy?.totalTax)}
                    sub={`of ${fmt(fy?.totalRevenue)} revenue`}
                    icon={<Icons.GST />}
                    color="var(--color-warning)"
                    loading={loading}
                />

                <StatCard
                    label="Customers"
                    value={String(entityCounts?.customers ?? '—')}
                    sub={entityCounts?.products != null ? `${entityCounts.products} products` : undefined}
                    icon={<Icons.Customer />}
                    color="#a78bfa"
                    loading={loading}
                    onClick={() => navigate(ROUTES.CUSTOMERS)}
                />

            </div>

            {/* ── Charts row ────────────────────────────────────────────────────── */}
            <div className="dashboard-charts">

                {/* Revenue chart — takes 2/3 width */}
                <div className="dashboard-charts__main">
                    {/* Range selector */}
                    <div className="dashboard-range-selector">
                        {RANGE_OPTIONS.map(({ label, value }) => (
                            <button
                                key={value}
                                className={`dashboard-range-btn${revenueMonths === value ? ' dashboard-range-btn--active' : ''}`}
                                onClick={() => setRevenueMonths(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <RevenueChart
                        data={monthlyRevenue}
                        loading={loading}
                    />
                </div>

                {/* GST breakdown — takes 1/3 */}
                <GSTBreakdownCard
                    gstSummary={gstSummary}
                    loading={loading}
                />

            </div>

            {/* ── Bottom row: recent invoices + top customers ───────────────────── */}
            <div className="dashboard-bottom">
                <RecentInvoicesTable
                    invoices={recentInvoices}
                    loading={loading}
                />
                <TopCustomersCard
                    customers={topCustomers}
                    loading={loading}
                />
            </div>

            {/* ── Low stock alert ───────────────────────────────────────────────── */}
            {!loading && entityCounts?.lowStock > 0 && (
                <div
                    className="alert alert-warning dashboard-alert"
                    role="alert"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`${ROUTES.PRODUCTS}?lowStock=true`)}
                >
                    ⚠ {entityCounts.lowStock} product{entityCounts.lowStock !== 1 ? 's' : ''} with low stock.{' '}
                    <strong>View products →</strong>
                </div>
            )}

        </div>
    );
};

export default DashboardPage;
