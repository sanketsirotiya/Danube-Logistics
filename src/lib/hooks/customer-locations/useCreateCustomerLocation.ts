import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerLocationsService } from '@/lib/services/customer-locations.service';
import type { CreateCustomerLocationInput } from '@/lib/types';
import { customerLocationsKey } from './useCustomerLocations';

export function useCreateCustomerLocation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerLocationInput) =>
      customerLocationsService.create(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLocationsKey(customerId) });
    },
  });
}
