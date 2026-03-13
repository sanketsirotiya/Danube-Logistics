import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.importOrder.findUnique({
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
      return NextResponse.json({ error: 'Import order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching import order:', error);
    return NextResponse.json({ error: 'Failed to fetch import order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = await prisma.importOrder.update({
      where: { id },
      data: {
        containerNumber: body.containerNumber,
        containerSize: body.containerSize,
        containerType: body.containerType,
        status: body.status,
        priority: body.priority,
        portOfLoading: body.portOfLoading,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryState: body.deliveryState,
        deliveryZip: body.deliveryZip,
        containerAvailableDate: body.containerAvailableDate ? new Date(body.containerAvailableDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        actualPickupDate: body.actualPickupDate ? new Date(body.actualPickupDate) : null,
        actualDeliveryDate: body.actualDeliveryDate ? new Date(body.actualDeliveryDate) : null,
        customerReference: body.customerReference,
        billOfLading: body.billOfLading,
        shipLineId: body.shipLineId !== undefined ? body.shipLineId || null : undefined,
        tripId: body.tripId,
        assignedDriverId: body.assignedDriverId,
        assignedTruckId: body.assignedTruckId,
        notes: body.notes,
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating import order:', error);
    return NextResponse.json({ error: 'Failed to update import order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.importOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting import order:', error);
    return NextResponse.json({ error: 'Failed to delete import order' }, { status: 500 });
  }
}
