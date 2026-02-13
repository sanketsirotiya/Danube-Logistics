import { useQuery } from '@tanstack/react-query';
import { containersService } from '@/lib/services/containers.service';

export const CONTAINERS_QUERY_KEY = ['containers'];

export function useContainers() {
  return useQuery({
    queryKey: CONTAINERS_QUERY_KEY,
    queryFn: containersService.getAll,
  });
}
