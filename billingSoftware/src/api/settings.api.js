import api from '@api/axiosInstance';

const unwrap = (r) => r.data.data;

export const settingsApi = {
  /** GET /settings — fetch current settings */
  getSettings: () =>
    api.get('/settings').then((tempData) => {
      // console.log("tmpData==> ", tempData);
      return tempData
    }).then(unwrap),

  /** PUT /settings — update settings (JSON body) */
  updateSettings: (payload) =>
    api.put('/settings', payload).then(unwrap),

  /**
   * POST /settings/logo — upload logo image
   * @param {File} file
   * @param {(progress: number) => void} [onProgress]
   */
  uploadLogo: (file, onProgress) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post('/settings/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        : undefined,
    }).then(unwrap);
  },

  /**
   * POST /settings/signature — upload signature image
   * @param {File} file
   * @param {(progress: number) => void} [onProgress]
   */
  uploadSignature: (file, onProgress) => {
    const form = new FormData();
    form.append('signature', file);
    return api.post('/settings/signature', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        : undefined,
    }).then(unwrap);
  },

  /** DELETE /settings/logo */
  deleteLogo: () =>
    api.delete('/settings/logo').then(unwrap),

  /** DELETE /settings/signature */
  deleteSignature: () =>
    api.delete('/settings/signature').then(unwrap),
};
