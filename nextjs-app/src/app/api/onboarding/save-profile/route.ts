import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { countries, gpa, englishLevel, ieltsScore, budget, matchedUniversities } = body;

  // TODO: Save to Prisma when DB is connected
  // await prisma.onboardingData.create({ data: { ... } });
  // await prisma.studentProfile.upsert({ ... });

  return NextResponse.json({
    success: true,
    message: 'Profile saved',
    data: { countries, gpa, englishLevel, ieltsScore, budget, matchedUniversities },
  });
}
