import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.exportOrder.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: {
          include: {
            driver: { select: { name: true, phone: true } },
            truck: { select: { plate: true, model: true } },
            container: { select: { number: true, size: true, type: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Export order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching export order:', error);
    return NextResponse.json({ error: 'Failed to fetch export order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await prisma.exportOrder.update({
      where: { id },
      data: {
        bookingNumber: body.bookingNumber,
        containerSize: body.containerSize,
        containerType: body.containerType,
        status: body.status,
        priority: body.priority,
        pickupAddress: body.pickupAddress,
        pickupCity: body.pickupCity,
        pickupState: body.pickupState,
        pickupZip: body.pickupZip,
        portOfDischarge: body.portOfDischarge,
        requestedPickupDate: body.requestedPickupDate ? new Date(body.requestedPickupDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        actualPickupDate: body.actualPickupDate ? new Date(body.actualPickupDate) : null,
        actualDeliveryDate: body.actualDeliveryDate ? new Date(body.actualDeliveryDate) : null,
        shipLineId: body.shipLineId !== undefined ? (body.shipLineId || null) : undefined,
        tripId: body.tripId,
        assignedDriverId: body.assignedDriverId,
        assignedTruckId: body.assignedTruckId,
        notes: body.notes,
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: { select: { id: true, status: true } },
        shipLine: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating export order:', error);
    return NextResponse.json({ error: 'Failed to update export order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.exportOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting export order:', error);
    return NextResponse.json({ error: 'Failed to delete export order' }, { status: 500 });
  }
}
