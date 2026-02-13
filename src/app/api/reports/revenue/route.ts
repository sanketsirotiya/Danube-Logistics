import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/revenue - Generate revenue report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');
    const paidOnly = searchParams.get('paidOnly') === 'true';

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (customerId) where.customerId = customerId;
    if (paidOnly) where.paid = true;

    // Fetch invoices with relations
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            pricingType: true,
          },
        },
        trip: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate revenue by customer
    const revenueByCustomer = new Map<string, {
      customerId: string;
      customerName: string;
      invoiceCount: number;
      totalRevenue: number;
      paidRevenue: number;
      pendingRevenue: number;
    }>();

    invoices.forEach(inv => {
      const customerId = inv.customer.id;
      const customerName = inv.customer.name;
      const amount = Number(inv.totalAmount);

      if (revenueByCustomer.has(customerId)) {
        const existing = revenueByCustomer.get(customerId)!;
        existing.invoiceCount++;
        existing.totalRevenue += amount;
        if (inv.paid) {
          existing.paidRevenue += amount;
        } else {
          existing.pendingRevenue += amount;
        }
      } else {
        revenueByCustomer.set(customerId, {
          customerId,
          customerName,
          invoiceCount: 1,
          totalRevenue: amount,
          paidRevenue: inv.paid ? amount : 0,
          pendingRevenue: inv.paid ? 0 : amount,
        });
      }
    });

    // Calculate summary
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const paidRevenue = invoices.filter(inv => inv.paid)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const pendingRevenue = invoices.filter(inv => !inv.paid)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const overdueRevenue = invoices.filter(inv => !inv.paid && new Date(inv.dueDate) < new Date())
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const summary = {
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.paid).length,
      pendingInvoices: invoices.filter(inv => !inv.paid && new Date(inv.dueDate) >= new Date()).length,
      overdueInvoices: invoices.filter(inv => !inv.paid && new Date(inv.dueDate) < new Date()).length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue,
      averageInvoiceAmount: invoices.length > 0 ? totalRevenue / invoices.length : 0,
    };

    return NextResponse.json({
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customer.name,
        pricingType: inv.customer.pricingType,
        route: `${inv.trip.pickupLocation} → ${inv.trip.dropoffLocation}`,
        subtotal: Number(inv.subtotal),
        taxAmount: Number(inv.taxAmount),
        totalAmount: Number(inv.totalAmount),
        paid: inv.paid,
        paidAt: inv.paidAt?.toISOString() || null,
        dueDate: inv.dueDate.toISOString(),
        isOverdue: !inv.paid && new Date(inv.dueDate) < new Date(),
        createdAt: inv.createdAt.toISOString(),
      })),
      revenueByCustomer: Array.from(revenueByCustomer.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue),
      summary,
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}
