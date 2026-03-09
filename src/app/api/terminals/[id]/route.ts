import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, address } = body;

    const terminal = await prisma.terminal.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code !== undefined ? (code || null) : undefined,
        address: address !== undefined ? address : undefined,
      },
    });
    return NextResponse.json(terminal);
  } catch (error: any) {
    console.error('Error updating terminal:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Terminal not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update terminal' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    await prisma.terminal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting terminal:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Terminal not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete terminal' }, { status: 500 });
  }
}
