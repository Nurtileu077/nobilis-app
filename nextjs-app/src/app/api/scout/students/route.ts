import { NextResponse } from 'next/server';

export async function GET() {
  // Anonymized student profiles for B2B universities
  return NextResponse.json([
    { id: 'S-001', gpa: 3.8, ieltsScore: 7.5, country: 'Kazakhstan', interests: ['CS', 'AI'], match: 95 },
    { id: 'S-002', gpa: 3.5, ieltsScore: 7.0, country: 'Kazakhstan', interests: ['Business'], match: 88 },
  ]);
}
