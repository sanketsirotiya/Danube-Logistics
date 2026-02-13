import { apiClient } from '@/lib/api/client';
import type { Container, CreateContainerInput } from '@/lib/types';

export const containersService = {
  getAll: () =>
    apiClient<Container[]>('/containers'),

  getById: (id: string) =>
    apiClient<Container>(`/containers/${id}`),

  create: (data: CreateContainerInput) =>
    apiClient<Container>('/containers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateContainerInput>) =>
    apiClient<Container>(`/containers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/containers/${id}`, {
      method: 'DELETE',
    }),
};
