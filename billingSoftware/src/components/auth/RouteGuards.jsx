import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    selectIsAuth,
    selectUserRole,
    selectIsInitialised,
} from '@features/auth/authSlice';
import { ROUTES } from '@constants';
import PageLoader from '../common/PageLoader'

/**
 * ProtectedRoute — requires authentication.
 * Waits for silent-refresh (isInitialised) before redirecting.
 *
 * @param {object}   props
 * @param {string[]} [props.allowedRoles] - Restrict to specific roles. Omit for any auth'd user.
 * @param {string}   [props.redirectTo]   - Fallback redirect (default: /login).
 * @param {React.ReactNode} [props.fallback] - Shown while auth is initialising.
 */
export const ProtectedRoute = ({
    allowedRoles,
    redirectTo = ROUTES.LOGIN,
    fallback = null,
}) => {
    const isAuth = useSelector(selectIsAuth);
    const role = useSelector(selectUserRole);
    const isInitialised = useSelector(selectIsInitialised);
    const location = useLocation();

    // if (!isInitialised) return fallback;
    if (!isInitialised) {
        return <PageLoader />
    }

    if (!isAuth) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }

    return <Outlet />;
};

/**
 * GuestRoute — accessible only to unauthenticated users.
 * Authenticated users are bounced to /dashboard.
 */
export const GuestRoute = ({ redirectTo = ROUTES.DASHBOARD }) => {
    const isAuth = useSelector(selectIsAuth);
    const isInitialised = useSelector(selectIsInitialised);

    if (!isInitialised) return null;

    return isAuth ? <Navigate to={redirectTo} replace /> : <Outlet />;
};
