import { NextRequest, NextResponse } from 'next/server';

// GET /api/coins — get balance and history
export async function GET() {
  return NextResponse.json({
    balance: 450,
    history: [
      { id: '1', action: 'EARN', amount: 50, reason: 'Daily challenge', createdAt: '2025-03-08' },
      { id: '2', action: 'EARN', amount: 25, reason: 'Quiz completed', createdAt: '2025-03-07' },
      { id: '3', action: 'SPEND', amount: 50, reason: 'Extra life', createdAt: '2025-03-06' },
    ],
  });
}

// POST /api/coins — earn or spend coins
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, amount, reason } = body;

  if (!action || !amount || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (action !== 'EARN' && action !== 'SPEND') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // TODO: Prisma transaction — update balance + create log
  return NextResponse.json({
    success: true,
    transaction: { action, amount, reason, balanceAfter: action === 'EARN' ? 500 : 400 },
  });
}
