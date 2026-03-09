import { apiClient } from '@/lib/api/client';
import type { Terminal, CreateTerminalInput, UpdateTerminalInput } from '@/lib/types';

export const terminalsService = {
  getAll: () => apiClient<Terminal[]>('/terminals'),

  create: (data: CreateTerminalInput) =>
    apiClient<Terminal>('/terminals', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateTerminalInput>) =>
    apiClient<Terminal>(`/terminals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ success: boolean }>(`/terminals/${id}`, { method: 'DELETE' }),
};
