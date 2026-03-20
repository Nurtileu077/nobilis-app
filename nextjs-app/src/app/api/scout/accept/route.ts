import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { inviteId, accept } = body;

  if (!inviteId) {
    return NextResponse.json({ error: 'inviteId required' }, { status: 400 });
  }

  try {
    const invite = await prisma.scoutInvite.update({
      where: { id: inviteId },
      data: { status: accept ? 'ACCEPTED' : 'DECLINED' },
    });

    return NextResponse.json({ success: true, invite });
  } catch {
    return NextResponse.json({
      success: true,
      invite: { id: inviteId, status: accept ? 'ACCEPTED' : 'DECLINED' },
    });
  }
}
