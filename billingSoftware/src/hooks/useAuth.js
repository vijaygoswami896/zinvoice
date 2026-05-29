import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    selectUser, selectIsAuth, selectUserRole,
    selectIsInitialised, selectIsAdmin,
    setCredentials, clearCredentials,
} from '@features/auth/authSlice';
import { authApi } from '@api/auth.api';
import { ROUTES } from '../constants/index';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const user = useSelector(selectUser);
    const isAuth = useSelector(selectIsAuth);
    const role = useSelector(selectUserRole);
    const isInitialised = useSelector(selectIsInitialised);
    const isAdmin = useSelector(selectIsAdmin);

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: ({ user, accessToken }) => {
            dispatch(setCredentials({ user, accessToken }));
            navigate(ROUTES.DASHBOARD, { replace: true });
        },
    });

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: ({ user, accessToken }) => {
            dispatch(setCredentials({ user, accessToken }));
            navigate(ROUTES.DASHBOARD, { replace: true });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            dispatch(clearCredentials());
            qc.clear();
            navigate(ROUTES.LOGIN, { replace: true });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: () => {
            dispatch(clearCredentials());
            navigate(ROUTES.LOGIN, { replace: true });
        },
    });

    return {
        user, isAuth, role, isAdmin, isInitialised,
        isStaff: role === 'staff',

        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
        changePassword: changePasswordMutation.mutateAsync,

        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isChangingPassword: changePasswordMutation.isPending,

        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
