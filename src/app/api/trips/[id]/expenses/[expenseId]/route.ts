import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string; expenseId: string }>;

// DELETE /api/trips/[id]/expenses/[expenseId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id, expenseId } = await params;

    const expense = await prisma.tripExpense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await prisma.tripExpense.delete({
      where: { id: expenseId },
    });

    // Log activity
    await prisma.tripActivityLog.create({
      data: {
        tripId: id,
        activityType: 'SYSTEM_EVENT',
        description: `Deleted expense: ${expense.description}`,
        oldValue: `$${expense.amount}`,
      },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
