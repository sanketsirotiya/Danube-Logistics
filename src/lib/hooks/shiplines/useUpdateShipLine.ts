import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shiplinesService } from '@/lib/services/shiplines.service';
import type { UpdateShipLineInput } from '@/lib/types';
import { SHIPLINES_QUERY_KEY } from './useShipLines';

export function useUpdateShipLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateShipLineInput) => shiplinesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SHIPLINES_QUERY_KEY }),
  });
}
