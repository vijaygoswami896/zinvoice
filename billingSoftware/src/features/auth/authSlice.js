import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth slice — persists access token and user profile in Redux store.
 *
 * The access token lives in memory (Redux state) only.
 * Never stored in localStorage or sessionStorage.
 *
 * The refresh token lives in an httpOnly cookie set by the server —
 * JavaScript cannot read or write it.
 */

const initialState = {
    /** @type {string|null} - JWT access token (in-memory only) */
    accessToken: null,

    /** @type {{ id: string, name: string, email: string, role: string, businessId: string|null }|null} */
    user: null,

    /** Whether the initial auth check (silent refresh on page load) has completed */
    isInitialised: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Called after a successful login, register, or token refresh.
         */
        setCredentials(state, action) {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.isInitialised = true;
        },

        /**
         * Called after logout or a failed token refresh.
         * Does NOT clear the httpOnly cookie (server handles that).
         */
        clearCredentials(state) {
            state.user = null;
            state.accessToken = null;
            state.isInitialised = true;
        },

        /**
         * Marks the silent-refresh attempt as complete without credentials.
         * Used when the server returns 401 on page load (no valid refresh token).
         */
        setInitialised(state) {
            state.isInitialised = true;
        },
    },
});

export const { setCredentials, clearCredentials, setInitialised } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectAccessToken = (state) => state.auth.accessToken;
export const selectUser = (state) => state.auth.user;
export const selectIsAuth = (state) => !!state.auth.user && !!state.auth.accessToken;
export const selectUserRole = (state) => state.auth.user?.role ?? null;
export const selectIsInitialised = (state) => state.auth.isInitialised;

export default authSlice.reducer;