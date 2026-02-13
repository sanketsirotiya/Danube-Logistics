import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsService } from '@/lib/services/trips.service';
import { TRIPS_QUERY_KEY } from './useTrips';

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tripsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIPS_QUERY_KEY });
    },
  });
}
