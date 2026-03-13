import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const chassis = await prisma.chassis.findUnique({ where: { id } });
    if (!chassis) {
      return NextResponse.json({ error: 'Chassis not found' }, { status: 404 });
    }
    return NextResponse.json(chassis);
  } catch (error) {
    console.error('Error fetching chassis:', error);
    return NextResponse.json({ error: 'Failed to fetch chassis' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // isAvailable is auto-managed by trip assignment — do not allow direct changes
    const chassis = await prisma.chassis.update({
      where: { id },
      data: {
        ...(body.number !== undefined && { number: body.number }),
        ...(body.size !== undefined && { size: body.size }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
      },
    });

    return NextResponse.json(chassis);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Chassis number already exists' }, { status: 409 });
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Chassis not found' }, { status: 404 });
    }
    console.error('Error updating chassis:', error);
    return NextResponse.json({ error: 'Failed to update chassis' }, { status: 500 });
  }
}
