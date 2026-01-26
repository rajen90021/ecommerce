import api from '../config/api';
import type { Product } from '../types';

export const productService = {
  getAll: async (params?: any): Promise<{ products: Product[]; total: number }> => {
    const response = await api.get('/products', { params });
    return {
      products: response.data.products || [],
      total: response.data.total || response.data.pagination?.total || 0,
    };
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  },

  create: async (data: FormData): Promise<Product> => {
    const response = await api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  update: async (id: string, data: FormData): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.product;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data.products || [];
  },

  getTrending: async (): Promise<Product[]> => {
    const response = await api.get('/products/trending');
    return response.data.products || [];
  },
};
