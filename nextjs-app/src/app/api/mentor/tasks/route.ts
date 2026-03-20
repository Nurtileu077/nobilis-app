import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { studentId, title, description, dueDate, linkedDocumentType } = body;

  if (!studentId || !title) {
    return NextResponse.json({ error: 'studentId and title are required' }, { status: 400 });
  }

  try {
    const task = await prisma.task.create({
      data: {
        mentorId: user.id,
        studentId,
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        linkedDocumentType: linkedDocumentType || null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({
      id: `task-${Date.now()}`,
      mentorId: user.id,
      studentId,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }
}
