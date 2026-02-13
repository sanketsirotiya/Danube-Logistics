export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';

export interface Driver {
  id: string;
  name: string;
  license: string;
  licenseExpiry: string | null;
  phone: string | null;
  email: string | null;
  status: DriverStatus;
  hireDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    role: string;
    isActive: boolean;
  } | null;
}

export interface CreateDriverInput {
  name: string;
  license: string;
  licenseExpiry?: string;
  phone?: string;
  email?: string;
  status?: DriverStatus;
  hireDate?: string;
  notes?: string;
}

export interface UpdateDriverInput extends Partial<CreateDriverInput> {
  id: string;
}
