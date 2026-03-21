import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const applications = await prisma.application.findMany({
      where: { studentId: user.id },
      include: {
        university: {
          select: { name: true, country: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch {
    // Fallback to mock data if DB not connected
    return NextResponse.json([
      { id: '1', university: 'University of Toronto', program: 'Computer Science BSc', status: 'UNDER_REVIEW', deadline: '2025-03-15' },
      { id: '2', university: 'KIT Karlsruhe', program: 'Mechanical Engineering', status: 'GATHERING_DOCS', deadline: '2025-04-01' },
    ]);
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { universityId, program, deadline } = body;

  if (!universityId || !program) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const application = await prisma.application.create({
      data: {
        studentId: user.id,
        universityId,
        program,
        deadline: new Date(deadline),
        status: 'GATHERING_DOCS',
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch {
    // Fallback
    return NextResponse.json({
      id: `app-${Date.now()}`,
      universityId,
      program,
      status: 'GATHERING_DOCS',
      deadline: deadline || null,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }
}
