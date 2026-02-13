import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';
import type { UpdateTruckInput } from '@/lib/types';
import { TRUCKS_QUERY_KEY } from './useTrucks';

export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTruckInput) =>
      trucksService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCKS_QUERY_KEY });
    },
  });
}
