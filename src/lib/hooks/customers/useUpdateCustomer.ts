import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/lib/services/customers.service';
import type { UpdateCustomerInput } from '@/lib/types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCustomerInput) =>
      customersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
