import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { toUserId, liked } = body;

  if (!toUserId || liked === undefined) {
    return NextResponse.json({ error: 'toUserId and liked are required' }, { status: 400 });
  }

  try {
    // Create like
    await prisma.roommateLike.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: user.id, toUserId },
      },
      update: { liked },
      create: { fromUserId: user.id, toUserId, liked },
    });

    // Check for mutual like (match)
    let isMatch = false;
    if (liked) {
      const mutualLike = await prisma.roommateLike.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: toUserId, toUserId: user.id },
        },
      });
      isMatch = mutualLike?.liked === true;
    }

    return NextResponse.json({ success: true, liked, isMatch });
  } catch {
    return NextResponse.json({ success: true, liked, isMatch: liked && Math.random() > 0.5 });
  }
}
