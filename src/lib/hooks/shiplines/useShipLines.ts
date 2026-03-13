import { useQuery } from '@tanstack/react-query';
import { shiplinesService } from '@/lib/services/shiplines.service';

export const SHIPLINES_QUERY_KEY = ['shiplines'];

export function useShipLines() {
  return useQuery({
    queryKey: SHIPLINES_QUERY_KEY,
    queryFn: shiplinesService.getAll,
  });
}
