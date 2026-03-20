import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Get roommate profiles excluding current user and already liked
    const likedIds = (await prisma.roommateLike.findMany({
      where: { fromUserId: user.id },
      select: { toUserId: true },
    })).map((l) => l.toUserId);

    const profiles = await prisma.roommateProfile.findMany({
      where: {
        userId: { notIn: [user.id, ...likedIds] },
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      take: 20,
    });

    return NextResponse.json(
      profiles.map((p) => ({
        id: p.userId,
        name: p.user.name,
        photo: p.user.avatar || '🧑‍🎓',
        university: p.university,
        city: p.city,
        bio: p.bio,
        habits: p.habits,
        budget: p.budget,
      }))
    );
  } catch {
    return NextResponse.json([
      { id: '1', name: 'Дана К.', university: 'University of Toronto', city: 'Торонто', bio: 'CS student', habits: ['Early riser', 'Sports'], budget: 800 },
      { id: '2', name: 'Алишер М.', university: 'KIT Karlsruhe', city: 'Карлсруэ', bio: 'Mechatronics', habits: ['Night owl', 'Music'], budget: 500 },
    ]);
  }
}
