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
        deliveryOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      deliveryOrderId,
      customerId,
      truckId,
      driverId,
      containerId,
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
    if (!customerId || !truckId || !driverId || !containerId || !pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: 'Customer, truck, driver, container, pickup and dropoff locations are required' },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        customerId,
        truckId,
        driverId,
        containerId,
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
        customer: {
          select: {
            name: true,
          },
        },
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
        container: {
          select: {
            number: true,
          },
        },
      },
    });

    // If linked to a delivery order, update the delivery order
    if (deliveryOrderId) {
      await prisma.deliveryOrder.update({
        where: { id: deliveryOrderId },
        data: {
          tripId: trip.id,
          status: 'ASSIGNED',
          assignedDriverId: driverId,
          assignedTruckId: truckId,
        },
      });
    }

    // Create initial activity log
    await prisma.tripActivityLog.create({
      data: {
        tripId: trip.id,
        activityType: 'STATUS_CHANGE',
        description: `Trip created with status ${trip.status}${deliveryOrderId ? ' (linked to delivery order)' : ''}`,
        newValue: trip.status,
        performedBy: 'System',
      },
    });

    return NextResponse.json(trip, { status: 201 });
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
