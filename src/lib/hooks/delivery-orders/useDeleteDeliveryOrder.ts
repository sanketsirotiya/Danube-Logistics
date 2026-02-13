import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryOrdersService } from '@/lib/services/delivery-orders.service';
import { DELIVERY_ORDERS_QUERY_KEY } from './useDeliveryOrders';

export function useDeleteDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveryOrdersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_ORDERS_QUERY_KEY });
    },
  });
}
