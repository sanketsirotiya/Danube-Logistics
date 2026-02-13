import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices - Get all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            pricingType: true,
          },
        },
        trip: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            pickupTime: true,
            dropoffTime: true,
            distanceMiles: true,
            container: {
              select: {
                number: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tripId,
      customerId,
      pricingType,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      dueDate,
      notes
    } = body;

    // Validation
    if (!tripId || !customerId || !pricingType || !lineItems || !subtotal || !totalAmount || !dueDate) {
      return NextResponse.json(
        { error: 'Trip, customer, pricing type, line items, amounts, and due date are required' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        tripId,
        customerId,
        pricingType,
        lineItems,
        subtotal: parseFloat(subtotal),
        taxRate: taxRate ? parseFloat(taxRate) : 0,
        taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
        totalAmount: parseFloat(totalAmount),
        dueDate: new Date(dueDate),
        notes: notes || null,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
        trip: {
          select: {
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An invoice already exists for this trip' },
        { status: 409 }
      );
    }

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid trip or customer ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
