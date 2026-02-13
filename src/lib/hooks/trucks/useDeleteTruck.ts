import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';
import { TRUCKS_QUERY_KEY } from './useTrucks';

export function useDeleteTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trucksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCKS_QUERY_KEY });
    },
  });
}
