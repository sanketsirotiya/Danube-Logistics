import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/trips/[id]/documents - Get all documents for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const documents = await prisma.tripDocument.findMany({
      where: { tripId: id },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching trip documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip documents' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/documents - Add a new document to a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { type, title, description, fileUrl, fileName, fileSize, mimeType, uploadedBy } = body;

    // Validation
    if (!type || !title || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Type, title, fileUrl, and fileName are required' },
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

    const document = await prisma.tripDocument.create({
      data: {
        tripId: id,
        type,
        title,
        description: description || null,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        uploadedBy: uploadedBy || null,
      },
    });

    // Log activity
    await prisma.tripActivityLog.create({
      data: {
        tripId: id,
        activityType: 'DOCUMENT_UPLOAD',
        description: `Uploaded ${type} document: ${title}`,
        newValue: fileName,
        performedBy: uploadedBy || 'System',
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating trip document:', error);
    return NextResponse.json(
      { error: 'Failed to create trip document' },
      { status: 500 }
    );
  }
}
