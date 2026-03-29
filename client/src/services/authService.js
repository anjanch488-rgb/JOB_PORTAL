import api from './api.js';

export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');
export const updateProfile = (data) => api.put('/api/auth/profile', data);
