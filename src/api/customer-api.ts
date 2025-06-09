import { api } from './index';

export const getCustomers = () => api.get('/customer');
export const getCustomerById = (id: string) => api.get(`/customer/${id}`);
export const createCustomer = (data: any) => api.post('/customer', data);
export const updateCustomer = (id: string, data: any) => api.put(`/customer/${id}`, data);
export const deleteCustomer = (id: string) => api.delete(`/customer/${id}`);
