import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shiplinesService } from '@/lib/services/shiplines.service';
import { SHIPLINES_QUERY_KEY } from './useShipLines';

export function useDeleteShipLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shiplinesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SHIPLINES_QUERY_KEY }),
  });
}
