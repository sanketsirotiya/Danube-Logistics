import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/charge-types/[id] - Get a single charge type
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const chargeType = await prisma.chargeType.findUnique({
      where: { id },
    });

    if (!chargeType) {
      return NextResponse.json(
        { error: 'Charge type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chargeType);
  } catch (error) {
    console.error('Error fetching charge type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charge type' },
      { status: 500 }
    );
  }
}

// PUT /api/charge-types/[id] - Update a charge type
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      code,
      description,
      category,
      defaultRate,
      isActive,
      displayOrder,
    } = body;

    // Check if charge type exists
    const existingChargeType = await prisma.chargeType.findUnique({
      where: { id },
    });

    if (!existingChargeType) {
      return NextResponse.json(
        { error: 'Charge type not found' },
        { status: 404 }
      );
    }

    const chargeType = await prisma.chargeType.update({
      where: { id },
      data: {
        name: name || existingChargeType.name,
        code: code ? code.toUpperCase() : existingChargeType.code,
        description: description !== undefined ? description : existingChargeType.description,
        category: category || existingChargeType.category,
        defaultRate: defaultRate !== undefined ? (defaultRate ? parseFloat(defaultRate) : null) : existingChargeType.defaultRate,
        isActive: isActive !== undefined ? isActive : existingChargeType.isActive,
        displayOrder: displayOrder !== undefined ? (displayOrder ? parseInt(displayOrder) : null) : existingChargeType.displayOrder,
      },
    });

    return NextResponse.json(chargeType);
  } catch (error: any) {
    console.error('Error updating charge type:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A charge type with this code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update charge type' },
      { status: 500 }
    );
  }
}

// DELETE /api/charge-types/[id] - Delete a charge type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if charge type exists
    const existingChargeType = await prisma.chargeType.findUnique({
      where: { id },
    });

    if (!existingChargeType) {
      return NextResponse.json(
        { error: 'Charge type not found' },
        { status: 404 }
      );
    }

    await prisma.chargeType.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Charge type deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting charge type:', error);

    return NextResponse.json(
      { error: 'Failed to delete charge type' },
      { status: 500 }
    );
  }
}
