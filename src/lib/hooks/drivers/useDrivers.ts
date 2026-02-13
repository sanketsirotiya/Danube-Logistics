import { useQuery } from '@tanstack/react-query';
import { driversService } from '@/lib/services/drivers.service';

export const DRIVERS_QUERY_KEY = ['drivers'];

export function useDrivers() {
  return useQuery({
    queryKey: DRIVERS_QUERY_KEY,
    queryFn: driversService.getAll,
  });
}
