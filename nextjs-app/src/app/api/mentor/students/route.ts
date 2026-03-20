import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Replace with Prisma + auth
  return NextResponse.json([
    { id: '1', name: 'Алия Нурланова', status: 'on_track', applications: 4, pendingTasks: 1 },
    { id: '2', name: 'Дамир Касымов', status: 'at_risk', applications: 3, pendingTasks: 4 },
    { id: '3', name: 'Айгерим Бекова', status: 'active', applications: 5, pendingTasks: 2 },
  ]);
}
