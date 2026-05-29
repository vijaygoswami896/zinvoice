import api from '@api/axiosInstance';

const unwrap   = (r) => r.data;
const unwrapOne = (key) => (r) => r.data.data[key];

export const productsApi = {
  /** GET /products */
  list: (params) =>
    api.get('/products', { params }).then(unwrap),

  /** GET /products/:id */
  getById: (id) =>
    api.get(`/products/${id}`).then(unwrapOne('product')),

  /** POST /products */
  create: (payload) =>
    api.post('/products', payload).then(unwrapOne('product')),

  /** PUT /products/:id */
  update: (id, payload) =>
    api.put(`/products/${id}`, payload).then(unwrapOne('product')),

  /** DELETE /products/:id */
  remove: (id) =>
    api.delete(`/products/${id}`).then((r) => r.data),

  /** PATCH /products/:id/stock */
  adjustStock: (id, payload) =>
    api.patch(`/products/${id}/stock`, payload).then(unwrapOne('product')),
};
