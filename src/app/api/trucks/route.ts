import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/trucks - Get all trucks
export async function GET() {
  try {
    const trucks = await prisma.truck.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(trucks);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    );
  }
}

// POST /api/trucks - Create a new truck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { plate, vin, make, model, year, status, notes } = body;

    // Validation
    if (!plate) {
      return NextResponse.json(
        { error: 'Plate number is required' },
        { status: 400 }
      );
    }

    const truck = await prisma.truck.create({
      data: {
        plate,
        vin: vin || null,
        make: make || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        status: status || 'AVAILABLE',
        notes: notes || null,
      },
    });

    return NextResponse.json(truck, { status: 201 });
  } catch (error: any) {
    console.error('Error creating truck:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A truck with this plate or VIN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    );
  }
}
