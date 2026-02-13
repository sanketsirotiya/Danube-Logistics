import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/customers/[id] - Get a single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        rates: true,
        _count: {
          select: {
            trips: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update a customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, contactName, email, phone, pricingType, billingAddress, paymentTerms } = body;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name || existingCustomer.name,
        contactName: contactName !== undefined ? contactName : existingCustomer.contactName,
        email: email || existingCustomer.email,
        phone: phone !== undefined ? phone : existingCustomer.phone,
        pricingType: pricingType || existingCustomer.pricingType,
        billingAddress: billingAddress !== undefined ? billingAddress : existingCustomer.billingAddress,
        paymentTerms: paymentTerms !== undefined ? parseInt(paymentTerms) : existingCustomer.paymentTerms,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing trips or invoices' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
