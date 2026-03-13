import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chassisService } from '@/lib/services/chassis.service';
import type { CreateChassisInput } from '@/lib/types';
import { CHASSIS_QUERY_KEY } from './useChassis';

export function useUpdateChassis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateChassisInput>) =>
      chassisService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHASSIS_QUERY_KEY });
    },
  });
}
