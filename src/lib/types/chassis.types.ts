export type ChassisSize =
  | 'TWENTY_FT'
  | 'FORTY_FT'
  | 'FORTY_FIVE_FT'
  | 'FORTY_EIGHT_FT'
  | 'FIFTY_THREE_FT'
  | 'EXTENDABLE';

export const CHASSIS_SIZE_LABELS: Record<ChassisSize, string> = {
  TWENTY_FT: '20 ft',
  FORTY_FT: '40 ft',
  FORTY_FIVE_FT: '45 ft',
  FORTY_EIGHT_FT: '48 ft',
  FIFTY_THREE_FT: '53 ft',
  EXTENDABLE: 'Extendable (Combo)',
};

export const CHASSIS_SIZES: ChassisSize[] = [
  'TWENTY_FT',
  'FORTY_FT',
  'FORTY_FIVE_FT',
  'FORTY_EIGHT_FT',
  'FIFTY_THREE_FT',
  'EXTENDABLE',
];

export interface Chassis {
  id: string;
  number: string;
  size: ChassisSize;
  isAvailable: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChassisInput {
  number: string;
  size: ChassisSize;
  isActive?: boolean;
  notes?: string;
}
