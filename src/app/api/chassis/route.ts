import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const chassis = await prisma.chassis.findMany({
      orderBy: { number: 'asc' },
    });
    return NextResponse.json(chassis);
  } catch (error) {
    console.error('Error fetching chassis:', error);
    return NextResponse.json({ error: 'Failed to fetch chassis' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.number || !body.size) {
      return NextResponse.json({ error: 'Chassis number and size are required' }, { status: 400 });
    }

    const chassis = await prisma.chassis.create({
      data: {
        number: body.number,
        size: body.size,
        isAvailable: body.isAvailable ?? true,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(chassis, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Chassis number already exists' }, { status: 409 });
    }
    console.error('Error creating chassis:', error);
    return NextResponse.json({ error: 'Failed to create chassis' }, { status: 500 });
  }
}
