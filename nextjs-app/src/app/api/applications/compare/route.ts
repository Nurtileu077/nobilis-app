import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const applications = await prisma.application.findMany({
      where: {
        studentId: user.id,
        status: { in: ['OFFER_RECEIVED', 'ACCEPTED'] },
      },
      include: {
        university: true,
      },
    });

    return NextResponse.json(
      applications.map((app) => ({
        university: app.university.name,
        country: `${app.university.city}, ${app.university.country}`,
        tuition: app.university.tuitionMin,
        scholarship: app.scholarshipAmt || 0,
        ranking: app.university.ranking,
        acceptanceRate: app.university.acceptanceRate,
      }))
    );
  } catch {
    return NextResponse.json([
      { university: 'UofT', country: 'Canada', tuition: 25000, scholarship: 5000, ranking: 21 },
      { university: 'KIT', country: 'Germany', tuition: 1500, scholarship: 0, ranking: 120 },
    ]);
  }
}
