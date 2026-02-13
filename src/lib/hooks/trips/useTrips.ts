import { useQuery } from '@tanstack/react-query';
import { tripsService } from '@/lib/services/trips.service';

export const TRIPS_QUERY_KEY = ['trips'];

export function useTrips() {
  return useQuery({
    queryKey: TRIPS_QUERY_KEY,
    queryFn: tripsService.getAll,
  });
}
