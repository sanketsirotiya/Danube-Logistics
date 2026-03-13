import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.exportOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: { select: { id: true, status: true } },
        shipLine: { select: { id: true, name: true, code: true } },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching export orders:', error);
    return NextResponse.json({ error: 'Failed to fetch export orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `EXP-${timestamp}-${rand}`;

    const order = await prisma.exportOrder.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        bookingNumber: body.bookingNumber,
        containerSize: body.containerSize,
        containerType: body.containerType,
        status: body.status || 'PENDING',
        priority: body.priority || 'STANDARD',
        pickupAddress: body.pickupAddress,
        pickupCity: body.pickupCity || null,
        pickupState: body.pickupState || null,
        pickupZip: body.pickupZip || null,
        portOfDischarge: body.portOfDischarge,
        requestedPickupDate: body.requestedPickupDate ? new Date(body.requestedPickupDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        shipLineId: body.shipLineId || null,
        notes: body.notes || null,
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: { select: { id: true, status: true } },
        shipLine: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating export order:', error);
    return NextResponse.json({ error: 'Failed to create export order', detail: error?.message }, { status: 500 });
  }
}
