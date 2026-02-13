import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🔍 Checking for delivery orders with missing containers...');

    // Get all delivery orders with container information
    const deliveryOrders = await prisma.deliveryOrder.findMany({
      where: {
        containerNumber: { not: null },
        containerSize: { not: null },
        containerType: { not: null },
      },
      select: {
        id: true,
        orderNumber: true,
        containerNumber: true,
        containerSize: true,
        containerType: true,
      },
    });

    console.log(`Found ${deliveryOrders.length} delivery orders with container details`);

    let created = 0;
    let skipped = 0;
    const results = [];

    for (const order of deliveryOrders) {
      // Check if container already exists
      const existingContainer = await prisma.container.findUnique({
        where: { number: order.containerNumber! },
      });

      if (existingContainer) {
        console.log(`⏭️  ${order.containerNumber} - Already exists (skipped)`);
        skipped++;
        results.push({
          containerNumber: order.containerNumber,
          orderNumber: order.orderNumber,
          status: 'skipped',
          reason: 'Already exists',
        });
      } else {
        // Create the container
        await prisma.container.create({
          data: {
            number: order.containerNumber!,
            size: order.containerSize!,
            type: order.containerType!,
            available: true,
            terminalId: null,
          },
        });
        console.log(`✅ ${order.containerNumber} - Created for order ${order.orderNumber}`);
        created++;
        results.push({
          containerNumber: order.containerNumber,
          orderNumber: order.orderNumber,
          status: 'created',
          reason: 'New container created',
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: deliveryOrders.length,
        created,
        skipped,
      },
      results,
    });
  } catch (error) {
    console.error('Error creating missing containers:', error);
    return NextResponse.json(
      { error: 'Failed to create missing containers' },
      { status: 500 }
    );
  }
}
