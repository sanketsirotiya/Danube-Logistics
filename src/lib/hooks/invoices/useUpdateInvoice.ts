import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/lib/services/invoices.service';
import type { UpdateInvoiceInput } from '@/lib/types';
import { INVOICES_QUERY_KEY } from './useInvoices';

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateInvoiceInput) =>
      invoicesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });
}
