import api from '@api/axiosInstance';

const unwrap = (r) => r.data.data;

export const dashboardApi = {
  /**
   * Full dashboard payload.
   * @param {object} [params] - { revenueMonths: 12 }
   */
  getAll:     (params) => api.get('/dashboard', { params }).then(unwrap),
  getSummary: ()       => api.get('/dashboard/summary').then(unwrap),
  getRevenue: (months) => api.get('/dashboard/revenue', { params: { months } }).then(unwrap),
};
