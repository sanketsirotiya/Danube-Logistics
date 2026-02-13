import { useQuery } from '@tanstack/react-query';
import { invoicesService } from '@/lib/services/invoices.service';

export const INVOICES_QUERY_KEY = ['invoices'];

export function useInvoices() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: invoicesService.getAll,
  });
}
