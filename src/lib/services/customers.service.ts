import { apiClient } from '@/lib/api/client';
import type { Customer, CreateCustomerInput } from '@/lib/types';

export const customersService = {
  getAll: () =>
    apiClient<Customer[]>('/customers'),

  getById: (id: string) =>
    apiClient<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerInput) =>
    apiClient<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateCustomerInput>) =>
    apiClient<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};
