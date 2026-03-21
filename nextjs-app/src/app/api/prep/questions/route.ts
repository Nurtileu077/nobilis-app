import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get('skill') || 'READING';
  const limit = parseInt(searchParams.get('limit') || '5');

  // TODO: Replace with Prisma query
  const questions = [
    {
      id: '1',
      skill,
      difficulty: 'MEDIUM',
      question: 'Choose the correct word: She _____ to the store every day.',
      options: ['go', 'goes', 'going', 'gone'],
      correctAnswer: 1,
      explanation: 'Third person singular requires "goes".',
      timeLimit: 30,
    },
    {
      id: '2',
      skill,
      difficulty: 'EASY',
      question: 'The synonym of "happy" is:',
      options: ['Sad', 'Joyful', 'Angry', 'Tired'],
      correctAnswer: 1,
      explanation: '"Joyful" means feeling or expressing great happiness.',
      timeLimit: 20,
    },
  ].slice(0, limit);

  return NextResponse.json(questions);
}
