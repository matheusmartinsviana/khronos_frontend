import { api } from './index';

export const importProducts = () => api.post('/sheet/product/import-products');
export const importServices = () => api.post('/sheet/service/import-services');
