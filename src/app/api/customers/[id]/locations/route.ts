import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const locations = await prisma.customerLocation.findMany({
      where: { customerId: id },
      orderBy: [{ isDefault: 'desc' }, { label: 'asc' }],
    });
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('Locations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    // If isDefault, unset other defaults first
    if (body.isDefault) {
      await prisma.customerLocation.updateMany({ where: { customerId: id }, data: { isDefault: false } });
    }
    const location = await prisma.customerLocation.create({
      data: {
        customerId: id,
        label: body.label,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip || '',
        country: body.country || 'USA',
        isDefault: body.isDefault || false,
      },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
