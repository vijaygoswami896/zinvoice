import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@api/settings.api';
import { QUERY_KEYS } from '@constants';

const SETTINGS_KEY = [QUERY_KEYS.SETTINGS];

// ── useSettings — fetch ────────────────────────────────────────────────────────

export const useSettings = () =>
  useQuery({
    queryKey: SETTINGS_KEY,
    queryFn:  settingsApi.getSettings,
    staleTime: 1000 * 60 * 5, // 5 min — settings don't change often
  });

// ── useUpdateSettings ─────────────────────────────────────────────────────────

export const useUpdateSettings = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: (data) => {
      // Update the cache immediately — no need to refetch
      qc.setQueryData(SETTINGS_KEY, data.settings);
    },
  });
};

// ── useUploadLogo ─────────────────────────────────────────────────────────────

export const useUploadLogo = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      settingsApi.uploadLogo(file, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
};

// ── useUploadSignature ────────────────────────────────────────────────────────

export const useUploadSignature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      settingsApi.uploadSignature(file, onProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
};

// ── useDeleteLogo ─────────────────────────────────────────────────────────────

export const useDeleteLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
};

// ── useDeleteSignature ────────────────────────────────────────────────────────

export const useDeleteSignature = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteSignature,
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
};
