import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/invoices/[id] - Get a single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        trip: {
          include: {
            truck: true,
            driver: true,
            container: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update an invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      dueDate,
      paid,
      paidAt,
      paymentMethod,
      notes
    } = body;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        lineItems: lineItems || existingInvoice.lineItems,
        subtotal: subtotal !== undefined ? parseFloat(subtotal) : existingInvoice.subtotal,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : existingInvoice.taxRate,
        taxAmount: taxAmount !== undefined ? parseFloat(taxAmount) : existingInvoice.taxAmount,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : existingInvoice.totalAmount,
        dueDate: dueDate ? new Date(dueDate) : existingInvoice.dueDate,
        paid: paid !== undefined ? paid : existingInvoice.paid,
        paidAt: paidAt !== undefined ? (paidAt ? new Date(paidAt) : null) : existingInvoice.paidAt,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : existingInvoice.paymentMethod,
        notes: notes !== undefined ? notes : existingInvoice.notes,
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

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);

    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);

    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
