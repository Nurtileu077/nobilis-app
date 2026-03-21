// === ENUMS ===

export type UserRole = 'GUEST' | 'STUDENT' | 'MENTOR' | 'PARENT' | 'B2B_UNI' | 'ADMIN';

export type ApplicationStatus =
  | 'GATHERING_DOCS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW'
  | 'OFFER_RECEIVED'
  | 'ACCEPTED'
  | 'REJECTED';

export type DocumentType = 'PASSPORT' | 'IELTS' | 'SAT' | 'TRANSCRIPT' | 'ESSAY' | 'RECOMMENDATION' | 'FINANCIAL' | 'OTHER';

export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'WARNING' | 'EXPIRED';

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PrepSkill = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING' | 'MATH';

export type CoinAction = 'EARN' | 'SPEND';

export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

// === MODELS ===

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  gpa: number;
  englishLevel: EnglishLevel;
  ieltsScore?: number;
  satScore?: number;
  budget: number;
  selectedCountries: string[];
  dreamUniversities: string[];
  targetYear: number;
  bio?: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  id: string;
  sessionId: string;
  countries: string[];
  gpa: number;
  englishLevel: EnglishLevel;
  budget: number;
  calculatedChance: number;
  matchedUniversities: string[];
  userId?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  userId: string;
  mentorId: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  universityId: string;
  universityName: string;
  program: string;
  status: ApplicationStatus;
  deadline: string;
  submittedAt?: string;
  responseAt?: string;
  scholarshipAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  applicationId?: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  status: DocumentStatus;
  expiryDate?: string;
  ocrData?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Essay {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  prompt: string;
  draftContent: string;
  aiContent?: string;
  humanizedContent?: string;
  wordCount: number;
  status: 'DRAFT' | 'AI_GENERATED' | 'HUMANIZED' | 'FINAL';
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  skill: PrepSkill;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number; // seconds
}

export interface UserProgress {
  id: string;
  userId: string;
  streak: number;
  lives: number;
  xp: number;
  level: number;
  lastActivity: string;
  skillProgress: Record<PrepSkill, number>;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  action: CoinAction;
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface Task {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  linkedDocumentType?: DocumentType;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  pdfUrl?: string;
  stripeSessionId?: string;
  paidAt?: string;
  dueDate: string;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking?: number;
  tuitionMin: number;
  tuitionMax: number;
  gpaRequirement: number;
  ieltsRequirement: number;
  satRequirement?: number;
  acceptanceRate?: number;
  deadline?: string;
  faculties: string[];
  scholarshipAvailable: boolean;
  photo?: string;
  description?: string;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  university: string;
  city: string;
  bio: string;
  habits: string[];
  budget: number;
  moveInDate: string;
  photos: string[];
}

export interface RoommateLike {
  id: string;
  fromUserId: string;
  toUserId: string;
  liked: boolean;
  createdAt: string;
}
