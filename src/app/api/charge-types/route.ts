import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/charge-types - Get all charge types
export async function GET() {
  try {
    const chargeTypes = await prisma.chargeType.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(chargeTypes);
  } catch (error) {
    console.error('Error fetching charge types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charge types' },
      { status: 500 }
    );
  }
}

// POST /api/charge-types - Create a new charge type
export async function POST(request: NextRequest) {
  try {
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

    // Validation
    if (!name || !code || !category) {
      return NextResponse.json(
        { error: 'Name, code, and category are required' },
        { status: 400 }
      );
    }

    const chargeType = await prisma.chargeType.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        category,
        defaultRate: defaultRate ? parseFloat(defaultRate) : null,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : null,
      },
    });

    return NextResponse.json(chargeType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating charge type:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A charge type with this code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create charge type' },
      { status: 500 }
    );
  }
}
