import { apiClient } from '@/lib/api/client';
import type { Invoice, CreateInvoiceInput } from '@/lib/types';

export const invoicesService = {
  getAll: () =>
    apiClient<Invoice[]>('/invoices'),

  getById: (id: string) =>
    apiClient<Invoice>(`/invoices/${id}`),

  create: (data: CreateInvoiceInput) =>
    apiClient<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateInvoiceInput>) =>
    apiClient<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    }),
};
