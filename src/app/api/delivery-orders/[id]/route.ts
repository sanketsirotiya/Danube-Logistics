import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch single delivery order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deliveryOrder = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        trip: {
          include: {
            driver: {
              select: {
                name: true,
                phone: true,
              },
            },
            truck: {
              select: {
                plate: true,
                model: true,
              },
            },
            container: {
              select: {
                number: true,
                size: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!deliveryOrder) {
      return NextResponse.json(
        { error: 'Delivery order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deliveryOrder);
  } catch (error) {
    console.error('Error fetching delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery order' },
      { status: 500 }
    );
  }
}

// PUT - Update delivery order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const deliveryOrder = await prisma.deliveryOrder.update({
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
        requestedPickupDate: body.requestedPickupDate ? new Date(body.requestedPickupDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        actualPickupDate: body.actualPickupDate ? new Date(body.actualPickupDate) : null,
        actualDeliveryDate: body.actualDeliveryDate ? new Date(body.actualDeliveryDate) : null,
        customerReference: body.customerReference,
        bookingNumber: body.bookingNumber,
        billOfLading: body.billOfLading,
        tripId: body.tripId,
        assignedDriverId: body.assignedDriverId,
        assignedTruckId: body.assignedTruckId,
        cargoDescription: body.cargoDescription,
        weight: body.weight,
        specialInstructions: body.specialInstructions,
        notes: body.notes,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(deliveryOrder);
  } catch (error) {
    console.error('Error updating delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery order' },
      { status: 500 }
    );
  }
}

// DELETE - Delete delivery order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deliveryOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery order' },
      { status: 500 }
    );
  }
}
