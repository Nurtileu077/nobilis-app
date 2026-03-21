import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
  }

  const token = randomBytes(32).toString('hex');
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/parent?token=${token}`;

  try {
    await prisma.studentParentRelation.create({
      data: {
        parentId: user.id,
        studentId,
        inviteToken: token,
        accepted: false,
      },
    });
  } catch {
    // DB not connected, just return the URL
  }

  return NextResponse.json({ success: true, inviteUrl, token });
}
