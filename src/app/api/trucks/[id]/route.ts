import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/trucks/[id] - Get a single truck
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const truck = await prisma.truck.findUnique({
      where: { id },
    });

    if (!truck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(truck);
  } catch (error) {
    console.error('Error fetching truck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch truck' },
      { status: 500 }
    );
  }
}

// PUT /api/trucks/[id] - Update a truck
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { plate, vin, make, model, year, status, notes } = body;

    // Check if truck exists
    const existingTruck = await prisma.truck.findUnique({
      where: { id },
    });

    if (!existingTruck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      );
    }

    const truck = await prisma.truck.update({
      where: { id },
      data: {
        plate: plate || existingTruck.plate,
        vin: vin !== undefined ? vin : existingTruck.vin,
        make: make !== undefined ? make : existingTruck.make,
        model: model !== undefined ? model : existingTruck.model,
        year: year ? parseInt(year) : existingTruck.year,
        status: status || existingTruck.status,
        notes: notes !== undefined ? notes : existingTruck.notes,
      },
    });

    return NextResponse.json(truck);
  } catch (error: any) {
    console.error('Error updating truck:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A truck with this plate or VIN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update truck' },
      { status: 500 }
    );
  }
}

// DELETE /api/trucks/[id] - Delete a truck
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if truck exists
    const existingTruck = await prisma.truck.findUnique({
      where: { id },
    });

    if (!existingTruck) {
      return NextResponse.json(
        { error: 'Truck not found' },
        { status: 404 }
      );
    }

    await prisma.truck.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Truck deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting truck:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete truck with existing trips' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete truck' },
      { status: 500 }
    );
  }
}
