import { apiClient } from '@/lib/api/client';
import type { CustomerLocation, CreateCustomerLocationInput } from '@/lib/types';

export const customerLocationsService = {
  getByCustomer: (customerId: string) =>
    apiClient<CustomerLocation[]>(`/customers/${customerId}/locations`),

  create: (customerId: string, data: CreateCustomerLocationInput) =>
    apiClient<CustomerLocation>(`/customers/${customerId}/locations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (customerId: string, locationId: string, data: Partial<CreateCustomerLocationInput>) =>
    apiClient<CustomerLocation>(`/customers/${customerId}/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (customerId: string, locationId: string) =>
    apiClient<{ success: boolean }>(`/customers/${customerId}/locations/${locationId}`, {
      method: 'DELETE',
    }),
};
