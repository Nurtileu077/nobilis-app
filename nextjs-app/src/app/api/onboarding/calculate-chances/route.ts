import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { countries, gpa, englishLevel, ieltsScore, budget } = body;

  if (!countries || !gpa) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Mock AI chance calculation
  const gpaScore = (gpa / 4) * 50;
  const ieltsNum = ieltsScore || 6.0;
  const ieltsPercent = (ieltsNum / 9) * 40;
  const chance = Math.min(95, Math.round(gpaScore + ieltsPercent + 5));

  // Mock university matching
  const matchedUniversities = [
    {
      id: 'uni-1',
      name: 'University of Toronto',
      country: 'Canada',
      ranking: 21,
      tuition: 'CA$25,000/year',
      match: Math.min(98, chance + 5),
      scholarship: true,
    },
    {
      id: 'uni-2',
      name: 'Karlsruhe Institute of Technology',
      country: 'Germany',
      ranking: 120,
      tuition: '€1,500/year',
      match: Math.min(95, chance + 8),
      scholarship: false,
    },
    {
      id: 'uni-3',
      name: 'Korea University',
      country: 'South Korea',
      ranking: 74,
      tuition: '$8,000/year',
      match: Math.min(92, chance + 3),
      scholarship: true,
    },
    {
      id: 'uni-4',
      name: 'University of Arizona',
      country: 'USA',
      ranking: 99,
      tuition: '$28,000/year',
      match: chance,
      scholarship: true,
    },
    {
      id: 'uni-5',
      name: 'Masaryk University',
      country: 'Czech Republic',
      ranking: 400,
      tuition: '€0/year',
      match: Math.min(99, chance + 12),
      scholarship: false,
    },
  ].sort((a, b) => b.match - a.match);

  return NextResponse.json({
    chance,
    matchedUniversities,
    profile: { countries, gpa, englishLevel, ieltsScore, budget },
  });
}
