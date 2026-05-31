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