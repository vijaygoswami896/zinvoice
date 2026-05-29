import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setInitialised } from '../../features/auth/authSlice';
import { refreshApi } from '../../api/auth.api';

/**
 * AuthInitialiser — renders nothing, runs once on mount.
 *
 * On every page load / refresh, attempts a silent token refresh using the
 * httpOnly cookie. If successful, the user is seamlessly re-authenticated
 * without seeing the login page. If it fails (no cookie, expired, revoked),
 * the store is marked as initialised with no credentials.
 *
 * Mount this high in the React tree, above all routes but below the Redux
 * Provider and React Router:
 *
 *   <Provider store={store}>
 *     <BrowserRouter>
 *       <AuthInitialiser />   ← here
 *       <AppRoutes />
 *     </BrowserRouter>
 *   </Provider>
 */
const AuthInitialiser = () => {
    const dispatch = useDispatch();
    const attempted = useRef(false);

    useEffect(() => {
        if (attempted.current) return;
        attempted.current = true;

        const silentRefresh = async () => {
            try {
                const { user, accessToken } = await refreshApi();
                dispatch(setCredentials({ user, accessToken }));
            } catch {
                // no valid session
            } finally {
                // ✅ ALWAYS runs
                dispatch(setInitialised());
            }
        };

        silentRefresh();
    }, [dispatch]);

    return null;
};

export default AuthInitialiser;
