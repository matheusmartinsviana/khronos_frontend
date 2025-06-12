import { api } from './index';

export const getUser = () => api.get('/user');
export const getUserById = (id: string) => api.get(`/user/${id}`);
export const createUser = (data: any) => api.post('/user', data);
export const updateUser = (id: string, data: any) => api.put(`/user/${id}`, data);
export const removeUser = (id: string) => api.delete(`/user/${id}`);
export const verifyUserSalesperson = (userId: string) => api.get(`/user/salesperson/${userId}`);
export const createSalesperson = (data: any) => api.post(`/user/salesperson/`, data);