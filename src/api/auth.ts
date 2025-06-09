import { api } from './index';

export const validateToken = () => api.get('/auth/validate-token');