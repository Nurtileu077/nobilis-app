import { NextRequest, NextResponse } from 'next/server';

// GET /api/applications — list student applications
export async function GET() {
  // TODO: Replace with Prisma query
  const applications = [
    { id: '1', university: 'University of Toronto', program: 'Computer Science BSc', status: 'UNDER_REVIEW', deadline: '2025-03-15' },
    { id: '2', university: 'KIT Karlsruhe', program: 'Mechanical Engineering', status: 'GATHERING_DOCS', deadline: '2025-04-01' },
  ];
  return NextResponse.json(applications);
}

// POST /api/applications — create new application
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { universityId, program, deadline } = body;

  if (!universityId || !program) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const application = {
    id: `app-${Date.now()}`,
    universityId,
    program,
    status: 'GATHERING_DOCS',
    deadline: deadline || null,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(application, { status: 201 });
}
