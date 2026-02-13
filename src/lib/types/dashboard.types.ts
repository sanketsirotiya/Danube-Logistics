export interface DashboardStats {
  totalRevenue: number;
  pendingRevenue: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  totalTrucks: number;
  availableTrucks: number;
  totalDrivers: number;
  activeDrivers: number;
  totalCustomers: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    paid: boolean;
    createdAt: string;
  }>;
  recentTrips: Array<{
    id: string;
    truckPlate: string;
    driverName: string;
    customerName: string;
    status: string;
    pickupLocation: string;
    dropoffLocation: string;
  }>;
  revenueByCustomer: Array<{
    customerName: string;
    totalRevenue: number;
    invoiceCount: number;
  }>;
  tripsByStatus: {
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}
