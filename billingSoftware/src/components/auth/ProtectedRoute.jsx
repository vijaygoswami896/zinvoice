import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    selectIsAuth,
    selectUserRole,
    selectIsInitialised,
} from '../../features/auth/authSlice';

/**
 * ProtectedRoute — guards routes behind authentication and optional RBAC.
 *
 * Waits for the silent-refresh check (AuthInitialiser) to complete before
 * making a redirect decision — prevents a flash redirect to /login on reload.
 *
 * @param {object}   props
 * @param {string[]} [props.allowedRoles] - If provided, only these roles can access the route.
 *                                          Omit to allow any authenticated user.
 * @param {string}   [props.redirectTo]   - Override the redirect target (default: '/login').
 *
 * @example
 *   // Any authenticated user
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   // Admin only
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin" element={<AdminPanel />} />
 *   </Route>
 */
const ProtectedRoute = ({ allowedRoles, redirectTo = '/login' }) => {
    const isAuth = useSelector(selectIsAuth);
    const role = useSelector(selectUserRole);
    const isInitialised = useSelector(selectIsInitialised);
    const location = useLocation();

    // While the silent-refresh check is in-flight, render nothing to avoid flicker
    // if (!isInitialised) {
    //     return null; // Or a full-page spinner if preferred
    // }

    if (!isInitialised) {
        return <div>Loading...</div>;
    }

    if (!isAuth) {
        // Preserve the intended destination so we can redirect back after login
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
