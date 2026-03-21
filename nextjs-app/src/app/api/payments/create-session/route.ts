import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { invoiceId, useCoins, coinAmount } = body;

  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
  }

  // TODO: Create Stripe Checkout Session
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({...});

  return NextResponse.json({
    sessionId: `cs_mock_${Date.now()}`,
    url: `https://checkout.stripe.com/placeholder`,
    coinDiscount: useCoins ? (coinAmount || 0) * 10 : 0,
  });
}
