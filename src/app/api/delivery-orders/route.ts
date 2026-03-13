import { NextResponse } from 'next/server';

// Deprecated — split into /api/import-orders and /api/export-orders
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use /api/import-orders or /api/export-orders.' },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use /api/import-orders or /api/export-orders.' },
    { status: 410 }
  );
}
