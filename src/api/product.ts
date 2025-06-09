import { api } from './index';

export const getProducts = () => api.get('/product');
export const getProductById = (id: string) => api.get(`/product/${id}`);
export const createProduct = (data: any) => api.post('/product', data);
export const updateProduct = (id: string, data: any) => api.put(`/product/${id}`, data);
export const deleteProduct = (id: string) => api.delete(`/product/${id}`);
