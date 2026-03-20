import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: '1', name: 'Дана К.', age: 19, university: 'University of Toronto', city: 'Торонто', bio: 'CS student', habits: ['Early riser', 'Sports'], budget: 800 },
    { id: '2', name: 'Алишер М.', age: 20, university: 'KIT Karlsruhe', city: 'Карлсруэ', bio: 'Mechatronics', habits: ['Night owl', 'Music'], budget: 500 },
  ]);
}
