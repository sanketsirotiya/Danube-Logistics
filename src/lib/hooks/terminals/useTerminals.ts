import { useQuery } from '@tanstack/react-query';
import { terminalsService } from '@/lib/services/terminals.service';

export const TERMINALS_QUERY_KEY = ['terminals'];

export function useTerminals() {
  return useQuery({
    queryKey: TERMINALS_QUERY_KEY,
    queryFn: terminalsService.getAll,
  });
}
