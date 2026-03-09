import { useMutation, useQueryClient } from '@tanstack/react-query';
import { terminalsService } from '@/lib/services/terminals.service';
import type { CreateTerminalInput } from '@/lib/types';
import { TERMINALS_QUERY_KEY } from './useTerminals';

export function useCreateTerminal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTerminalInput) => terminalsService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: TERMINALS_QUERY_KEY }); },
  });
}
