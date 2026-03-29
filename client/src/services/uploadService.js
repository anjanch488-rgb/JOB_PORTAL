import api from './api.js';

/** Multipart upload — field name must be `file` */
export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload/resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
