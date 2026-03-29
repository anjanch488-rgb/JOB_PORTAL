import api from './api.js';

export const applyToJob = (jobId, data) => api.post(`/api/apply/${jobId}`, data);
export const fetchApplications = () => api.get('/api/applications');
export const updateApplicationStatus = (id, status) =>
  api.put(`/api/applications/${id}/status`, { status });
