import { useQuery } from '@tanstack/react-query';
import { chassisService } from '@/lib/services/chassis.service';

export const CHASSIS_QUERY_KEY = ['chassis'];

export function useChassis() {
  return useQuery({
    queryKey: CHASSIS_QUERY_KEY,
    queryFn: chassisService.getAll,
  });
}
