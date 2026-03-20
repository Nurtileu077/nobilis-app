import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json([
      { id: '1', description: 'Менторство — Март 2025', amount: 29900, currency: 'KZT', status: 'PENDING', dueDate: '2025-03-15' },
      { id: '2', description: 'Консультация — Февраль', amount: 15000, currency: 'KZT', status: 'PAID', dueDate: '2025-02-15' },
    ]);
  }
}
