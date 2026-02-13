import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET /api/trips/[id]/expenses - Get all expenses for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const expenses = await prisma.tripExpense.findMany({
      where: { tripId: id },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching trip expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip expenses' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/expenses - Add a new expense to a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { category, description, amount, receiptUrl, paidBy, paidAt, notes } = body;

    // Validation
    if (!category || !description || !amount) {
      return NextResponse.json(
        { error: 'Category, description, and amount are required' },
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

    const expense = await prisma.tripExpense.create({
      data: {
        tripId: id,
        category,
        description,
        amount: parseFloat(amount),
        receiptUrl: receiptUrl || null,
        paidBy: paidBy || null,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        notes: notes || null,
      },
    });

    // Log activity
    await prisma.tripActivityLog.create({
      data: {
        tripId: id,
        activityType: 'EXPENSE_ADDED',
        description: `Added ${category} expense: ${description}`,
        newValue: `$${amount}`,
        performedBy: paidBy || 'System',
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating trip expense:', error);
    return NextResponse.json(
      { error: 'Failed to create trip expense' },
      { status: 500 }
    );
  }
}
