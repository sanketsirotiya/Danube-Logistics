export type ContainerSize = 'TWENTY' | 'FORTY' | 'FORTY_HC' | 'FORTY_FIVE';
export type ContainerType = 'DRY' | 'REFRIGERATED' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK';

export interface Container {
  id: string;
  number: string;
  size: ContainerSize;
  type: ContainerType;
  available: boolean;
  terminalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContainerInput {
  number: string;
  size: ContainerSize;
  type: ContainerType;
  available?: boolean;
  terminalId?: string;
}

export interface UpdateContainerInput extends Partial<CreateContainerInput> {
  id: string;
}
