import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, title, description, dueDate } = body;

  if (!studentId || !title) {
    return NextResponse.json({ error: 'studentId and title are required' }, { status: 400 });
  }

  const task = {
    id: `task-${Date.now()}`,
    mentorId: 'current-mentor',
    studentId,
    title,
    description: description || '',
    completed: false,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(task, { status: 201 });
}
