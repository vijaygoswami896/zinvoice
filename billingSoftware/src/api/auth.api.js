import api from './axiosInstance';

/**
 * Auth API — thin wrappers around the auth endpoints.
 * All functions return the `data.data` payload from the standard response shape.
 */

/**
 * @param {{ name: string, email: string, password: string, role?: string }} payload
 */
export const registerApi = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data; // { user, accessToken }
};

/**
 * @param {{ email: string, password: string }} credentials
 */
export const loginApi = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data; // { user, accessToken }
};

/**
 * Silent refresh — reads refresh token from httpOnly cookie automatically.
 * Called on page load to restore the session.
 */
export const refreshApi = async () => {
    const { data } = await api.post('/auth/refresh');
    return data.data; // { user, accessToken }
};

/**
 * Logout — revokes the refresh token and clears the httpOnly cookie.
 */
export const logoutApi = async () => {
    await api.post('/auth/logout');
};

/**
 * Get current user profile.
 */
export const getMeApi = async () => {
    const { data } = await api.get('/auth/me');
    return data.data; // { user }
};

/**
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} payload
 */
export const changePasswordApi = async (payload) => {
    const { data } = await api.post('/auth/change-password', payload);
    return data;
};
