export interface Terminal {
  id: string;
  name: string;
  code: string | null;
  address: any;
  syncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerminalInput {
  name: string;
  code?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export interface UpdateTerminalInput extends Partial<CreateTerminalInput> {
  id: string;
}
