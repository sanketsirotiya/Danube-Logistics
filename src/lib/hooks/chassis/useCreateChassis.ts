import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chassisService } from '@/lib/services/chassis.service';
import type { CreateChassisInput } from '@/lib/types';
import { CHASSIS_QUERY_KEY } from './useChassis';

export function useCreateChassis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChassisInput) => chassisService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHASSIS_QUERY_KEY });
    },
  });
}
