import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driversService } from '@/lib/services/drivers.service';
import type { UpdateDriverInput } from '@/lib/types';
import { DRIVERS_QUERY_KEY } from './useDrivers';

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateDriverInput) =>
      driversService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
    },
  });
}
