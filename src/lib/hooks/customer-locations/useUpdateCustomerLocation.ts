import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerLocationsService } from '@/lib/services/customer-locations.service';
import type { UpdateCustomerLocationInput } from '@/lib/types';
import { customerLocationsKey } from './useCustomerLocations';

export function useUpdateCustomerLocation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerId: cid, ...data }: UpdateCustomerLocationInput) =>
      customerLocationsService.update(cid, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLocationsKey(customerId) });
    },
  });
}
