import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string; documentId: string }>;

// DELETE /api/trips/[id]/documents/[documentId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id, documentId } = await params;

    const document = await prisma.tripDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await prisma.tripDocument.delete({
      where: { id: documentId },
    });

    // Log activity
    await prisma.tripActivityLog.create({
      data: {
        tripId: id,
        activityType: 'SYSTEM_EVENT',
        description: `Deleted document: ${document.title}`,
        oldValue: document.fileName,
      },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
