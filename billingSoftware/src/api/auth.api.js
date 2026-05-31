import api from './axiosInstance';

export const registerApi = async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    return data.data;
};

export const loginApi = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data;
};

export const refreshApi = async () => {
    const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
    return data.data;
};

export const logoutApi = async () => {
    await api.post('/auth/logout');
};

export const getMeApi = async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
};

export const changePasswordApi = async (payload) => {
    const { data } = await api.post('/auth/change-password', payload);
    return data;
};

/* ADD THIS *///
export const authApi = {
    login: loginApi,
    register: registerApi,
    refresh: refreshApi,
    logout: logoutApi,
    getMe: getMeApi,
    changePassword: changePasswordApi,
};

