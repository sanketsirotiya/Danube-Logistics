import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/expenses - Generate expense report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const tripId = searchParams.get('tripId');

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate);
      if (endDate) where.paidAt.lte = new Date(endDate);
    }

    if (category) where.category = category;
    if (tripId) where.tripId = tripId;

    // Fetch expenses with trip relations
    const expenses = await prisma.tripExpense.findMany({
      where,
      include: {
        trip: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            status: true,
            customer: {
              select: {
                name: true,
              },
            },
            driver: {
              select: {
                name: true,
              },
            },
            truck: {
              select: {
                plate: true,
              },
            },
          },
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    // Calculate expenses by category
    const expensesByCategory = new Map<string, {
      category: string;
      count: number;
      totalAmount: number;
    }>();

    expenses.forEach(exp => {
      const category = exp.category;
      const amount = Number(exp.amount);

      if (expensesByCategory.has(category)) {
        const existing = expensesByCategory.get(category)!;
        existing.count++;
        existing.totalAmount += amount;
      } else {
        expensesByCategory.set(category, {
          category,
          count: 1,
          totalAmount: amount,
        });
      }
    });

    // Calculate expenses by trip
    const expensesByTrip = new Map<string, {
      tripId: string;
      route: string;
      customer: string;
      driver: string;
      expenseCount: number;
      totalExpenses: number;
    }>();

    expenses.forEach(exp => {
      const tripId = exp.trip.id;
      const amount = Number(exp.amount);

      if (expensesByTrip.has(tripId)) {
        const existing = expensesByTrip.get(tripId)!;
        existing.expenseCount++;
        existing.totalExpenses += amount;
      } else {
        expensesByTrip.set(tripId, {
          tripId,
          route: `${exp.trip.pickupLocation} → ${exp.trip.dropoffLocation}`,
          customer: exp.trip.customer.name,
          driver: exp.trip.driver.name,
          expenseCount: 1,
          totalExpenses: amount,
        });
      }
    });

    // Calculate summary
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const summary = {
      totalExpenses: expenses.length,
      totalAmount: totalExpenses,
      averageAmount: averageExpense,
      byCategory: Array.from(expensesByCategory.values())
        .sort((a, b) => b.totalAmount - a.totalAmount),
    };

    return NextResponse.json({
      expenses: expenses.map(exp => ({
        id: exp.id,
        category: exp.category,
        description: exp.description,
        amount: Number(exp.amount),
        paidBy: exp.paidBy,
        paidAt: exp.paidAt.toISOString(),
        tripRoute: `${exp.trip.pickupLocation} → ${exp.trip.dropoffLocation}`,
        customer: exp.trip.customer.name,
        driver: exp.trip.driver.name,
        truck: exp.trip.truck.plate,
        tripStatus: exp.trip.status,
        notes: exp.notes,
      })),
      expensesByTrip: Array.from(expensesByTrip.values())
        .sort((a, b) => b.totalExpenses - a.totalExpenses),
      summary,
    });
  } catch (error) {
    console.error('Error generating expense report:', error);
    return NextResponse.json(
      { error: 'Failed to generate expense report' },
      { status: 500 }
    );
  }
}
