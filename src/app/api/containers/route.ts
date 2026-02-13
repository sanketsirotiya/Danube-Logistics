import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/containers - Get all containers
export async function GET() {
  try {
    const containers = await prisma.container.findMany({
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json(containers);
  } catch (error) {
    console.error('Error fetching containers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    );
  }
}
