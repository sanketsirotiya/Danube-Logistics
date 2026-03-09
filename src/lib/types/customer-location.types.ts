export interface CustomerLocation {
  id: string;
  customerId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerLocationInput {
  label: string;
  street: string;
  city: string;
  state: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateCustomerLocationInput extends Partial<CreateCustomerLocationInput> {
  id: string;
  customerId: string;
}
