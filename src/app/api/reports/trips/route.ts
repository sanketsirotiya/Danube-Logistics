import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/trips - Generate trip report with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const driverId = searchParams.get('driverId');
    const truckId = searchParams.get('truckId');

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (driverId) where.driverId = driverId;
    if (truckId) where.truckId = truckId;

    // Fetch trips with full relations
    const trips = await prisma.trip.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        truck: {
          select: {
            id: true,
            plate: true,
            make: true,
            model: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        container: {
          select: {
            id: true,
            number: true,
            size: true,
            type: true,
          },
        },
        expenses: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            paid: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const summary = {
      totalTrips: trips.length,
      byStatus: {
        scheduled: trips.filter(t => t.status === 'SCHEDULED').length,
        inProgress: trips.filter(t => t.status === 'IN_PROGRESS').length,
        completed: trips.filter(t => t.status === 'COMPLETED').length,
        cancelled: trips.filter(t => t.status === 'CANCELLED').length,
      },
      totalDistance: trips.reduce((sum, t) => sum + (Number(t.distanceMiles) || 0), 0),
      totalExpenses: trips.reduce((sum, t) =>
        sum + t.expenses.reduce((expSum, e) => expSum + Number(e.amount), 0), 0
      ),
      totalRevenue: trips.reduce((sum, t) =>
        sum + (t.invoice ? Number(t.invoice.totalAmount) : 0), 0
      ),
      tripsWithInvoices: trips.filter(t => t.invoice).length,
      paidInvoices: trips.filter(t => t.invoice?.paid).length,
    };

    return NextResponse.json({
      trips: trips.map(trip => ({
        id: trip.id,
        customer: trip.customer.name,
        truck: trip.truck.plate,
        driver: trip.driver.name,
        container: trip.container.number,
        containerSize: trip.container.size,
        pickupLocation: trip.pickupLocation,
        dropoffLocation: trip.dropoffLocation,
        pickupTime: trip.pickupTime,
        dropoffTime: trip.dropoffTime,
        status: trip.status,
        distanceMiles: Number(trip.distanceMiles) || 0,
        expenses: trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
        revenue: trip.invoice ? Number(trip.invoice.totalAmount) : 0,
        invoiceNumber: trip.invoice?.invoiceNumber || null,
        invoicePaid: trip.invoice?.paid || false,
        createdAt: trip.createdAt.toISOString(),
      })),
      summary,
    });
  } catch (error) {
    console.error('Error generating trip report:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip report' },
      { status: 500 }
    );
  }
}
