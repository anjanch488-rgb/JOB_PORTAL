import api from './api.js';

export const fetchJobs = (params) => api.get('/api/jobs', { params });
export const fetchJob = (id) => api.get(`/api/jobs/${id}`);
export const createJob = (data) => api.post('/api/jobs', data);
export const updateJob = (id, data) => api.put(`/api/jobs/${id}`, data);
export const deleteJob = (id) => api.delete(`/api/jobs/${id}`);
export const saveJob = (id) => api.post(`/api/jobs/${id}/save`);
export const unsaveJob = (id) => api.delete(`/api/jobs/${id}/save`);
export const fetchSavedJobs = () => api.get('/api/jobs/saved');
export const fetchApplicants = (jobId) => api.get(`/api/jobs/${jobId}/applicants`);
