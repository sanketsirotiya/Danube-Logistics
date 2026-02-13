import { useQuery } from '@tanstack/react-query';
import { deliveryOrdersService } from '@/lib/services/delivery-orders.service';

export const DELIVERY_ORDERS_QUERY_KEY = ['delivery-orders'];

export function useDeliveryOrders() {
  return useQuery({
    queryKey: DELIVERY_ORDERS_QUERY_KEY,
    queryFn: deliveryOrdersService.getAll,
  });
}
