export type DeliveryOrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type DeliveryPriority = 'STANDARD' | 'URGENT' | 'EXPEDITED';
export type ContainerSize = 'TWENTY' | 'FORTY' | 'FORTY_HC' | 'FORTY_FIVE';
export type ContainerType = 'DRY' | 'REFRIGERATED' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  containerNumber: string | null;
  containerSize: ContainerSize | null;
  containerType: ContainerType | null;
  status: DeliveryOrderStatus;
  priority: DeliveryPriority;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  requestedPickupDate: string | null;
  requestedDeliveryDate: string | null;
  actualPickupDate: string | null;
  actualDeliveryDate: string | null;
  customerReference: string | null;
  bookingNumber: string | null;
  billOfLading: string | null;
  tripId: string | null;
  assignedDriverId: string | null;
  assignedTruckId: string | null;
  cargoDescription: string | null;
  weight: number | null;
  specialInstructions: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string | null;
  };
  trip?: {
    id: string;
    status: string;
    driver?: {
      name: string;
    };
    truck?: {
      plate: string;
    };
  };
}

export interface CreateDeliveryOrderInput {
  customerId: string;
  containerNumber?: string;
  containerSize?: ContainerSize;
  containerType?: ContainerType;
  status?: DeliveryOrderStatus;
  priority?: DeliveryPriority;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  requestedPickupDate?: string;
  requestedDeliveryDate?: string;
  customerReference?: string;
  bookingNumber?: string;
  billOfLading?: string;
  cargoDescription?: string;
  weight?: number;
  specialInstructions?: string;
  notes?: string;
}

export interface UpdateDeliveryOrderInput extends Partial<CreateDeliveryOrderInput> {
  id: string;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  tripId?: string;
  assignedDriverId?: string;
  assignedTruckId?: string;
}
