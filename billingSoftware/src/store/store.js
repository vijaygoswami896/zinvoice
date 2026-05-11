import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import uiReducer from '@features/ui/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        // Future: invoices, customers, products…
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: {} }),
    devTools: import.meta.env.DEV,
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
