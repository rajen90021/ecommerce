import api from '../config/api';
import type { Category } from '../types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories?status=all');
    return response.data.categories || [];
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.category;
  },

  create: async (data: FormData): Promise<Category> => {
    const response = await api.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.category;
  },

  update: async (id: string, data: FormData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.category;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  getCategoryTree: async (): Promise<Category[]> => {
    const response = await api.get('/categories/tree');
    return response.data.categories || [];
  },
};
