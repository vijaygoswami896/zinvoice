import api from './axiosInstance';
import { selectAccessToken, setCredentials, clearCredentials } from '@features/auth/authSlice'

/**
 * setupInterceptors — wires auth-aware request/response interceptors.
 *
 * Called once at app boot with the Redux store instance.
 * Separated from axiosInstance.js so the store can be created first
 * without circular import issues.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 */
export const setupInterceptors = (store) => {

    // ── Request: inject access token ────────────────────────────────────────────
    api.interceptors.request.use(
        async (config) => {
            // const { selectAccessToken } = await getSelectors();
            const token = selectAccessToken(store.getState());
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    // ── Response: handle 401 with silent refresh + subscriber queue ────────────
    let isRefreshing = false;
    let subscribers = [];

    const subscribeToRefresh = (cb) => subscribers.push(cb);
    const notifySubscribers = (token) => { subscribers.forEach((cb) => cb(token)); subscribers = []; };

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            // const { setCredentials, clearCredentials } = await getSelectors();
            const original = error.config;

            const is401 = error.response?.status === 401;
            const isRefreshRoute = original.url?.includes('/auth/refresh');
            const alreadyRetried = original._retried;

            if (is401 && !isRefreshRoute && !alreadyRetried) {
                original._retried = true;

                if (isRefreshing) {
                    // Queue concurrent requests until refresh completes
                    return new Promise((resolve, reject) => {
                        subscribeToRefresh((newToken) => {
                            if (!newToken) return reject(error);
                            original.headers.Authorization = `Bearer ${newToken}`;
                            resolve(api(original));
                        });
                    });
                }

                isRefreshing = true;

                try {
                    const { data } = await api.post('/auth/refresh');
                    const { user, accessToken } = data.data;
                    store.dispatch(setCredentials({ user, accessToken }));
                    notifySubscribers(accessToken);
                    original.headers.Authorization = `Bearer ${accessToken}`;
                    return api(original);
                } catch {
                    notifySubscribers(null);
                    store.dispatch(clearCredentials());
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        },
    );
};
