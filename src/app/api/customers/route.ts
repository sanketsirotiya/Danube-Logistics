import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        rates: {
          select: {
            id: true,
            routeFrom: true,
            routeTo: true,
            containerType: true,
            flatRate: true,
            effectiveDate: true,
            expiresAt: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            trips: true,
            invoices: true,
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, contactName, email, phone, pricingType, billingAddress, paymentTerms } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        contactName: contactName || null,
        email,
        phone: phone || null,
        pricingType: pricingType || 'FLAT',
        billingAddress: billingAddress || null,
        paymentTerms: paymentTerms ? parseInt(paymentTerms) : 30,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
