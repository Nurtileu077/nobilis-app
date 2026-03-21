import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId: user.id },
    });

    if (!progress) {
      return NextResponse.json({
        streak: 0,
        lives: 5,
        xp: 0,
        level: 1,
        skillProgress: {},
      });
    }

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({
      streak: 0,
      lives: 5,
      xp: 0,
      level: 1,
      skillProgress: {},
    });
  }
}
