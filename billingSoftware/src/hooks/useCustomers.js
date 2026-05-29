import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { customersApi } from '@api/customers.api';
import { QUERY_KEYS } from '@constants';

const KEY = QUERY_KEYS.CUSTOMERS;

// ── List ──────────────────────────────────────────────────────────────────────

/**
 * @param {object} params - { page, limit, search, gstType, state, sortBy, sortDir }
 */
export const useCustomers = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn:  () => customersApi.list(params),
    placeholderData: keepPreviousData,  // no layout jump between pages
    staleTime: 1000 * 30,
    select: (res) => ({
      items: res.data,
      meta:  res.meta,
    }),
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const useCustomer = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn:  () => customersApi.getById(id),
    enabled:  !!id,
  });

// ── Create ────────────────────────────────────────────────────────────────────

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const useUpdateCustomer = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => customersApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData([KEY, id], updated);       // update detail cache
      qc.invalidateQueries({ queryKey: [KEY] }); // refresh list
    },
  });
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
