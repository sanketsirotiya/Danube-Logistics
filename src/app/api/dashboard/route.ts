import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all necessary data in parallel
    const [
      invoices,
      trips,
      trucks,
      drivers,
      customers,
    ] = await Promise.all([
      prisma.invoice.findMany({
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.trip.findMany({
        include: {
          truck: {
            select: {
              plate: true,
            },
          },
          driver: {
            select: {
              name: true,
            },
          },
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.truck.findMany({
        select: {
          id: true,
          status: true,
        },
      }),
      prisma.driver.findMany({
        select: {
          id: true,
          status: true,
        },
      }),
      prisma.customer.count(),
    ]);

    // Calculate revenue metrics
    const totalRevenue = invoices
      .filter(inv => inv.paid)
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    const pendingRevenue = invoices
      .filter(inv => !inv.paid)
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    // Calculate trip metrics
    const totalTrips = trips.length;
    const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length;
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;

    // Calculate fleet metrics
    const totalTrucks = trucks.length;
    const availableTrucks = trucks.filter(t => t.status === 'AVAILABLE').length;

    // Calculate driver metrics
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;

    // Recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5).map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      totalAmount: parseFloat(inv.totalAmount.toString()),
      paid: inv.paid,
      createdAt: inv.createdAt.toISOString(),
    }));

    // Recent trips (last 5)
    const recentTrips = trips.slice(0, 5).map(trip => ({
      id: trip.id,
      truckPlate: trip.truck?.plate || 'N/A',
      driverName: trip.driver?.name || 'N/A',
      customerName: trip.customer?.name || 'N/A',
      status: trip.status,
      pickupLocation: trip.pickupLocation,
      dropoffLocation: trip.dropoffLocation,
    }));

    // Revenue by customer
    const revenueByCustomerMap = new Map<string, { totalRevenue: number; invoiceCount: number }>();

    invoices.forEach(inv => {
      const customerName = inv.customer.name;
      const amount = parseFloat(inv.totalAmount.toString());

      if (revenueByCustomerMap.has(customerName)) {
        const existing = revenueByCustomerMap.get(customerName)!;
        revenueByCustomerMap.set(customerName, {
          totalRevenue: existing.totalRevenue + amount,
          invoiceCount: existing.invoiceCount + 1,
        });
      } else {
        revenueByCustomerMap.set(customerName, {
          totalRevenue: amount,
          invoiceCount: 1,
        });
      }
    });

    const revenueByCustomer = Array.from(revenueByCustomerMap.entries())
      .map(([customerName, data]) => ({
        customerName,
        totalRevenue: data.totalRevenue,
        invoiceCount: data.invoiceCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Trips by status
    const tripsByStatus = {
      scheduled: trips.filter(t => t.status === 'SCHEDULED').length,
      inProgress: trips.filter(t => t.status === 'IN_PROGRESS').length,
      completed: trips.filter(t => t.status === 'COMPLETED').length,
      cancelled: trips.filter(t => t.status === 'CANCELLED').length,
    };

    const dashboardData = {
      totalRevenue,
      pendingRevenue,
      totalTrips,
      activeTrips,
      completedTrips,
      totalTrucks,
      availableTrucks,
      totalDrivers,
      activeDrivers,
      totalCustomers: customers,
      recentInvoices,
      recentTrips,
      revenueByCustomer,
      tripsByStatus,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
