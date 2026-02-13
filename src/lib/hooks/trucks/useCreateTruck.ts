import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';
import type { CreateTruckInput } from '@/lib/types';
import { TRUCKS_QUERY_KEY } from './useTrucks';

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTruckInput) => trucksService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRUCKS_QUERY_KEY });
    },
  });
}
