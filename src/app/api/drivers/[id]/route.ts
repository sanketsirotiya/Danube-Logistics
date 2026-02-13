import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/drivers/[id] - Get a single driver
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const driver = await prisma.driver.findUnique({
      where: { id },
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

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver' },
      { status: 500 }
    );
  }
}

// PUT /api/drivers/[id] - Update a driver
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, license, licenseExpiry, phone, email, status, hireDate, notes } = body;

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        name: name || existingDriver.name,
        license: license || existingDriver.license,
        licenseExpiry: licenseExpiry !== undefined
          ? (licenseExpiry ? new Date(licenseExpiry) : null)
          : existingDriver.licenseExpiry,
        phone: phone !== undefined ? phone : existingDriver.phone,
        email: email !== undefined ? email : existingDriver.email,
        status: status || existingDriver.status,
        hireDate: hireDate !== undefined
          ? (hireDate ? new Date(hireDate) : null)
          : existingDriver.hireDate,
        notes: notes !== undefined ? notes : existingDriver.notes,
      },
    });

    return NextResponse.json(driver);
  } catch (error: any) {
    console.error('Error updating driver:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A driver with this license already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    );
  }
}

// DELETE /api/drivers/[id] - Delete a driver
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!existingDriver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    await prisma.driver.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting driver:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete driver with existing trips' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete driver' },
      { status: 500 }
    );
  }
}
