import type {
  User, StudentProfile, Application, Document, Essay,
  Task, Message, Invoice, University, CoinTransaction,
  UserProgress, OnboardingData, Consultation,
  UserRole, ApplicationStatus, DocumentType, DocumentStatus,
} from '@/types';

describe('Types', () => {
  it('should define valid User type', () => {
    const user: User = {
      id: '1',
      email: 'test@nobilis.kz',
      name: 'Test User',
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(user.role).toBe('STUDENT');
    expect(user.email).toContain('@');
  });

  it('should define valid StudentProfile type', () => {
    const profile: StudentProfile = {
      id: '1',
      userId: 'user-1',
      gpa: 3.5,
      englishLevel: 'B2',
      ieltsScore: 7.0,
      budget: 30000,
      selectedCountries: ['usa', 'canada'],
      dreamUniversities: ['UofT'],
      targetYear: 2025,
      interests: ['CS', 'AI'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(profile.gpa).toBeGreaterThanOrEqual(0);
    expect(profile.gpa).toBeLessThanOrEqual(4);
    expect(profile.selectedCountries).toHaveLength(2);
  });

  it('should define valid Application statuses', () => {
    const statuses: ApplicationStatus[] = [
      'GATHERING_DOCS', 'SUBMITTED', 'UNDER_REVIEW',
      'INTERVIEW', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED',
    ];
    expect(statuses).toHaveLength(7);
  });

  it('should define valid Application type', () => {
    const app: Application = {
      id: '1',
      studentId: 'student-1',
      universityId: 'uni-1',
      universityName: 'UofT',
      program: 'CS',
      status: 'SUBMITTED',
      deadline: '2025-03-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(app.status).toBe('SUBMITTED');
  });

  it('should define valid Document types', () => {
    const types: DocumentType[] = [
      'PASSPORT', 'IELTS', 'SAT', 'TRANSCRIPT', 'ESSAY', 'RECOMMENDATION', 'FINANCIAL', 'OTHER',
    ];
    expect(types).toHaveLength(8);
  });

  it('should define valid CoinTransaction type', () => {
    const tx: CoinTransaction = {
      id: '1',
      userId: 'user-1',
      action: 'EARN',
      amount: 50,
      reason: 'Quiz completed',
      balanceAfter: 500,
      createdAt: new Date().toISOString(),
    };
    expect(tx.action).toBe('EARN');
    expect(tx.amount).toBeGreaterThan(0);
  });

  it('should define valid University type', () => {
    const uni: University = {
      id: '1',
      name: 'University of Toronto',
      country: 'Canada',
      city: 'Toronto',
      ranking: 21,
      tuitionMin: 25000,
      tuitionMax: 45000,
      gpaRequirement: 3.5,
      ieltsRequirement: 6.5,
      faculties: ['CS', 'Engineering'],
      scholarshipAvailable: true,
    };
    expect(uni.tuitionMin).toBeLessThanOrEqual(uni.tuitionMax);
  });

  it('should define all UserRole values', () => {
    const roles: UserRole[] = ['GUEST', 'STUDENT', 'MENTOR', 'PARENT', 'B2B_UNI', 'ADMIN'];
    expect(roles).toHaveLength(6);
  });
});
