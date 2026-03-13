import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const shiplines = await prisma.shipLine.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(shiplines);
  } catch (error) {
    console.error('Error fetching ship lines:', error);
    return NextResponse.json({ error: 'Failed to fetch ship lines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shipline = await prisma.shipLine.create({
      data: {
        name: body.name,
        code: body.code || null,
        active: body.active ?? true,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(shipline, { status: 201 });
  } catch (error) {
    console.error('Error creating ship line:', error);
    return NextResponse.json({ error: 'Failed to create ship line' }, { status: 500 });
  }
}
