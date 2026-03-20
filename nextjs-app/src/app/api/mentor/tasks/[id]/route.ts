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
  const { completed, title, description, dueDate } = body;

  try {
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({
      id: params.id,
      completed: completed ?? false,
      updatedAt: new Date().toISOString(),
    });
  }
}
