import { apiClient } from '@/lib/api/client';
import type { ExportOrder, CreateExportOrderInput, UpdateExportOrderInput } from '@/lib/types';

export const exportOrdersService = {
  getAll: () => apiClient<ExportOrder[]>('/export-orders'),

  getById: (id: string) => apiClient<ExportOrder>(`/export-orders/${id}`),

  create: (data: CreateExportOrderInput) =>
    apiClient<ExportOrder>('/export-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<UpdateExportOrderInput>) =>
    apiClient<ExportOrder>(`/export-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/export-orders/${id}`, {
      method: 'DELETE',
    }),
};
