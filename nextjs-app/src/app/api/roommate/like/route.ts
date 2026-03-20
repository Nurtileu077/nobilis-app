import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { toUserId, liked } = body;

  if (!toUserId || liked === undefined) {
    return NextResponse.json({ error: 'toUserId and liked are required' }, { status: 400 });
  }

  // TODO: Prisma — check for mutual like → match
  const isMatch = liked && Math.random() > 0.5;

  return NextResponse.json({ success: true, liked, isMatch });
}
