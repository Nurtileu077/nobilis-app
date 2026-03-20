import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, universityId, message } = body;

  if (!studentId || !universityId) {
    return NextResponse.json({ error: 'studentId and universityId required' }, { status: 400 });
  }

  // TODO: Prisma ScoutInvite.create
  return NextResponse.json({
    success: true,
    invite: { studentId, universityId, message, status: 'PENDING', createdAt: new Date().toISOString() },
  });
}
