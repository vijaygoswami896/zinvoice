import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { productsApi } from '@api/products.api';
import { QUERY_KEYS } from '@constants';

const KEY = QUERY_KEYS.PRODUCTS;

// ── List ──────────────────────────────────────────────────────────────────────

export const useProducts = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn:  () => productsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    select: (res) => ({ items: res.data, meta: res.meta }),
  });

// ── Single ────────────────────────────────────────────────────────────────────

export const useProduct = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn:  () => productsApi.getById(id),
    enabled:  !!id,
  });

// ── Create ────────────────────────────────────────────────────────────────────

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const useUpdateProduct = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productsApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData([KEY, id], updated);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// ── Stock adjustment ──────────────────────────────────────────────────────────

export const useAdjustStock = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => productsApi.adjustStock(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData([KEY, id], updated);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

// ── Invoice picker: search active products ────────────────────────────────────

/**
 * useProductSearch — used by the invoice line-item picker.
 * Returns only active products matching the search term.
 * Keeps the query disabled until the user types.
 *
 * @param {string} search
 * @param {'goods'|'service'|''} [type]
 */
export const useProductSearch = (search = '', type = '') =>
  useQuery({
    queryKey: [KEY, 'search', search, type],
    queryFn:  () =>
      productsApi.list({
        search,
        type:     type || undefined,
        isActive: 'true',
        limit:    20,
        sortBy:   'name',
        sortDir:  'asc',
      }),
    enabled:  search.length >= 1,
    staleTime: 1000 * 10,
    select: (res) => res.data ?? [],
  });
