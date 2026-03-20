import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User, StudentProfile, Application, Document, Task, Message } from '@/types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Student profile
  profile: StudentProfile | null;
  setProfile: (profile: StudentProfile | null) => void;

  // Applications
  applications: Application[];
  setApplications: (apps: Application[]) => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;

  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;

  // Messages
  messages: Message[];
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;

  // Gamification
  coins: number;
  xp: number;
  streak: number;
  lives: number;
  setCoins: (n: number) => void;
  setXp: (n: number) => void;
  setStreak: (n: number) => void;
  setLives: (n: number) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Profile
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Applications
      applications: [],
      setApplications: (applications) => set({ applications }),
      addApplication: (app) => set((s) => ({ applications: [...s.applications, app] })),
      updateApplication: (id, data) =>
        set((s) => ({
          applications: s.applications.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      // Documents
      documents: [],
      setDocuments: (documents) => set({ documents }),
      addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),

      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      // Messages
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

      // Gamification
      coins: 0,
      xp: 0,
      streak: 0,
      lives: 5,
      setCoins: (coins) => set({ coins }),
      setXp: (xp) => set({ xp }),
      setStreak: (streak) => set({ streak }),
      setLives: (lives) => set({ lives }),

      // UI
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'nobilis-store' }
  )
);
