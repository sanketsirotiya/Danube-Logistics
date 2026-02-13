export type PricingType = 'FLAT' | 'ITEMIZED';

export interface CustomerRate {
  id: string;
  routeFrom: string | null;
  routeTo: string | null;
  containerType: string;
  flatRate: number;
  effectiveDate: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string | null;
  email: string;
  phone: string | null;
  pricingType: PricingType;
  billingAddress: any;
  paymentTerms: number;
  createdAt: string;
  updatedAt: string;
  rates?: CustomerRate[];
  _count?: {
    trips: number;
    invoices: number;
  };
}

export interface CreateCustomerInput {
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  pricingType: PricingType;
  billingAddress?: any;
  paymentTerms?: number;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string;
}
