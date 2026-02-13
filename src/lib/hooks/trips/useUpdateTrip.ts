import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsService } from '@/lib/services/trips.service';
import type { UpdateTripInput } from '@/lib/types';
import { TRIPS_QUERY_KEY } from './useTrips';

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTripInput) =>
      tripsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}
