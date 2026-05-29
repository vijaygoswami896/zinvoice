import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@components/auth/RouteGuards';
import AppLayout from '@components/layout/AppLayout';
import PageLoader from '@components/common/PageLoader';
import { ROUTES } from '@constants';
import SettingsPage from '@pages/settings/SettingsPage';
import CustomersPage from '@pages/customers/CustomersPage';

// ── Lazy page imports ─────────────────────────────────────────────────────────

// Auth
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));

// App — placeholders until modules are built
const DashboardPage = lazy(() => import('@pages/dashboard/DashboadPage'));

// Error pages
const ForbiddenPage = lazy(() => import('@pages/errors/ErrorPages'));
const NotFoundPage = lazy(() => import('@pages/errors/ErrorPages'));

// ── Routes ────────────────────────────────────────────────────────────────────

const AppRoutes = () => (
    <Suspense fallback={<PageLoader />}>
        <Routes>
            {/* Root → dashboard */}
            {/* <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} /> */}

            {/* Guest-only: redirect to /dashboard if already authenticated */}
            <Route element={<GuestRoute />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            </Route>

            {/* Protected: any authenticated user, uses AppLayout shell */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                    <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
                    {/*
            Future modules — uncomment as you build them:

            <Route path={ROUTES.INVOICES}        element={<InvoicesPage />} />
            <Route path={ROUTES.INVOICE_NEW}     element={<InvoiceNewPage />} />
            <Route path={ROUTES.INVOICE_DETAIL}  element={<InvoiceDetailPage />} />
            <Route path={ROUTES.PRODUCTS}        element={<ProductsPage />} />
            <Route path={ROUTES.PAYMENTS}        element={<PaymentsPage />} />
            <Route path={ROUTES.REPORTS}         element={<ReportsPage />} />
            <Route path={ROUTES.SETTINGS}        element={<SettingsPage />} />
          */}
                </Route>
            </Route>

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} fallback={<PageLoader />} />}>
                <Route element={<AppLayout />}>
                    {/* <Route path={ROUTES.ADMIN} element={<AdminPage />} /> */}
                </Route>
            </Route>

            {/* Utility */}
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </Suspense>
);

export default AppRoutes;
