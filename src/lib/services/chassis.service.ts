import { apiClient } from '@/lib/api/client';
import type { Chassis, CreateChassisInput } from '@/lib/types';

export const chassisService = {
  getAll: () => apiClient<Chassis[]>('/chassis'),

  getById: (id: string) => apiClient<Chassis>(`/chassis/${id}`),

  create: (data: CreateChassisInput) =>
    apiClient<Chassis>('/chassis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateChassisInput>) =>
    apiClient<Chassis>(`/chassis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
