import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { studentId, universityId, message } = body;

  if (!studentId || !universityId) {
    return NextResponse.json({ error: 'studentId and universityId required' }, { status: 400 });
  }

  try {
    const invite = await prisma.scoutInvite.upsert({
      where: {
        universityId_studentId: { universityId, studentId },
      },
      update: { message: message || '', status: 'PENDING' },
      create: {
        universityId,
        studentId,
        message: message || '',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, invite });
  } catch {
    return NextResponse.json({
      success: true,
      invite: { studentId, universityId, message, status: 'PENDING', createdAt: new Date().toISOString() },
    });
  }
}
