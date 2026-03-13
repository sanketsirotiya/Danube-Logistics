import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trips - Get all trips
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
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
            phone: true,
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
        chassis: {
          select: {
            id: true,
            number: true,
            size: true,
          },
        },
        importOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        exportOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    const serialized = trips.map(trip => ({
      ...trip,
      distanceMiles: trip.distanceMiles != null ? Number(trip.distanceMiles) : null,
    }));

    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips', detail: error?.message, code: error?.code },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      importOrderId,
      exportOrderId,
      customerId,
      truckId,
      driverId,
      containerId,
      chassisId,
      pickupLocation,
      pickupTime,
      dropoffLocation,
      dropoffTime,
      status,
      distanceMiles,
      chassisReceivedAt,
      chassisReturnedAt,
      notes
    } = body;

    // Validation
    if (!customerId || !truckId || !driverId || !pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: 'Customer, truck, driver, pickup and dropoff locations are required' },
        { status: 400 }
      );
    }

    const [trip] = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          customerId,
          truckId,
          driverId,
          containerId: containerId || null,
          chassisId: chassisId || null,
          pickupLocation,
          pickupTime: pickupTime ? new Date(pickupTime) : null,
          dropoffLocation,
          dropoffTime: dropoffTime ? new Date(dropoffTime) : null,
          status: status || 'SCHEDULED',
          distanceMiles: distanceMiles ? parseFloat(distanceMiles) : null,
          chassisReceivedAt: chassisReceivedAt ? new Date(chassisReceivedAt) : null,
          chassisReturnedAt: chassisReturnedAt ? new Date(chassisReturnedAt) : null,
          notes: notes || null,
        },
        include: {
          customer: { select: { name: true } },
          truck: { select: { plate: true } },
          driver: { select: { name: true } },
          container: { select: { number: true } },
          chassis: { select: { id: true, number: true, size: true } },
        },
      });

      // Lock the chassis — mark it as in use
      if (chassisId) {
        await tx.chassis.update({
          where: { id: chassisId },
          data: { isAvailable: false },
        });
      }

      return [newTrip];
    });

    // Link to import or export order if provided
    if (importOrderId) {
      await prisma.importOrder.update({
        where: { id: importOrderId },
        data: { tripId: trip.id, status: 'ASSIGNED', assignedDriverId: driverId, assignedTruckId: truckId },
      });
    } else if (exportOrderId) {
      await prisma.exportOrder.update({
        where: { id: exportOrderId },
        data: { tripId: trip.id, status: 'ASSIGNED', assignedDriverId: driverId, assignedTruckId: truckId },
      });
    }

    // Create initial activity log
    const orderRef = importOrderId ? ' (linked to import order)' : exportOrderId ? ' (linked to export order)' : '';
    await prisma.tripActivityLog.create({
      data: {
        tripId: trip.id,
        activityType: 'STATUS_CHANGE',
        description: `Trip created with status ${trip.status}${orderRef}`,
        newValue: trip.status,
        performedBy: 'System',
      },
    });

    return NextResponse.json({
      ...trip,
      distanceMiles: trip.distanceMiles != null ? Number(trip.distanceMiles) : null,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trip:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid customer, truck, driver, or container ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
