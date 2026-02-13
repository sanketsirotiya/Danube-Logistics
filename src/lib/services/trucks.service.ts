import { apiClient } from '@/lib/api/client';
import type { Truck, CreateTruckInput } from '@/lib/types';

export const trucksService = {
  getAll: () =>
    apiClient<Truck[]>('/trucks'),

  getById: (id: string) =>
    apiClient<Truck>(`/trucks/${id}`),

  create: (data: CreateTruckInput) =>
    apiClient<Truck>('/trucks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTruckInput>) =>
    apiClient<Truck>(`/trucks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/trucks/${id}`, {
      method: 'DELETE',
    }),
};
