import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/trips/[id] - Get a single trip
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        customer: true,
        truck: true,
        driver: true,
        container: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...trip,
      distanceMiles: trip.distanceMiles != null ? Number(trip.distanceMiles) : null,
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
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

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const newStatus = status || existingTrip.status;
    const isTripEnding = ['COMPLETED', 'CANCELLED'].includes(newStatus) &&
      !['COMPLETED', 'CANCELLED'].includes(existingTrip.status);
    const newChassisId = chassisId !== undefined ? (chassisId || null) : existingTrip.chassisId;
    const chassisChanged = chassisId !== undefined && chassisId !== existingTrip.chassisId;

    const [trip] = await prisma.$transaction(async (tx) => {
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: {
          customerId: customerId || existingTrip.customerId,
          truckId: truckId || existingTrip.truckId,
          driverId: driverId || existingTrip.driverId,
          containerId: containerId !== undefined ? (containerId || null) : existingTrip.containerId,
          chassisId: newChassisId,
          pickupLocation: pickupLocation || existingTrip.pickupLocation,
          pickupTime: pickupTime !== undefined
            ? (pickupTime ? new Date(pickupTime) : null)
            : existingTrip.pickupTime,
          dropoffLocation: dropoffLocation || existingTrip.dropoffLocation,
          dropoffTime: dropoffTime !== undefined
            ? (dropoffTime ? new Date(dropoffTime) : null)
            : existingTrip.dropoffTime,
          status: newStatus,
          distanceMiles: distanceMiles !== undefined
            ? (distanceMiles ? parseFloat(distanceMiles) : null)
            : existingTrip.distanceMiles,
          chassisReceivedAt: chassisReceivedAt !== undefined
            ? (chassisReceivedAt ? new Date(chassisReceivedAt) : null)
            : existingTrip.chassisReceivedAt,
          chassisReturnedAt: chassisReturnedAt !== undefined
            ? (chassisReturnedAt ? new Date(chassisReturnedAt) : null)
            : existingTrip.chassisReturnedAt,
          notes: notes !== undefined ? notes : existingTrip.notes,
        },
        include: {
          customer: { select: { name: true } },
          truck: { select: { plate: true } },
          driver: { select: { name: true } },
          container: { select: { number: true } },
          chassis: { select: { id: true, number: true, size: true } },
        },
      });

      // Release old chassis if trip is ending or chassis changed
      if (existingTrip.chassisId && (isTripEnding || (chassisChanged && existingTrip.chassisId !== newChassisId))) {
        await tx.chassis.update({
          where: { id: existingTrip.chassisId },
          data: { isAvailable: true },
        });
      }

      // Lock new chassis if chassis changed (and not ending)
      if (chassisChanged && newChassisId && !isTripEnding) {
        await tx.chassis.update({
          where: { id: newChassisId },
          data: { isAvailable: false },
        });
      }

      return [updatedTrip];
    });

    // Log status change
    if (status && status !== existingTrip.status) {
      await prisma.tripActivityLog.create({
        data: {
          tripId: id,
          activityType: 'STATUS_CHANGE',
          description: `Status changed from ${existingTrip.status} to ${status}`,
          oldValue: existingTrip.status,
          newValue: status,
          performedBy: 'System',
        },
      });
    }

    // Log driver assignment change
    if (driverId && driverId !== existingTrip.driverId) {
      await prisma.tripActivityLog.create({
        data: {
          tripId: id,
          activityType: 'ASSIGNMENT_CHANGE',
          description: `Driver reassigned`,
          performedBy: 'System',
        },
      });
    }

    return NextResponse.json({
      ...trip,
      distanceMiles: trip.distanceMiles != null ? Number(trip.distanceMiles) : null,
    });
  } catch (error: any) {
    console.error('Error updating trip:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid customer, truck, driver, or container ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.trip.delete({ where: { id } });
      // Release chassis if one was assigned
      if (existingTrip.chassisId) {
        await tx.chassis.update({
          where: { id: existingTrip.chassisId },
          data: { isAvailable: true },
        });
      }
    });

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting trip:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete trip with existing invoice' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
