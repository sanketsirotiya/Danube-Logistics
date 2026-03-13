import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.importOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        trip: { select: { id: true, status: true } },
        shipLine: { select: { id: true, name: true, code: true } },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching import orders:', error);
    return NextResponse.json({ error: 'Failed to fetch import orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `IMP-${timestamp}-${rand}`;

    // Auto-create container record if it doesn't exist
    const existing = await prisma.container.findUnique({ where: { number: body.containerNumber } });
    if (!existing) {
      await prisma.container.create({
        data: {
          number: body.containerNumber,
          size: body.containerSize,
          type: body.containerType,
          available: true,
        },
      });
    }

    const order = await prisma.importOrder.create({
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
        deliveryCity: body.deliveryCity || null,
        deliveryState: body.deliveryState || null,
        deliveryZip: body.deliveryZip || null,
        containerAvailableDate: body.containerAvailableDate ? new Date(body.containerAvailableDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        customerReference: body.customerReference || '',
        billOfLading: body.billOfLading || null,
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
  } catch (error) {
    console.error('Error creating import order:', error);
    return NextResponse.json({ error: 'Failed to create import order' }, { status: 500 });
  }
}
