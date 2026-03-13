import { useQuery } from '@tanstack/react-query';
import { exportOrdersService } from '@/lib/services/export-orders.service';

export const EXPORT_ORDERS_QUERY_KEY = ['export-orders'];

export function useExportOrders() {
  return useQuery({
    queryKey: EXPORT_ORDERS_QUERY_KEY,
    queryFn: exportOrdersService.getAll,
  });
}
