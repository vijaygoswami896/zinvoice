import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

/**
 * Redux store.
 *
 * Import this into your React root to wrap with <Provider store={store}>.
 * Also imported directly by the Axios instance to read/write auth state
 * outside of the React component tree.
 *
 * Intentionally NOT using redux-persist — the access token lives in memory
 * only. Session restoration is handled by the httpOnly cookie + AuthInitialiser
 * silent-refresh pattern.
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        // Add future slices here: business, ui, etc.
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Nothing non-serialisable in this store currently
            },
        }),
    devTools: import.meta.env.DEV,
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
