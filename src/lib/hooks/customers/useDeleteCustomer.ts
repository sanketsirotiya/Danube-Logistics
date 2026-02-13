import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/lib/services/customers.service';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
