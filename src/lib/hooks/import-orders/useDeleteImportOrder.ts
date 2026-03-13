import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importOrdersService } from '@/lib/services/import-orders.service';
import { IMPORT_ORDERS_QUERY_KEY } from './useImportOrders';

export function useDeleteImportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => importOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPORT_ORDERS_QUERY_KEY });
    },
  });
}
