import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '@/lib/services/customers.service';
import type { CreateCustomerInput } from '@/lib/types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
