import { useQuery } from '@tanstack/react-query';
import { customersService } from '@/lib/services/customers.service';

export const CUSTOMERS_QUERY_KEY = ['customers'];

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: customersService.getAll,
  });
}
