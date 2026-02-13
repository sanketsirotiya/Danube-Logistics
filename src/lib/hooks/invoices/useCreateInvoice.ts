import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/lib/services/invoices.service';
import type { CreateInvoiceInput } from '@/lib/types';
import { INVOICES_QUERY_KEY } from './useInvoices';

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => invoicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });
}
