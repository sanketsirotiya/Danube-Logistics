import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importOrdersService } from '@/lib/services/import-orders.service';
import type { CreateImportOrderInput } from '@/lib/types';
import { IMPORT_ORDERS_QUERY_KEY } from './useImportOrders';

export function useCreateImportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateImportOrderInput) => importOrdersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPORT_ORDERS_QUERY_KEY });
    },
  });
}
