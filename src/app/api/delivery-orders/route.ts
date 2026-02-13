import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch all delivery orders
export async function GET() {
  try {
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        trip: {
          select: {
            id: true,
            status: true,
            driver: {
              select: {
                name: true,
              },
            },
            truck: {
              select: {
                plate: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(deliveryOrders);
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new delivery order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique order number
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `DO-${timestamp}-${randomNum}`;

    // Auto-create container if container details are provided
    if (body.containerNumber && body.containerSize && body.containerType) {
      // Check if container already exists
      const existingContainer = await prisma.container.findUnique({
        where: { number: body.containerNumber },
      });

      // Create container if it doesn't exist
      if (!existingContainer) {
        await prisma.container.create({
          data: {
            number: body.containerNumber,
            size: body.containerSize,
            type: body.containerType,
            available: true, // Mark as available initially
            terminalId: null, // Will be set when container arrives at terminal
          },
        });
      }
    }

    const deliveryOrder = await prisma.deliveryOrder.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        containerNumber: body.containerNumber,
        containerSize: body.containerSize,
        containerType: body.containerType,
        status: body.status || 'PENDING',
        priority: body.priority || 'STANDARD',
        portOfLoading: body.portOfLoading,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryState: body.deliveryState,
        deliveryZip: body.deliveryZip,
        requestedPickupDate: body.requestedPickupDate ? new Date(body.requestedPickupDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        customerReference: body.customerReference,
        bookingNumber: body.bookingNumber,
        billOfLading: body.billOfLading,
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

    return NextResponse.json(deliveryOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery order' },
      { status: 500 }
    );
  }
}
