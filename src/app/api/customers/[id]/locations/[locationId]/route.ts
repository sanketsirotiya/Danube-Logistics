import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; locationId: string }> }) {
  try {
    const { id, locationId } = await params;
    const body = await request.json();
    if (body.isDefault) {
      await prisma.customerLocation.updateMany({ where: { customerId: id }, data: { isDefault: false } });
    }
    const location = await prisma.customerLocation.update({
      where: { id: locationId },
      data: {
        label: body.label,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip || '',
        country: body.country || 'USA',
        isDefault: body.isDefault || false,
      },
    });
    return NextResponse.json(location);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; locationId: string }> }) {
  try {
    const { locationId } = await params;
    await prisma.customerLocation.delete({ where: { id: locationId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
