import api from '@api/axiosInstance';

const unwrap = (r) => r.data;   // returns { success, data, message, meta? }

export const customersApi = {
  /** GET /customers?page=1&limit=25&search=&gstType=&sortBy=createdAt&sortDir=desc */
  list: (params) =>
    api.get('/customers', { params }).then(unwrap),

  /** GET /customers/:id */
  getById: (id) =>
    api.get(`/customers/${id}`).then((r) => r.data.data.customer),

  /** POST /customers */
  create: (payload) =>
    api.post('/customers', payload).then((r) => r.data.data.customer),

  /** PUT /customers/:id */
  update: (id, payload) =>
    api.put(`/customers/${id}`, payload).then((r) => r.data.data.customer),

  /** DELETE /customers/:id — soft delete */
  remove: (id) =>
    api.delete(`/customers/${id}`).then((r) => r.data),
};
