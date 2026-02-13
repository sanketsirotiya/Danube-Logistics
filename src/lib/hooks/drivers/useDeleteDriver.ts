import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driversService } from '@/lib/services/drivers.service';
import { DRIVERS_QUERY_KEY } from './useDrivers';

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driversService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY });
    },
  });
}
