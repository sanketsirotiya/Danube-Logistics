import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/trips/[id]/activity - Get activity log for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const activities = await prisma.tripActivityLog.findMany({
      where: { tripId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching trip activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip activity log' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/activity - Add a manual activity log entry
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { activityType, description, oldValue, newValue, performedBy, metadata } = body;

    // Validation
    if (!activityType || !description) {
      return NextResponse.json(
        { error: 'Activity type and description are required' },
        { status: 400 }
      );
    }

    // Verify trip exists
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const activity = await prisma.tripActivityLog.create({
      data: {
        tripId: id,
        activityType,
        description,
        oldValue: oldValue || null,
        newValue: newValue || null,
        performedBy: performedBy || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
