import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Find mutual likes
    const myLikes = await prisma.roommateLike.findMany({
      where: { fromUserId: user.id, liked: true },
      select: { toUserId: true },
    });

    const likedUserIds = myLikes.map((l) => l.toUserId);

    const matches = await prisma.roommateLike.findMany({
      where: {
        fromUserId: { in: likedUserIds },
        toUserId: user.id,
        liked: true,
      },
      include: {
        fromUser: {
          select: { id: true, name: true, avatar: true },
          include: { roommateProfile: true },
        },
      },
    });

    return NextResponse.json(
      matches.map((m) => ({
        userId: m.fromUser.id,
        name: m.fromUser.name,
        avatar: m.fromUser.avatar,
        profile: m.fromUser.roommateProfile,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
