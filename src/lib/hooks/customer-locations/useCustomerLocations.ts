import { useQuery } from '@tanstack/react-query';
import { customerLocationsService } from '@/lib/services/customer-locations.service';

export const customerLocationsKey = (customerId: string) => ['customer-locations', customerId];

export function useCustomerLocations(customerId: string) {
  return useQuery({
    queryKey: customerLocationsKey(customerId),
    queryFn: () => customerLocationsService.getByCustomer(customerId),
    enabled: !!customerId,
  });
}
