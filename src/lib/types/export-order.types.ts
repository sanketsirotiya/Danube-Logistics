import type { ContainerSize, ContainerType } from './container.types';
import type { DeliveryOrderStatus, DeliveryPriority } from './delivery-order.types';

export interface ExportOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: DeliveryOrderStatus;
  priority: DeliveryPriority;
  bookingNumber: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  pickupAddress: string;
  pickupCity: string | null;
  pickupState: string | null;
  pickupZip: string | null;
  portOfDischarge: string;
  requestedPickupDate: string | null;
  requestedDeliveryDate: string | null;
  actualPickupDate: string | null;
  actualDeliveryDate: string | null;
  shipLineId: string | null;
  shipLine?: { id: string; name: string; code: string | null } | null;
  tripId: string | null;
  assignedDriverId: string | null;
  assignedTruckId: string | null;
  weight: number | null;
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

export interface CreateExportOrderInput {
  customerId: string;
  bookingNumber: string;
  containerSize: ContainerSize;
  containerType: ContainerType;
  priority?: DeliveryPriority;
  pickupAddress: string;
  pickupCity?: string;
  pickupState?: string;
  pickupZip?: string;
  portOfDischarge: string;
  requestedPickupDate?: string;
  requestedDeliveryDate?: string;
  shipLineId?: string;
  notes?: string;
}

export interface UpdateExportOrderInput extends Partial<CreateExportOrderInput> {
  id: string;
  status?: DeliveryOrderStatus;
  actualPickupDate?: string;
  actualDeliveryDate?: string;
  tripId?: string;
  assignedDriverId?: string;
  assignedTruckId?: string;
}
