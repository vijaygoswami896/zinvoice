import axios from 'axios';
import { API_BASE_URL } from '../constants/index';

/**
 * Primary Axios instance for all API calls.
 *
 * Interceptors for auth (token injection + silent refresh) are
 * added separately in api/interceptors.js and wired at app boot.
 * This keeps the axios instance importable before the Redux store exists.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // sends httpOnly refresh token cookie
    timeout: 20_000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export default api;


// import axios from 'axios';
// import { store } from '../app/store';
// import { selectAccessToken, setCredentials, clearCredentials } from '../features/auth/authSlice';

// /**
//  * Primary Axios instance.
//  *
//  * - Attaches the Bearer token to every request via a request interceptor.
//  * - On 401 responses, silently attempts a token refresh using the httpOnly
//  *   cookie and retries the original request once.
//  * - If the refresh also fails, dispatches clearCredentials() to force logout.
//  */
// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL,
//     withCredentials: true, // Required: sends the httpOnly refresh token cookie
//     timeout: 15_000,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // ── Request interceptor: inject access token ──────────────────────────────────

// api.interceptors.request.use(
//     (config) => {
//         const token = selectAccessToken(store.getState());
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error),
// );

// // ── Response interceptor: handle 401 with silent refresh ──────────────────────

// let isRefreshing = false;
// let refreshSubscribers = [];

// /**
//  * Queue failed requests while a token refresh is in-flight.
//  * Once the refresh resolves, retry all queued requests with the new token.
//  */
// const subscribeTokenRefresh = (cb) => {
//     refreshSubscribers.push(cb);
// };

// const onRefreshSuccess = (newToken) => {
//     refreshSubscribers.forEach((cb) => cb(newToken));
//     refreshSubscribers = [];
// };

// const onRefreshFailure = () => {
//     refreshSubscribers.forEach((cb) => cb(null));
//     refreshSubscribers = [];
// };

// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         const is401 = error.response?.status === 401;
//         const errorCode = error.response?.data?.error?.code;

//         // Don't retry refresh endpoint itself (avoid infinite loop)
//         const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

//         // Only attempt refresh once per request
//         const alreadyRetried = originalRequest._retried;

//         if (is401 && !isRefreshEndpoint && !alreadyRetried) {
//             originalRequest._retried = true;

//             if (isRefreshing) {
//                 // Another refresh is already in-flight — queue this request
//                 return new Promise((resolve, reject) => {
//                     subscribeTokenRefresh((newToken) => {
//                         if (!newToken) return reject(error);
//                         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//                         resolve(api(originalRequest));
//                     });
//                 });
//             }

//             isRefreshing = true;

//             try {
//                 const { data } = await api.post('/auth/refresh');
//                 const { accessToken, user } = data.data;

//                 store.dispatch(setCredentials({ user, accessToken }));

//                 onRefreshSuccess(accessToken);
//                 isRefreshing = false;

//                 // Retry the original request with the new token
//                 originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//                 return api(originalRequest);
//             } catch (refreshError) {
//                 isRefreshing = false;
//                 onRefreshFailure();
//                 store.dispatch(clearCredentials());
//                 // Let the caller handle the error (ProtectedRoute will redirect to /login)
//                 return Promise.reject(refreshError);
//             }
//         }

//         return Promise.reject(error);
//     },
// );

// export default api;