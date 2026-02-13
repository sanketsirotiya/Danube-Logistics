import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/drivers - Generate driver performance report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const driverId = searchParams.get('driverId');

    // Build where clause for trips
    const tripWhere: any = {};

    if (startDate || endDate) {
      tripWhere.createdAt = {};
      if (startDate) tripWhere.createdAt.gte = new Date(startDate);
      if (endDate) tripWhere.createdAt.lte = new Date(endDate);
    }

    if (driverId) tripWhere.driverId = driverId;

    // Fetch all drivers with their trips
    const drivers = await prisma.driver.findMany({
      where: driverId ? { id: driverId } : {},
      include: {
        trips: {
          where: tripWhere,
          include: {
            customer: {
              select: {
                name: true,
              },
            },
            invoice: {
              select: {
                totalAmount: true,
                paid: true,
              },
            },
            expenses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate performance metrics for each driver
    const driverPerformance = drivers.map(driver => {
      const trips = driver.trips;
      const totalTrips = trips.length;
      const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
      const inProgressTrips = trips.filter(t => t.status === 'IN_PROGRESS').length;
      const cancelledTrips = trips.filter(t => t.status === 'CANCELLED').length;

      const totalDistance = trips.reduce((sum, t) => sum + (Number(t.distanceMiles) || 0), 0);
      const totalRevenue = trips.reduce((sum, t) =>
        sum + (t.invoice ? Number(t.invoice.totalAmount) : 0), 0
      );
      const totalExpenses = trips.reduce((sum, t) =>
        sum + t.expenses.reduce((expSum, e) => expSum + Number(e.amount), 0), 0
      );

      const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
      const averageDistancePerTrip = totalTrips > 0 ? totalDistance / totalTrips : 0;
      const revenuePerTrip = totalTrips > 0 ? totalRevenue / totalTrips : 0;
      const revenuePerMile = totalDistance > 0 ? totalRevenue / totalDistance : 0;

      // Calculate trips by customer
      const tripsByCustomer = new Map<string, number>();
      trips.forEach(trip => {
        const customerName = trip.customer.name;
        tripsByCustomer.set(customerName, (tripsByCustomer.get(customerName) || 0) + 1);
      });

      return {
        driverId: driver.id,
        driverName: driver.name,
        license: driver.license,
        status: driver.status,
        phone: driver.phone,
        totalTrips,
        completedTrips,
        inProgressTrips,
        cancelledTrips,
        completionRate: Math.round(completionRate * 10) / 10,
        totalDistance: Math.round(totalDistance * 10) / 10,
        averageDistancePerTrip: Math.round(averageDistancePerTrip * 10) / 10,
        totalRevenue,
        revenuePerTrip: Math.round(revenuePerTrip * 100) / 100,
        revenuePerMile: Math.round(revenuePerMile * 100) / 100,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        topCustomers: Array.from(tripsByCustomer.entries())
          .map(([name, count]) => ({ customerName: name, tripCount: count }))
          .sort((a, b) => b.tripCount - a.tripCount)
          .slice(0, 5),
      };
    });

    // Calculate overall summary
    const summary = {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'ACTIVE').length,
      totalTrips: driverPerformance.reduce((sum, d) => sum + d.totalTrips, 0),
      totalDistance: driverPerformance.reduce((sum, d) => sum + d.totalDistance, 0),
      totalRevenue: driverPerformance.reduce((sum, d) => sum + d.totalRevenue, 0),
      totalExpenses: driverPerformance.reduce((sum, d) => sum + d.totalExpenses, 0),
      averageCompletionRate: driverPerformance.length > 0
        ? driverPerformance.reduce((sum, d) => sum + d.completionRate, 0) / driverPerformance.length
        : 0,
    };

    return NextResponse.json({
      drivers: driverPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue),
      summary,
    });
  } catch (error) {
    console.error('Error generating driver performance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate driver performance report' },
      { status: 500 }
    );
  }
}
