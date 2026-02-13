import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driversService } from '@/lib/services/drivers.service';
import type { CreateDriverInput } from '@/lib/types';
import { DRIVERS_QUERY_KEY } from './useDrivers';

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDriverInput) => driversService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
    },
  });
}
