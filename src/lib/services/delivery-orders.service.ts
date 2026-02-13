import { apiClient } from '@/lib/api/client';
import type { DeliveryOrder, CreateDeliveryOrderInput } from '@/lib/types';

export const deliveryOrdersService = {
  getAll: () =>
    apiClient<DeliveryOrder[]>('/delivery-orders'),

  getById: (id: string) =>
    apiClient<DeliveryOrder>(`/delivery-orders/${id}`),

  create: (data: CreateDeliveryOrderInput) =>
    apiClient<DeliveryOrder>('/delivery-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateDeliveryOrderInput>) =>
    apiClient<DeliveryOrder>(`/delivery-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/delivery-orders/${id}`, {
      method: 'DELETE',
    }),
};
