import { useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalsService } from '@/lib/services/terminals.service';
import { TERMINALS_QUERY_KEY } from './useTerminals';

export function useDeleteTerminal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => terminalsService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: TERMINALS_QUERY_KEY }); },
  });
}
