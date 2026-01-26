import api from '../config/api';

export interface Location {
  id: string;
  city_name: string;
  state: string;
  is_active: boolean;
  delivery_charge: number;
  min_order_amount: number;
}

export const locationService = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.get('/locations/admin/all');
    return response.data.locations;
  },

  create: async (data: Partial<Location>): Promise<Location> => {
    const response = await api.post('/locations/admin/create', data);
    return response.data.location;
  },

  update: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await api.put(`/locations/admin/${id}`, data);
    return response.data.location;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/admin/${id}`);
  },
};
