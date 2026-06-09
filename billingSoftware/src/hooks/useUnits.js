import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import { unitApi } from '@api/units.api.js';

// ── Query keys ────────────────────────────────────────────────────────────────

export const unitKeys = {
    all: () => ['units'],
    lists: () => ['units', 'list'],
    list: (params) => ['units', 'list', params],
    detail: (id) => ['units', 'detail', id],
};

// ── List ──────────────────────────────────────────────────────────────────────

export const useUnits = (params = {}) =>
    useQuery({
        queryKey: unitKeys.list(params),
        queryFn: () => unitApi.list(params).then((r) => r.data),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 2, // 2 min — units don't change often
    });

// ── All units (for picker — no pagination) ────────────────────────────────────

export const useAllUnits = () =>
    useQuery({
        queryKey: unitKeys.list({ limit: 100, sortBy: 'name', sortOrder: 'asc' }),
        queryFn: () =>
            unitApi.list({ limit: 100, sortBy: 'name', sortOrder: 'asc' }).then((r) => r.data),
        staleTime: 1000 * 60 * 5, // 5 min
    });

// ── Create ────────────────────────────────────────────────────────────────────

export const useCreateUnit = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) =>
            unitApi.create(payload).then((r) => r.data.data.unit),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: unitKeys.lists() });
        },
    });
};

// ── Update ────────────────────────────────────────────────────────────────────

export const useUpdateUnit = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) =>
            unitApi.update(id, payload).then((r) => r.data.data.unit),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: unitKeys.lists() });
            qc.invalidateQueries({ queryKey: unitKeys.detail(id) });
        },
    });
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const useDeleteUnit = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => unitApi.delete(id).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: unitKeys.lists() });
        },
    });
};

// ── Restore ───────────────────────────────────────────────────────────────────

export const useRestoreUnit = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => unitApi.restore(id).then((r) => r.data.data.unit),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: unitKeys.lists() });
        },
    });
};