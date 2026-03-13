import { apiClient } from '@/lib/api/client';
import type { ImportOrder, CreateImportOrderInput, UpdateImportOrderInput } from '@/lib/types';

export const importOrdersService = {
  getAll: () => apiClient<ImportOrder[]>('/import-orders'),

  getById: (id: string) => apiClient<ImportOrder>(`/import-orders/${id}`),

  create: (data: CreateImportOrderInput) =>
    apiClient<ImportOrder>('/import-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<UpdateImportOrderInput>) =>
    apiClient<ImportOrder>(`/import-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/import-orders/${id}`, {
      method: 'DELETE',
    }),
};
