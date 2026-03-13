import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const shipline = await prisma.shipLine.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code ?? null,
        active: body.active ?? true,
        notes: body.notes ?? null,
      },
    });
    return NextResponse.json(shipline);
  } catch (error) {
    console.error('Error updating ship line:', error);
    return NextResponse.json({ error: 'Failed to update ship line' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.shipLine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ship line:', error);
    return NextResponse.json({ error: 'Failed to delete ship line' }, { status: 500 });
  }
}
