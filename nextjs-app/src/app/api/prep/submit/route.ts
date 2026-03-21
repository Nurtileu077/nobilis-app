import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { answers, skill } = body;

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
  }

  const correctCount = answers.filter((a: any) => a.correct).length;
  const totalQuestions = answers.length;
  const xpEarned = correctCount * 25;
  const coinsEarned = correctCount === totalQuestions ? 20 : correctCount * 5;

  try {
    // Update user progress
    const progress = await prisma.userProgress.upsert({
      where: { userId: user.id },
      update: {
        xp: { increment: xpEarned },
        lastActivity: new Date(),
      },
      create: {
        userId: user.id,
        xp: xpEarned,
        streak: 1,
        lives: 5,
        level: 1,
        lastActivity: new Date(),
      },
    });

    // Log coin transaction
    if (coinsEarned > 0) {
      await prisma.coinTransaction.create({
        data: {
          userId: user.id,
          action: 'EARN',
          amount: coinsEarned,
          reason: `Quiz ${skill}: ${correctCount}/${totalQuestions} correct`,
          balanceAfter: 0, // TODO: calculate real balance
        },
      });
    }

    return NextResponse.json({
      score: correctCount,
      total: totalQuestions,
      xpEarned,
      coinsEarned,
      progress,
    });
  } catch {
    return NextResponse.json({
      score: correctCount,
      total: totalQuestions,
      xpEarned,
      coinsEarned,
    });
  }
}
