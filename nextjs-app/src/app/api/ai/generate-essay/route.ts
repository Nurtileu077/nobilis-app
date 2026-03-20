import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, university, program, audioTranscript } = body;

  if (!prompt && !audioTranscript) {
    return NextResponse.json({ error: 'prompt or audioTranscript required' }, { status: 400 });
  }

  // TODO: Call OpenAI/Anthropic API for real essay generation
  // For now return mock SSE-style response
  const mockEssay = `Dear Admissions Committee,

I am writing to express my strong interest in the ${program || 'Computer Science'} program at ${university || 'your university'}. Growing up in Kazakhstan, I have always been fascinated by technology's potential to solve real-world problems.

${prompt ? `Drawing from my experience: ${prompt}` : ''}

My academic journey has been marked by consistent dedication and curiosity. With a GPA that reflects my commitment to excellence, I have actively sought opportunities to expand my knowledge beyond the classroom.

I believe that studying at your institution will provide me with the tools and environment necessary to achieve my goals of making a meaningful contribution to the field of technology.

Thank you for considering my application.`;

  return NextResponse.json({
    essay: mockEssay,
    wordCount: mockEssay.split(/\s+/).length,
    status: 'AI_GENERATED',
  });
}
