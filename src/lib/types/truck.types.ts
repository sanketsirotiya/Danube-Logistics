export type TruckStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

export interface Truck {
  id: string;
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status: TruckStatus;
  purchaseDate: string | null;
  lastServiceDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTruckInput {
  plate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status?: TruckStatus;
  purchaseDate?: string;
  lastServiceDate?: string;
  notes?: string;
}

export interface UpdateTruckInput extends Partial<CreateTruckInput> {
  id: string;
}
