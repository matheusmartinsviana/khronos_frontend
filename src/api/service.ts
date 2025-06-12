import { api } from './index';

export const getServices = () => api.get('/service');
export const getServiceById = (id: string) => api.get(`/service/${id}`);
export const createService = (data: any) => api.post('/service', data);
export const updateService = (id: string, data: any) => api.put(`/service/${id}`, data);
export const deleteService = (id: string) => api.delete(`/service/${id}`);
