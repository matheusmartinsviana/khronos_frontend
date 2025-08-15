import { api } from './index';

export const getEnvironments = () => api.get('/environment');
export const getEnvironmentById = (id: string) => api.get(`/environment/${id}`);
export const createEnvironment = (data: { name: string, description: string }) => api.post('/environment', data);
export const updateEnvironment = (id: string, data: { name: string, description: string }) => api.put(`/environment/${id}`, data);
export const deleteEnvironment = (id: string) => api.delete(`/environment/${id}`);