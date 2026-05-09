import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    selectUser,
    selectIsAuth,
    selectUserRole,
    selectIsInitialised,
    setCredentials,
    clearCredentials,
} from '../features/auth/authSlice';
import { loginApi, registerApi, logoutApi, changePasswordApi } from '../api/auth.api';

/**
 * useAuth — central hook for all authentication actions.
 *
 * Combines Redux selectors (read state) with TanStack Query mutations
 * (write/side-effect operations).
 *
 * Usage:
 *   const { user, isAuth, login, logout, isLoggingIn } = useAuth();
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const isAuth = useSelector(selectIsAuth);
    const role = useSelector(selectUserRole);
    const isInitialised = useSelector(selectIsInitialised);

    // ── Login ──────────────────────────────────────────────────────────────────

    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: ({ user, accessToken }) => {
            dispatch(setCredentials({ user, accessToken }));
            navigate('/dashboard', { replace: true });
        },
    });

    // ── Register ───────────────────────────────────────────────────────────────

    const registerMutation = useMutation({
        mutationFn: registerApi,
        onSuccess: ({ user, accessToken }) => {
            dispatch(setCredentials({ user, accessToken }));
            navigate('/dashboard', { replace: true });
        },
    });

    // ── Logout ─────────────────────────────────────────────────────────────────

    const logoutMutation = useMutation({
        mutationFn: logoutApi,
        onSettled: () => {
            // Clear state regardless of server response
            dispatch(clearCredentials());
            navigate('/login', { replace: true });
        },
    });

    // ── Change password ────────────────────────────────────────────────────────

    const changePasswordMutation = useMutation({
        mutationFn: changePasswordApi,
        onSuccess: () => {
            dispatch(clearCredentials());
            navigate('/login', { replace: true });
        },
    });

    // ── Role helpers ───────────────────────────────────────────────────────────

    const isAdmin = role === 'admin';
    const isStaff = role === 'staff';

    return {
        // State
        user,
        isAuth,
        role,
        isAdmin,
        isStaff,
        isInitialised,

        // Actions
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        register: registerMutation.mutate,
        registerAsync: registerMutation.mutateAsync,
        logout: logoutMutation.mutate,
        changePassword: changePasswordMutation.mutateAsync,

        // Loading / error states
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isChangingPassword: changePasswordMutation.isPending,

        loginError: loginMutation.error,
        registerError: registerMutation.error,
        changePasswordError: changePasswordMutation.error,
    };
};