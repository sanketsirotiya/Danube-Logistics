import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importOrdersService } from '@/lib/services/import-orders.service';
import type { UpdateImportOrderInput } from '@/lib/types';
import { IMPORT_ORDERS_QUERY_KEY } from './useImportOrders';

export function useUpdateImportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateImportOrderInput) => importOrdersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IMPORT_ORDERS_QUERY_KEY });
    },
  });
}
