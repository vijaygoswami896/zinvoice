import api from '@api/axiosInstance.js'; // your existing axios instance

export const unitApi = {
    list: (params) =>
        api.get('/units', { params }),

    getById: (id) =>
        api.get(`/units/${id}`),

    create: (payload) =>
        api.post('/units', payload),

    update: (id, payload) =>
        api.patch(`/units/${id}`, payload),

    delete: (id) =>
        api.delete(`/units/${id}`),

    restore: (id) =>
        api.patch(`/units/${id}/restore`),
};