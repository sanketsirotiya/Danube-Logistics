import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/drivers - Get all drivers
export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

// POST /api/drivers - Create a new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, license, licenseExpiry, phone, email, status, hireDate, notes } = body;

    // Validation
    if (!name || !license) {
      return NextResponse.json(
        { error: 'Name and license are required' },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        license,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        phone: phone || null,
        email: email || null,
        status: status || 'ACTIVE',
        hireDate: hireDate ? new Date(hireDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error('Error creating driver:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A driver with this license already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}
