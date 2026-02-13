import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/lib/services/invoices.service';
import { INVOICES_QUERY_KEY } from './useInvoices';

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
    },
  });
}
