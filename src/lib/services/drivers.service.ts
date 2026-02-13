import { apiClient } from '@/lib/api/client';
import type { Driver, CreateDriverInput } from '@/lib/types';

export const driversService = {
  getAll: () =>
    apiClient<Driver[]>('/drivers'),

  getById: (id: string) =>
    apiClient<Driver>(`/drivers/${id}`),

  create: (data: CreateDriverInput) =>
    apiClient<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateDriverInput>) =>
    apiClient<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/drivers/${id}`, {
      method: 'DELETE',
    }),
};
