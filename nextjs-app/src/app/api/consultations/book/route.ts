import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, time, name, email } = body;

  if (!date || !time) {
    return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
  }

  // TODO: Create in Prisma, send confirmation email, create Google Meet link
  const consultation = {
    id: `cons-${Date.now()}`,
    date,
    time,
    name: name || 'Guest',
    email: email || '',
    status: 'BOOKED',
    meetingUrl: `https://meet.google.com/placeholder`,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, consultation });
}
