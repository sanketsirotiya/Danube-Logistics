import { useQuery } from '@tanstack/react-query';
import { importOrdersService } from '@/lib/services/import-orders.service';

export const IMPORT_ORDERS_QUERY_KEY = ['import-orders'];

export function useImportOrders() {
  return useQuery({
    queryKey: IMPORT_ORDERS_QUERY_KEY,
    queryFn: importOrdersService.getAll,
  });
}
