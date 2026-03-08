export type ContainerSize = 'TWENTY_FT' | 'FORTY_FT' | 'FORTY_FIVE_FT';
export type ContainerType = 'DRY' | 'REEFER' | 'TANK' | 'FLAT_RACK';

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
