import { renderHook, act } from '@testing-library/react';
import useAppData from '../hooks/useAppData';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('useAppData', () => {
  // ---- AUTH ----
  describe('Authentication', () => {
    it('starts with no user logged in', () => {
      const { result } = renderHook(() => useAppData());
      expect(result.current.user).toBeNull();
    });

    it('logs in as curator with correct credentials', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        const error = result.current.handleLogin('curator', 'curator2024');
        expect(error).toBeNull();
      });
      expect(result.current.user).toEqual({ role: 'curator', id: 'c', name: 'Куратор Мария' });
    });

    it('logs in as student with correct credentials', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        const error = result.current.handleLogin('alexey.pet47', 'Nobilis2024!');
        expect(error).toBeNull();
      });
      expect(result.current.user.role).toBe('student');
      expect(result.current.user.name).toBe('Алексей Петров');
    });

    it('logs in as teacher with correct credentials', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        const error = result.current.handleLogin('smirnova.ann', 'Teacher2024!');
        expect(error).toBeNull();
      });
      expect(result.current.user.role).toBe('teacher');
      expect(result.current.user.name).toBe('Смирнова Анна Владимировна');
    });

    it('returns error for invalid credentials', () => {
      const { result } = renderHook(() => useAppData());
      let error;
      act(() => {
        error = result.current.handleLogin('wrong', 'wrong');
      });
      expect(error).toBe('Неверный логин или пароль');
      expect(result.current.user).toBeNull();
    });

    it('resets state on logout', () => {
      const { result } = renderHook(() => useAppData());
      act(() => { result.current.handleLogin('curator', 'curator2024'); });
      expect(result.current.user).not.toBeNull();

      act(() => { result.current.setView('students'); });
      act(() => { result.current.logout(); });

      expect(result.current.user).toBeNull();
      expect(result.current.view).toBe('dashboard');
      expect(result.current.modal).toBeNull();
      expect(result.current.search).toBe('');
    });
  });

  // ---- INITIAL DATA ----
  describe('Initial Data', () => {
    it('loads initial data with students', () => {
      const { result } = renderHook(() => useAppData());
      expect(result.current.data.students).toHaveLength(4);
    });

    it('loads initial data with teachers', () => {
      const { result } = renderHook(() => useAppData());
      expect(result.current.data.teachers).toHaveLength(3);
    });

    it('loads initial data with schedule', () => {
      const { result } = renderHook(() => useAppData());
      expect(result.current.data.schedule).toHaveLength(5);
    });

    it('persists data to localStorage', () => {
      renderHook(() => useAppData());
      expect(localStorageMock.setItem).toHaveBeenCalledWith('nobilis_v3', expect.any(String));
    });
  });

  // ---- STUDENT CRUD ----
  describe('Student CRUD', () => {
    it('adds a new student', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addStudent({ name: 'Новый Студент', login: 'new.stu', password: 'pass123' });
      });
      expect(result.current.data.students).toHaveLength(5);
      const newStudent = result.current.data.students[4];
      expect(newStudent.name).toBe('Новый Студент');
      expect(newStudent.testResult).toBeNull();
      expect(newStudent.examResults).toEqual([]);
    });

    it('updates a student', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updStudent('1', { name: 'Алексей Обновлённый' });
      });
      expect(result.current.data.students.find(s => s.id === '1').name).toBe('Алексей Обновлённый');
    });

    it('deletes a student', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delStudent('3');
      });
      expect(result.current.data.students).toHaveLength(3);
      expect(result.current.data.students.find(s => s.id === '3')).toBeUndefined();
    });
  });

  // ---- TEACHER CRUD ----
  describe('Teacher CRUD', () => {
    it('adds a new teacher', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addTeacher({ name: 'Новый Учитель', subject: 'Физика', login: 'new.tch', password: 'pass' });
      });
      expect(result.current.data.teachers).toHaveLength(4);
    });

    it('updates a teacher', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updTeacher('1', { subject: 'Английский Advanced' });
      });
      expect(result.current.data.teachers.find(t => t.id === '1').subject).toBe('Английский Advanced');
    });

    it('deletes a teacher and clears schedule references', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delTeacher('3');
      });
      expect(result.current.data.teachers).toHaveLength(2);
      // Schedule items that referenced teacher 3 should have null teacherId
      const affectedSchedule = result.current.data.schedule.find(s => s.id === '4');
      expect(affectedSchedule.teacherId).toBeNull();
    });
  });

  // ---- SCHEDULE CRUD ----
  describe('Schedule CRUD', () => {
    it('adds a schedule item', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addSchedule({ subject: 'Новый предмет', day: 'Понедельник', time: '10:00', room: '101' });
      });
      expect(result.current.data.schedule).toHaveLength(6);
    });

    it('updates a schedule item', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updSchedule('1', { room: '305' });
      });
      expect(result.current.data.schedule.find(s => s.id === '1').room).toBe('305');
    });

    it('deletes a schedule item', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delSchedule('5');
      });
      expect(result.current.data.schedule).toHaveLength(4);
    });
  });

  // ---- DOCUMENTS ----
  describe('Documents', () => {
    it('adds a document to a student', () => {
      const { result } = renderHook(() => useAppData());
      const initialDocCount = result.current.data.students.find(s => s.id === '1').documents.length;
      act(() => {
        result.current.addDoc('1', { type: 'passport', name: 'Паспорт' });
      });
      const docs = result.current.data.students.find(s => s.id === '1').documents;
      expect(docs).toHaveLength(initialDocCount + 1);
      expect(docs[docs.length - 1].type).toBe('passport');
    });

    it('adds exam result when document is exam type with score', () => {
      const { result } = renderHook(() => useAppData());
      const initialExamCount = result.current.data.students.find(s => s.id === '1').examResults.length;
      act(() => {
        result.current.addDoc('1', { type: 'ielts', name: 'IELTS 2025', score: '8.0' });
      });
      const examResults = result.current.data.students.find(s => s.id === '1').examResults;
      expect(examResults).toHaveLength(initialExamCount + 1);
    });

    it('deletes a document', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delDoc('1', 'd1');
      });
      const docs = result.current.data.students.find(s => s.id === '1').documents;
      expect(docs.find(d => d.id === 'd1')).toBeUndefined();
    });
  });

  // ---- LETTERS ----
  describe('Letters', () => {
    it('adds a letter to a student', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addLetter('1', { type: 'motivation', university: 'Stanford', content: 'Test', status: 'draft' });
      });
      const letters = result.current.data.students.find(s => s.id === '1').letters;
      expect(letters).toHaveLength(2);
    });

    it('updates a letter', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updLetter('1', 'l1', { status: 'completed' });
      });
      const letter = result.current.data.students.find(s => s.id === '1').letters.find(l => l.id === 'l1');
      expect(letter.status).toBe('completed');
    });

    it('deletes a letter', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delLetter('1', 'l1');
      });
      const letters = result.current.data.students.find(s => s.id === '1').letters;
      expect(letters).toHaveLength(0);
    });
  });

  // ---- SUPPORT TICKETS ----
  describe('Support Tickets', () => {
    it('resolves a ticket', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.resolveTicket('1');
      });
      expect(result.current.data.supportTickets[0].status).toBe('resolved');
    });

    it('adds a new ticket', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addTicket('1', 'Нужна помощь');
      });
      expect(result.current.data.supportTickets).toHaveLength(2);
      expect(result.current.data.supportTickets[1].message).toBe('Нужна помощь');
      expect(result.current.data.supportTickets[1].status).toBe('open');
    });
  });

  // ---- MOCK TESTS ----
  describe('Mock Tests', () => {
    it('adds a mock test', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addMockTest({ type: 'toefl', name: 'Пробный TOEFL', date: '2025-02-01', room: '301' });
      });
      expect(result.current.data.mockTests).toHaveLength(3);
    });

    it('updates a mock test', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updMockTest('1', { room: '400' });
      });
      expect(result.current.data.mockTests.find(t => t.id === '1').room).toBe('400');
    });

    it('deletes a mock test', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delMockTest('2');
      });
      expect(result.current.data.mockTests).toHaveLength(1);
    });
  });

  // ---- INTERNSHIPS ----
  describe('Internships', () => {
    it('adds an internship', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addInternship({ name: 'New Internship', country: 'Япония' });
      });
      expect(result.current.data.internships).toHaveLength(4);
    });

    it('applies for an internship', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.applyInternship('3', '2');
      });
      const student = result.current.data.students.find(s => s.id === '3');
      expect(student.internships).toHaveLength(1);
      expect(student.internships[0].internshipId).toBe('2');
      expect(student.internships[0].status).toBe('applied');
    });
  });

  // ---- SYLLABUS ----
  describe('Syllabus', () => {
    it('adds a syllabus entry to a teacher', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.addSyllabus('1', { course: 'New Course', weeks: 8, topics: ['A', 'B'] });
      });
      const teacher = result.current.data.teachers.find(t => t.id === '1');
      expect(teacher.syllabus).toHaveLength(2);
    });

    it('updates a syllabus entry', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.updSyllabus('1', 's1', { progress: 100 });
      });
      const teacher = result.current.data.teachers.find(t => t.id === '1');
      expect(teacher.syllabus[0].progress).toBe(100);
    });

    it('deletes a syllabus entry', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.delSyllabus('1', 's1');
      });
      const teacher = result.current.data.teachers.find(t => t.id === '1');
      expect(teacher.syllabus).toHaveLength(0);
    });
  });

  // ---- ATTENDANCE ----
  describe('Attendance', () => {
    it('marks attendance for a student', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.markAtt('1', '1', '2025-01-10', 'present');
      });
      expect(result.current.data.attendance['1_2025-01-10']['1'].status).toBe('present');
    });

    it('marks multiple students for same schedule/date', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.markAtt('1', '1', '2025-01-10', 'present');
      });
      act(() => {
        result.current.markAtt('1', '2', '2025-01-10', 'absent');
      });
      expect(result.current.data.attendance['1_2025-01-10']['1'].status).toBe('present');
      expect(result.current.data.attendance['1_2025-01-10']['2'].status).toBe('absent');
    });
  });

  // ---- LESSONS ----
  describe('Lessons', () => {
    it('marks a lesson for a teacher', () => {
      const { result } = renderHook(() => useAppData());
      act(() => {
        result.current.markLesson('1', { date: '2025-01-15', status: 'conducted', hours: 1.5, scheduleId: '1' });
      });
      const teacher = result.current.data.teachers.find(t => t.id === '1');
      expect(teacher.lessons).toHaveLength(3);
      expect(teacher.lessons[2].confirmed).toBe(false);
    });

    it('confirms a lesson and updates hours/count', () => {
      const { result } = renderHook(() => useAppData());
      // teacher 1 has lesson tl2 that is cancelled and unconfirmed
      act(() => {
        result.current.confirmLesson('1', 'tl2');
      });
      const teacher = result.current.data.teachers.find(t => t.id === '1');
      const lesson = teacher.lessons.find(l => l.id === 'tl2');
      expect(lesson.confirmed).toBe(true);
    });
  });

  // ---- STATE MANAGEMENT ----
  describe('State Management', () => {
    it('setView changes the view', () => {
      const { result } = renderHook(() => useAppData());
      act(() => { result.current.setView('schedule'); });
      expect(result.current.view).toBe('schedule');
    });

    it('setModal changes the modal', () => {
      const { result } = renderHook(() => useAppData());
      act(() => { result.current.setModal('addStudent'); });
      expect(result.current.modal).toBe('addStudent');
    });

    it('setSearch changes the search query', () => {
      const { result } = renderHook(() => useAppData());
      act(() => { result.current.setSearch('Алексей'); });
      expect(result.current.search).toBe('Алексей');
    });

    it('setForm changes the form state', () => {
      const { result } = renderHook(() => useAppData());
      act(() => { result.current.setForm({ name: 'Test' }); });
      expect(result.current.form).toEqual({ name: 'Test' });
    });
  });

  // ---- HELPERS ----
  describe('Helpers', () => {
    it('provides generateLogin helper', () => {
      const { result } = renderHook(() => useAppData());
      expect(typeof result.current.generateLogin).toBe('function');
      const login = result.current.generateLogin('Тест Юзер');
      expect(login).toMatch(/^test\./);
    });

    it('provides generatePassword helper', () => {
      const { result } = renderHook(() => useAppData());
      expect(typeof result.current.generatePassword).toBe('function');
      const password = result.current.generatePassword();
      expect(password).toHaveLength(12);
    });
  });
});
