import { apiClient } from '@/lib/api/client';
import type { DashboardStats } from '@/lib/types';

export const dashboardService = {
  getStats: () =>
    apiClient<DashboardStats>('/dashboard'),
};
