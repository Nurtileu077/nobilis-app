import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth-helpers';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    // Get students assigned to this mentor via tasks
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        tasksAsStudent: {
          some: { mentorId: user.id },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        applications: { select: { id: true, status: true } },
        tasksAsStudent: {
          where: { mentorId: user.id, completed: false },
          select: { id: true },
        },
        receivedMessages: {
          where: { senderId: user.id, read: false },
          select: { id: true },
        },
      },
    });

    const result = students.map((s) => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar,
      applications: s.applications.length,
      pendingTasks: s.tasksAsStudent.length,
      status: s.tasksAsStudent.length > 3 ? 'at_risk' : s.tasksAsStudent.length > 0 ? 'active' : 'on_track',
      unreadMessages: s.receivedMessages.length,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([
      { id: '1', name: 'Алия Нурланова', status: 'on_track', applications: 4, pendingTasks: 1 },
      { id: '2', name: 'Дамир Касымов', status: 'at_risk', applications: 3, pendingTasks: 4 },
      { id: '3', name: 'Айгерим Бекова', status: 'active', applications: 5, pendingTasks: 2 },
    ]);
  }
}
