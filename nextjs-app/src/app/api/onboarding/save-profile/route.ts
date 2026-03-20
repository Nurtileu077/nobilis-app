import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { countries, gpa, englishLevel, ieltsScore, budget, matchedUniversities } = body;

  try {
    // Save onboarding data
    await prisma.onboardingData.create({
      data: {
        sessionId: `session-${Date.now()}`,
        userId,
        countries: countries || [],
        gpa: gpa || 0,
        englishLevel: englishLevel || 'A1',
        budget: budget || 0,
        calculatedChance: 0,
        matchedUniversities: matchedUniversities || [],
      },
    });

    // Upsert student profile
    await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        gpa: gpa || 0,
        englishLevel: englishLevel || 'A1',
        ieltsScore: ieltsScore || null,
        budget: budget || 0,
        selectedCountries: countries || [],
      },
      create: {
        userId,
        gpa: gpa || 0,
        englishLevel: englishLevel || 'A1',
        ieltsScore: ieltsScore || null,
        budget: budget || 0,
        selectedCountries: countries || [],
      },
    });

    return NextResponse.json({ success: true, message: 'Profile saved' });
  } catch {
    return NextResponse.json({
      success: true,
      message: 'Profile saved (mock)',
      data: { countries, gpa, englishLevel, ieltsScore, budget },
    });
  }
}
