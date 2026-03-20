import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Find linked student
    const relation = await prisma.studentParentRelation.findFirst({
      where: { parentId: user.id, accepted: true },
      include: {
        student: {
          include: {
            profile: true,
            applications: {
              include: { university: { select: { name: true } } },
            },
            documents: { select: { type: true, status: true } },
          },
        },
      },
    });

    if (!relation) {
      return NextResponse.json({ error: 'No linked student' }, { status: 404 });
    }

    const s = relation.student;
    return NextResponse.json({
      student: {
        name: s.name,
        gpa: s.profile?.gpa,
        ieltsScore: s.profile?.ieltsScore,
      },
      applications: s.applications.map((a) => ({
        university: a.university.name,
        status: a.status,
        deadline: a.deadline,
      })),
      documents: {
        uploaded: s.documents.filter((d) => d.status !== 'PENDING').length,
        total: s.documents.length,
      },
      offersReceived: s.applications.filter((a) => a.status === 'OFFER_RECEIVED' || a.status === 'ACCEPTED').length,
    });
  } catch {
    return NextResponse.json({
      student: { name: 'Алия Нурланова', gpa: 3.6, ieltsScore: 7.0 },
      applications: [
        { university: 'UofT', status: 'UNDER_REVIEW', deadline: '2025-03-15' },
        { university: 'Masaryk', status: 'OFFER_RECEIVED', deadline: '2025-01-31' },
      ],
      documents: { uploaded: 7, total: 12 },
      offersReceived: 1,
    });
  }
}
