import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsService } from '@/lib/services/trips.service';
import type { CreateTripInput } from '@/lib/types';
import { TRIPS_QUERY_KEY } from './useTrips';

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTripInput) => tripsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}
