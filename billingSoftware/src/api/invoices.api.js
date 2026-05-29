import api from '@api/axiosInstance';

const unwrap    = (r) => r.data;
const unwrapInv = (r) => r.data.data.invoice;

export const invoicesApi = {
  list:         (params)      => api.get('/invoices', { params }).then(unwrap),
  getById:      (id)          => api.get(`/invoices/${id}`).then(unwrapInv),
  create:       (payload)     => api.post('/invoices', payload).then(unwrapInv),
  update:       (id, payload) => api.put(`/invoices/${id}`, payload).then(unwrapInv),
  updateStatus: (id, status)  => api.patch(`/invoices/${id}/status`, { status }).then(unwrapInv),
  remove:       (id)          => api.delete(`/invoices/${id}`).then((r) => r.data),
};
