import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GuestRoute from '../components/auth/GuestRoute';

// Lazy-load pages for code splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboadPage'));

// Placeholder pages — replace with real implementations
// const AdminPage = lazy(() => import('../pages/AdminPage'));
// const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));
// const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

/**
 * AppRoutes — central route definitions.
 *
 * Route guard hierarchy:
 *   <GuestRoute>     — visible only to unauthenticated users
 *   <ProtectedRoute> — requires authentication
 *     allowedRoles   — optional RBAC narrowing
 */
const AppRoutes = () => (
    <Suspense fallback={<div className="page-loading">Loading…</div>}>
        <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            {/* Guest-only routes (redirect to /dashboard if already logged in) */}
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected: any authenticated role */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* Add further protected routes here:
            /invoices, /customers, /products, /payments, /settings … */}
            </Route>

            {/* Protected: admin only */}
            {/* <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminPage />} />
            </Route> */}

            {/* Utility */}
            {/* <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
    </Suspense>
);

export default AppRoutes;
