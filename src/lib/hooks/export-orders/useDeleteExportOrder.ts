import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportOrdersService } from '@/lib/services/export-orders.service';
import { EXPORT_ORDERS_QUERY_KEY } from './useExportOrders';

export function useDeleteExportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => exportOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORT_ORDERS_QUERY_KEY });
    },
  });
}
