import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryOrdersService } from '@/lib/services/delivery-orders.service';
import type { CreateDeliveryOrderInput } from '@/lib/types';
import { DELIVERY_ORDERS_QUERY_KEY } from './useDeliveryOrders';

export function useCreateDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeliveryOrderInput) => deliveryOrdersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_ORDERS_QUERY_KEY });
    },
  });
}
