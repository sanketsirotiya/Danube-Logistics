import { useQuery } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';

export const TRUCKS_QUERY_KEY = ['trucks'];

export function useTrucks() {
  return useQuery({
    queryKey: TRUCKS_QUERY_KEY,
    queryFn: trucksService.getAll,
  });
}
