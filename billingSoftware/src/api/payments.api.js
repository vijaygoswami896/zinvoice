import api from '@api/axiosInstance';

const unwrap = (r) => r.data;
const unwrapOne = (r) => r.data.data;

export const paymentsApi = {
  /** POST /payments — record a new payment */
  record: (payload) =>
    api.post('/payments', payload).then(unwrapOne),

  /** GET /payments — list all payments */
  list: (params) =>
    api.get('/payments', { params }).then(unwrap),

  /** GET /payments/invoice/:invoiceId — payments + summary for one invoice */
  getByInvoice: (invoiceId) => {
    console.log('invoiceId==>', invoiceId);
    return api.get(`/payments/invoice/${invoiceId}`).then(unwrapOne);
  },

  /** DELETE /payments/:id */
  remove: (id) =>
    api.delete(`/payments/${id}`).then(unwrapOne),
};
