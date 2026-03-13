export interface ShipLine {
  id: string;
  name: string;
  code: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipLineInput {
  name: string;
  code?: string;
  active?: boolean;
  notes?: string;
}

export interface UpdateShipLineInput extends Partial<CreateShipLineInput> {
  id: string;
}
