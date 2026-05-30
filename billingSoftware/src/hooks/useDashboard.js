import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@api/dashboard.api';
import { QUERY_KEYS } from '@constants';

const KEY = QUERY_KEYS.DASHBOARD;

/**
 * useDashboard — fetches the full dashboard payload.
 * Refetches every 5 minutes automatically.
 *
 * @param {object} [params] - { revenueMonths: 12 }
 */
export const useDashboard = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => dashboardApi.getAll(params),
    staleTime: 1000 * 60 * 2,   // 2 minutes
    gcTime: 1000 * 60 * 10,
  });

export const useDashboardSummary = () =>
  useQuery({
    queryKey: [KEY, 'summary'],
    queryFn: dashboardApi.getSummary,
    staleTime: 1000 * 60,
  });

export const useMonthlyRevenue = (months = 12) =>
  useQuery({
    queryKey: [KEY, 'revenue', months],
    queryFn: () => dashboardApi.getRevenue(months),
    staleTime: 1000 * 60 * 5,
  });
