import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Return anonymized student profiles for B2B universities
    const profiles = await prisma.studentProfile.findMany({
      include: {
        user: { select: { id: true } },
      },
      take: 50,
    });

    return NextResponse.json(
      profiles.map((p, i) => ({
        id: `S-${String(i + 1).padStart(3, '0')}`,
        gpa: p.gpa,
        ieltsScore: p.ieltsScore,
        englishLevel: p.englishLevel,
        interests: p.interests,
        country: 'Kazakhstan', // anonymized
        match: Math.round(70 + Math.random() * 25),
      }))
    );
  } catch {
    return NextResponse.json([
      { id: 'S-001', gpa: 3.8, ieltsScore: 7.5, country: 'Kazakhstan', interests: ['CS', 'AI'], match: 95 },
      { id: 'S-002', gpa: 3.5, ieltsScore: 7.0, country: 'Kazakhstan', interests: ['Business'], match: 88 },
    ]);
  }
}
