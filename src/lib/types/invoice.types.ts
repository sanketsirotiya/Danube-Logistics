export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  tripId: string;
  pricingType: string;
  lineItems: any;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  paid: boolean;
  paidAt: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    pricingType: string;
  };
  trip?: {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupTime: string | null;
    dropoffTime: string | null;
    distanceMiles: number | null;
    container?: {
      number: string;
    };
  };
}

export interface CreateInvoiceInput {
  tripId: string;
  customerId: string;
  pricingType: string;
  lineItems: any;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  totalAmount: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateInvoiceInput {
  id: string;
  paid?: boolean;
  paidAt?: string;
}
