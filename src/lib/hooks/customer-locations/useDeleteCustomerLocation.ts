import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerLocationsService } from '@/lib/services/customer-locations.service';
import { customerLocationsKey } from './useCustomerLocations';

export function useDeleteCustomerLocation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) =>
      customerLocationsService.delete(customerId, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLocationsKey(customerId) });
    },
  });
}
