import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { invoicesApi } from '@api/invoices.api';
import { QUERY_KEYS } from '@constants';

const KEY = QUERY_KEYS.INVOICES;

export const useInvoices = (params = {}) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => invoicesApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    select: (res) => ({ items: res.data, meta: res.meta }),
  });

export const useInvoice = (id) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
  });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateInvoice = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => invoicesApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData([KEY, id], updated);
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => invoicesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
