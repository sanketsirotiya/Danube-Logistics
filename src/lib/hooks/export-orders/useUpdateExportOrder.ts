import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportOrdersService } from '@/lib/services/export-orders.service';
import type { UpdateExportOrderInput } from '@/lib/types';
import { EXPORT_ORDERS_QUERY_KEY } from './useExportOrders';

export function useUpdateExportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateExportOrderInput) => exportOrdersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORT_ORDERS_QUERY_KEY });
    },
  });
}
