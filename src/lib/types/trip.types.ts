export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  customerId: string;
  truckId: string;
  driverId: string;
  containerId: string;
  deliveryOrderId?: string | null;
  pickupLocation: string;
  pickupTime: string | null;
  dropoffLocation: string;
  dropoffTime: string | null;
  status: TripStatus;
  distanceMiles: number | null;
  route: any;
  chassisReceivedAt: string | null;
  chassisReturnedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  truck?: {
    id: string;
    plate: string;
    make: string;
    model: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string | null;
  };
  container?: {
    id: string;
    number: string;
    size: string;
    type: string;
  };
  deliveryOrder?: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export interface CreateTripInput {
  deliveryOrderId?: string;
  customerId: string;
  truckId: string;
  driverId: string;
  containerId: string;
  pickupLocation: string;
  pickupTime?: string;
  dropoffLocation: string;
  dropoffTime?: string;
  status?: TripStatus;
  distanceMiles?: number;
  chassisReceivedAt?: string;
  chassisReturnedAt?: string;
  notes?: string;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  id: string;
}
