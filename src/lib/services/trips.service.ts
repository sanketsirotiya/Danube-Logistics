import { apiClient } from '@/lib/api/client';
import type { Trip, CreateTripInput } from '@/lib/types';

export const tripsService = {
  getAll: () =>
    apiClient<Trip[]>('/trips'),

  getById: (id: string) =>
    apiClient<Trip>(`/trips/${id}`),

  create: (data: CreateTripInput) =>
    apiClient<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTripInput>) =>
    apiClient<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/trips/${id}`, {
      method: 'DELETE',
    }),
};
