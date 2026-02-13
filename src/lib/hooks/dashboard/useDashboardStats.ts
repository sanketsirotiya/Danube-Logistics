import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard'];

export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: dashboardService.getStats,
  });
}
