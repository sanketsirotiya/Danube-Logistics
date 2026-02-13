import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryOrdersService } from '@/lib/services/delivery-orders.service';
import type { UpdateDeliveryOrderInput } from '@/lib/types';
import { DELIVERY_ORDERS_QUERY_KEY } from './useDeliveryOrders';

export function useUpdateDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateDeliveryOrderInput) =>
      deliveryOrdersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_ORDERS_QUERY_KEY });
    },
  });
}
