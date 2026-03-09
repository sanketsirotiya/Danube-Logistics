import { useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalsService } from '@/lib/services/terminals.service';
import type { UpdateTerminalInput } from '@/lib/types';
import { TERMINALS_QUERY_KEY } from './useTerminals';

export function useUpdateTerminal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTerminalInput) => terminalsService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: TERMINALS_QUERY_KEY }); },
  });
}
