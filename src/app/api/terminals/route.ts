import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const terminals = await prisma.terminal.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, address: true, syncEnabled: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(terminals);
  } catch (error) {
    console.error('Error fetching terminals:', error);
    return NextResponse.json({ error: 'Failed to fetch terminals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const terminal = await prisma.terminal.create({
      data: { name, code: code || null, address: address || null },
    });
    return NextResponse.json(terminal, { status: 201 });
  } catch (error: any) {
    console.error('Error creating terminal:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A terminal with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create terminal' }, { status: 500 });
  }
}
