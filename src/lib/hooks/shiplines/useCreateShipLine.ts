import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shiplinesService } from '@/lib/services/shiplines.service';
import type { CreateShipLineInput } from '@/lib/types';
import { SHIPLINES_QUERY_KEY } from './useShipLines';

export function useCreateShipLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShipLineInput) => shiplinesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SHIPLINES_QUERY_KEY }),
  });
}
