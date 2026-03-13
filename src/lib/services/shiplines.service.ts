import { apiClient } from '@/lib/api/client';
import type { ShipLine, CreateShipLineInput, UpdateShipLineInput } from '@/lib/types';

export const shiplinesService = {
  getAll: () => apiClient<ShipLine[]>('/shiplines'),

  getById: (id: string) => apiClient<ShipLine>(`/shiplines/${id}`),

  create: (data: CreateShipLineInput) =>
    apiClient<ShipLine>('/shiplines', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<UpdateShipLineInput>) =>
    apiClient<ShipLine>(`/shiplines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/shiplines/${id}`, { method: 'DELETE' }),
};
