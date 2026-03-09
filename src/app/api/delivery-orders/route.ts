import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import pg from 'pg';

// GET - Fetch all delivery orders
export async function GET() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const sql = `
      SELECT
        dord.id,
        dord.order_number AS "orderNumber",
        dord.customer_id AS "customerId",
        dord.container_number AS "containerNumber",
        dord.container_size::text AS "containerSize",
        dord.container_type::text AS "containerType",
        dord.order_type AS "orderType",
        dord.status::text AS status,
        dord.priority::text AS priority,
        dord.port_of_loading AS "portOfLoading",
        dord.delivery_address AS "deliveryAddress",
        dord.delivery_city AS "deliveryCity",
        dord.delivery_state AS "deliveryState",
        dord.delivery_zip AS "deliveryZip",
        dord.requested_pickup_date AS "requestedPickupDate",
        dord.requested_delivery_date AS "requestedDeliveryDate",
        dord.actual_pickup_date AS "actualPickupDate",
        dord.actual_delivery_date AS "actualDeliveryDate",
        dord.customer_reference AS "customerReference",
        dord.booking_number AS "bookingNumber",
        dord.bill_of_lading AS "billOfLading",
        dord.trip_id AS "tripId",
        dord.assigned_driver_id AS "assignedDriverId",
        dord.assigned_truck_id AS "assignedTruckId",
        dord.weight,
        dord.notes,
        dord.created_at AS "createdAt",
        dord.updated_at AS "updatedAt",
        c.name AS "customerName",
        c.email AS "customerEmail",
        c.phone AS "customerPhone",
        t.id AS "tripRelId",
        t.status::text AS "tripStatus"
      FROM public.delivery_orders dord
      LEFT JOIN public.customers c ON dord.customer_id = c.id
      LEFT JOIN public.trips t ON dord.trip_id = t.id
      ORDER BY dord.created_at DESC
    `;
    const result = await client.query(sql);
    const rows = result.rows;

    const serialized = rows.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber,
      customerId: row.customerId,
      containerNumber: row.containerNumber,
      containerSize: row.containerSize,
      containerType: row.containerType,
      orderType: row.orderType,
      status: row.status,
      priority: row.priority,
      portOfLoading: row.portOfLoading,
      deliveryAddress: row.deliveryAddress,
      deliveryCity: row.deliveryCity,
      deliveryState: row.deliveryState,
      deliveryZip: row.deliveryZip,
      requestedPickupDate: row.requestedPickupDate,
      requestedDeliveryDate: row.requestedDeliveryDate,
      actualPickupDate: row.actualPickupDate,
      actualDeliveryDate: row.actualDeliveryDate,
      customerReference: row.customerReference,
      bookingNumber: row.bookingNumber,
      billOfLading: row.billOfLading,
      tripId: row.tripId,
      assignedDriverId: row.assignedDriverId,
      assignedTruckId: row.assignedTruckId,
      weight: row.weight != null ? Number(row.weight) : null,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      customer: {
        name: row.customerName,
        email: row.customerEmail,
        phone: row.customerPhone,
      },
      trip: row.tripRelId ? { id: row.tripRelId, status: row.tripStatus } : null,
    }));

    await client.end();
    return NextResponse.json(serialized);
  } catch (error: any) {
    await client.end().catch(() => {});
    console.error('Error fetching delivery orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery orders', detail: error?.message, code: error?.code },
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
        orderType: body.orderType || 'IMPORT',
        status: body.status || 'PENDING',
        priority: body.priority || 'STANDARD',
        portOfLoading: body.portOfLoading || null,
        deliveryAddress: body.deliveryAddress,
        deliveryCity: body.deliveryCity,
        deliveryState: body.deliveryState,
        deliveryZip: body.deliveryZip,
        requestedPickupDate: body.requestedPickupDate ? new Date(body.requestedPickupDate) : null,
        requestedDeliveryDate: body.requestedDeliveryDate ? new Date(body.requestedDeliveryDate) : null,
        customerReference: body.customerReference,
        bookingNumber: body.bookingNumber,
        billOfLading: body.billOfLading,
        weight: body.weight,
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

    return NextResponse.json({
      ...deliveryOrder,
      weight: deliveryOrder.weight != null ? Number(deliveryOrder.weight) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery order:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery order' },
      { status: 500 }
    );
  }
}
