import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { status, notes, scholarshipAmt } = body;

  try {
    const application = await prisma.application.update({
      where: { id: params.id, studentId: user.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(scholarshipAmt !== undefined && { scholarshipAmt }),
        ...(status === 'SUBMITTED' && { submittedAt: new Date() }),
      },
    });

    return NextResponse.json(application);
  } catch {
    return NextResponse.json({
      id: params.id,
      status: status || 'GATHERING_DOCS',
      updatedAt: new Date().toISOString(),
    });
  }
}
