import type { ContainerSize, ContainerType } from './container.types';
import type { DeliveryOrderStatus, DeliveryPriority } from './delivery-order.types';

export interface ImportOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: DeliveryOrderStatus;
  priority: DeliveryPriority;
  containerNumber: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  containerAvailableDate: string | null;
  requestedDeliveryDate: string | null;
  actualPickupDate: string | null;
  actualDeliveryDate: string | null;
  customerReference: string;
  billOfLading: string | null;
  shipLineId: string | null;
  shipLine?: { id: string; name: string; code: string | null } | null;
  tripId: string | null;
  assignedDriverId: string | null;
  assignedTruckId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  trip?: {
    id: string;
    status: string;
    driver?: { name: string };
    truck?: { plate: string };
  } | null;
}

export interface CreateImportOrderInput {
  customerId: string;
  containerNumber: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  priority?: DeliveryPriority;
  portOfLoading: string;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  containerAvailableDate?: string;
  requestedDeliveryDate?: string;
  customerReference?: string;
  billOfLading?: string;
  shipLineId?: string;
  notes?: string;
}

export interface UpdateImportOrderInput extends Partial<CreateImportOrderInput> {
  id: string;
  status?: DeliveryOrderStatus;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  tripId?: string;
  assignedDriverId?: string;
  assignedTruckId?: string;
}
