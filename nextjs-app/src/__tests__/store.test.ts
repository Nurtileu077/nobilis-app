import { useAppStore } from '@/store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useAppStore.setState({
      user: null,
      profile: null,
      applications: [],
      documents: [],
      tasks: [],
      messages: [],
      coins: 0,
      xp: 0,
      streak: 0,
      lives: 5,
      sidebarOpen: false,
    });
  });

  it('should set user', () => {
    const { setUser } = useAppStore.getState();
    setUser({ id: '1', email: 'test@test.com', name: 'Test', role: 'STUDENT', createdAt: '', updatedAt: '' });
    expect(useAppStore.getState().user?.name).toBe('Test');
  });

  it('should add application', () => {
    const { addApplication } = useAppStore.getState();
    addApplication({
      id: '1',
      studentId: 's1',
      universityId: 'u1',
      universityName: 'UofT',
      program: 'CS',
      status: 'GATHERING_DOCS',
      deadline: '2025-03-15',
      createdAt: '',
      updatedAt: '',
    });
    expect(useAppStore.getState().applications).toHaveLength(1);
  });

  it('should update application status', () => {
    useAppStore.setState({
      applications: [{
        id: '1',
        studentId: 's1',
        universityId: 'u1',
        universityName: 'UofT',
        program: 'CS',
        status: 'GATHERING_DOCS',
        deadline: '2025-03-15',
        createdAt: '',
        updatedAt: '',
      }],
    });

    const { updateApplication } = useAppStore.getState();
    updateApplication('1', { status: 'SUBMITTED' });
    expect(useAppStore.getState().applications[0].status).toBe('SUBMITTED');
  });

  it('should toggle task completion', () => {
    useAppStore.setState({
      tasks: [{
        id: 't1',
        mentorId: 'm1',
        studentId: 's1',
        title: 'Upload transcript',
        description: '',
        completed: false,
        createdAt: '',
        updatedAt: '',
      }],
    });

    const { toggleTask } = useAppStore.getState();
    toggleTask('t1');
    expect(useAppStore.getState().tasks[0].completed).toBe(true);

    toggleTask('t1');
    expect(useAppStore.getState().tasks[0].completed).toBe(false);
  });

  it('should add message', () => {
    const { addMessage } = useAppStore.getState();
    addMessage({
      id: 'm1',
      senderId: 'mentor',
      receiverId: 'student',
      content: 'Hello!',
      read: false,
      createdAt: new Date().toISOString(),
    });
    expect(useAppStore.getState().messages).toHaveLength(1);
  });

  it('should manage coins', () => {
    const { setCoins } = useAppStore.getState();
    setCoins(500);
    expect(useAppStore.getState().coins).toBe(500);
  });

  it('should manage gamification stats', () => {
    const { setXp, setStreak, setLives } = useAppStore.getState();
    setXp(2500);
    setStreak(12);
    setLives(3);
    expect(useAppStore.getState().xp).toBe(2500);
    expect(useAppStore.getState().streak).toBe(12);
    expect(useAppStore.getState().lives).toBe(3);
  });

  it('should toggle sidebar', () => {
    const { toggleSidebar } = useAppStore.getState();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
    toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
    toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });

  it('should add document', () => {
    const { addDocument } = useAppStore.getState();
    addDocument({
      id: 'd1',
      userId: 'u1',
      type: 'PASSPORT',
      name: 'passport.pdf',
      fileUrl: '/files/passport.pdf',
      status: 'UPLOADED',
      createdAt: '',
      updatedAt: '',
    });
    expect(useAppStore.getState().documents).toHaveLength(1);
    expect(useAppStore.getState().documents[0].type).toBe('PASSPORT');
  });
});
