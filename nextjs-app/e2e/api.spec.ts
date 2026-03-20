import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  test('POST /api/onboarding/calculate-chances', async ({ request }) => {
    const response = await request.post('/api/onboarding/calculate-chances', {
      data: {
        countries: ['usa', 'canada'],
        gpa: 3.5,
        englishLevel: 'B2',
        ieltsScore: 7.0,
        budget: 30000,
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.chance).toBeGreaterThan(0);
    expect(data.chance).toBeLessThanOrEqual(95);
    expect(data.matchedUniversities).toBeDefined();
    expect(data.matchedUniversities.length).toBeGreaterThan(0);
  });

  test('POST /api/onboarding/calculate-chances — validation', async ({ request }) => {
    const response = await request.post('/api/onboarding/calculate-chances', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/consultations/book', async ({ request }) => {
    const response = await request.post('/api/consultations/book', {
      data: { date: '2025-03-20', time: '14:00', name: 'Test', email: 'test@test.com' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.consultation.status).toBe('BOOKED');
  });

  test('POST /api/consultations/book — validation', async ({ request }) => {
    const response = await request.post('/api/consultations/book', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('GET /api/applications', async ({ request }) => {
    const response = await request.get('/api/applications');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('POST /api/applications', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: { universityId: 'uni-1', program: 'CS', deadline: '2025-06-01' },
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.status).toBe('GATHERING_DOCS');
  });

  test('POST /api/applications — validation', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('GET /api/prep/questions', async ({ request }) => {
    const response = await request.get('/api/prep/questions?skill=READING&limit=2');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].question).toBeDefined();
    expect(data[0].options).toBeDefined();
  });

  test('GET /api/coins', async ({ request }) => {
    const response = await request.get('/api/coins');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.balance).toBeDefined();
    expect(data.history).toBeDefined();
  });

  test('POST /api/coins — earn', async ({ request }) => {
    const response = await request.post('/api/coins', {
      data: { action: 'EARN', amount: 50, reason: 'Test earn' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/coins — validation', async ({ request }) => {
    const response = await request.post('/api/coins', {
      data: { action: 'INVALID' },
    });
    expect(response.status()).toBe(400);
  });

  test('GET /api/mentor/students', async ({ request }) => {
    const response = await request.get('/api/mentor/students');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('POST /api/mentor/tasks', async ({ request }) => {
    const response = await request.post('/api/mentor/tasks', {
      data: { studentId: 's1', title: 'Upload IELTS cert', description: 'Need by Friday' },
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.completed).toBe(false);
  });

  test('POST /api/mentor/tasks — validation', async ({ request }) => {
    const response = await request.post('/api/mentor/tasks', {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test('GET /api/roommate/cards', async ({ request }) => {
    const response = await request.get('/api/roommate/cards');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/roommate/like', async ({ request }) => {
    const response = await request.post('/api/roommate/like', {
      data: { toUserId: 'user-2', liked: true },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('GET /api/payments/invoices', async ({ request }) => {
    const response = await request.get('/api/payments/invoices');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/invite/parent', async ({ request }) => {
    const response = await request.post('/api/invite/parent', {
      data: { studentId: 'student-1' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.inviteUrl).toBeDefined();
    expect(data.token).toBeDefined();
  });

  test('GET /api/scout/students', async ({ request }) => {
    const response = await request.get('/api/scout/students');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/scout/invite', async ({ request }) => {
    const response = await request.post('/api/scout/invite', {
      data: { studentId: 'S-001', universityId: 'uni-1', message: 'We want you!' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/ai/generate-essay', async ({ request }) => {
    const response = await request.post('/api/ai/generate-essay', {
      data: { prompt: 'My passion for CS', university: 'UofT', program: 'Computer Science' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.essay).toBeDefined();
    expect(data.wordCount).toBeGreaterThan(0);
    expect(data.status).toBe('AI_GENERATED');
  });

  test('POST /api/ai/humanize', async ({ request }) => {
    const response = await request.post('/api/ai/humanize', {
      data: { text: 'I am writing to express my interest. I believe that this is great.' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.humanized).toBeDefined();
    expect(data.humanized).not.toContain('I am writing to express');
    expect(data.status).toBe('HUMANIZED');
  });
});
