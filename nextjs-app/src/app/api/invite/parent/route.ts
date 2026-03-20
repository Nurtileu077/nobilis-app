import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  const token = randomBytes(32).toString('hex');
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/parent?token=${token}`;

  // TODO: Save to Prisma StudentParentRelation

  return NextResponse.json({ success: true, inviteUrl, token });
}
