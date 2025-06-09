import { api } from './index';

export const getSales = () => api.get('/sales');
export const getSaleById = (id: string) => api.get(`/sales/${id}`);
export const createSale = (data: any) => api.post('/sales', data);
export const updateSale = (id: string, data: any) => api.put(`/sales/${id}`, data);
export const deleteSale = (id: string) => api.delete(`/sales/${id}`);
export const getSalesByUser = (userId: number) => api.get(`/sales/getSales/${userId}`)
