import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text } = body;

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  // TODO: Call AI API for real humanization
  // Mock: add some "human" touches
  const humanized = text
    .replace(/I am writing to express/g, "I'd like to share")
    .replace(/Growing up in/g, "Having grown up in")
    .replace(/I have always been/g, "I've always been")
    .replace(/I believe that/g, "I genuinely feel that")
    .replace(/necessary to achieve/g, "essential for achieving");

  return NextResponse.json({
    original: text,
    humanized,
    wordCount: humanized.split(/\s+/).length,
    status: 'HUMANIZED',
  });
}
