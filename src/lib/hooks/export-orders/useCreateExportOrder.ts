import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportOrdersService } from '@/lib/services/export-orders.service';
import type { CreateExportOrderInput } from '@/lib/types';
import { EXPORT_ORDERS_QUERY_KEY } from './useExportOrders';

export function useCreateExportOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExportOrderInput) => exportOrdersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORT_ORDERS_QUERY_KEY });
    },
  });
}
