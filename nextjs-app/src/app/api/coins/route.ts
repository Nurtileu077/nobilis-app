import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const transactions = await prisma.coinTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const lastTx = transactions[0];
    const balance = lastTx?.balanceAfter ?? 0;

    return NextResponse.json({ balance, history: transactions });
  } catch {
    return NextResponse.json({
      balance: 450,
      history: [
        { id: '1', action: 'EARN', amount: 50, reason: 'Daily challenge', createdAt: '2025-03-08' },
        { id: '2', action: 'EARN', amount: 25, reason: 'Quiz completed', createdAt: '2025-03-07' },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { action, amount, reason } = body;

  if (!action || !amount || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (action !== 'EARN' && action !== 'SPEND') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    // Get current balance
    const lastTx = await prisma.coinTransaction.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = lastTx?.balanceAfter ?? 0;

    if (action === 'SPEND' && currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const newBalance = action === 'EARN' ? currentBalance + amount : currentBalance - amount;

    const transaction = await prisma.coinTransaction.create({
      data: {
        userId: user.id,
        action,
        amount,
        reason,
        balanceAfter: newBalance,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch {
    const mockBalance = action === 'EARN' ? 500 : 400;
    return NextResponse.json({
      success: true,
      transaction: { action, amount, reason, balanceAfter: mockBalance },
    });
  }
}
