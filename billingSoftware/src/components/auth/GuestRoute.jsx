import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectIsInitialised } from '../../features/auth/authSlice';

/**
 * GuestRoute — only accessible to unauthenticated users.
 *
 * Wraps /login and /register so that authenticated users are
 * automatically redirected to /dashboard.
 *
 * @example
 *   <Route element={<GuestRoute />}>
 *     <Route path="/login"    element={<LoginPage />} />
 *     <Route path="/register" element={<RegisterPage />} />
 *   </Route>
 */
const GuestRoute = ({ redirectTo = '/dashboard' }) => {
    const isAuth = useSelector(selectIsAuth);
    const isInitialised = useSelector(selectIsInitialised);

    // if (!isInitialised) return null;

    if (!isInitialised) {
        return <div className="page-loading">Loading...</div>;
    }

    return isAuth ? <Navigate to={redirectTo} replace /> : <Outlet />;
};

export default GuestRoute;
