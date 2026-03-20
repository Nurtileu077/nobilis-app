import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: '1', description: 'Менторство — Март 2025', amount: 29900, currency: 'KZT', status: 'PENDING', dueDate: '2025-03-15' },
    { id: '2', description: 'Консультация — Февраль', amount: 15000, currency: 'KZT', status: 'PAID', dueDate: '2025-02-15' },
  ]);
}
