import type { ContainerSize, ContainerType } from './container.types';

export type DeliveryOrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type DeliveryPriority = 'STANDARD' | 'URGENT' | 'CRITICAL';
export type DeliveryOrderType = 'IMPORT' | 'EXPORT';

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  orderType: DeliveryOrderType;
  containerNumber: string | null;
  containerSize: ContainerSize | null;
  containerType: ContainerType | null;
  status: DeliveryOrderStatus;
  priority: DeliveryPriority;
  portOfLoading: string | null;
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
  weight: number | null;
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
  orderType: DeliveryOrderType;
  containerNumber?: string;
  containerSize?: ContainerSize;
  containerType?: ContainerType;
  status?: DeliveryOrderStatus;
  priority?: DeliveryPriority;
  portOfLoading?: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  requestedPickupDate?: string;
  requestedDeliveryDate?: string;
  customerReference?: string;
  bookingNumber?: string;
  billOfLading?: string;
  weight?: number;
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
