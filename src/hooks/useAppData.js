import { useState, useEffect, useCallback } from 'react';
import { getInitialData } from '../data/initialData';
import { STORAGE_KEY, USER_KEY, DOCUMENT_TYPES, HOLLAND_QUESTIONS, HOLLAND_PROFILES } from '../data/constants';
import { generateLogin, generatePassword, calculateTestResult, genId } from '../data/utils';

export default function useAppData() {
  const [data, setData] = useState(getInitialData);
  // Auth persistence: restore user from localStorage
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({});
  const [testAnswers, setTestAnswers] = useState({});
  const [testQ, setTestQ] = useState(0);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attSchedule, setAttSchedule] = useState(null);
  const [sylSearch, setSylSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentPage, setStudentPage] = useState(null);
  const [calendarMode, setCalendarMode] = useState(false);

  // Persist data
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  // Persist user session
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const upd = useCallback((k, v) => setData(p => ({ ...p, [k]: v })), []);

  // ---- AUTH ----
  const handleLogin = (login, password) => {
    if (login === 'curator' && password === 'curator2024') {
      setUser({ role: 'curator', id: 'c', name: 'Куратор Мария' });
      return null;
    }
    const s = data.students.find(x => x.login === login && x.password === password);
    if (s) { setUser({ role: 'student', ...s }); return null; }
    const t = data.teachers.find(x => x.login === login && x.password === password);
    if (t) { setUser({ role: 'teacher', ...t }); return null; }
    return 'Неверный логин или пароль';
  };

  const logout = () => {
    setUser(null);
    setView('dashboard');
    setModal(null);
    setSelected(null);
    setSearch('');
    setForm({});
    setSidebarOpen(false);
    setStudentPage(null);
  };

  // ---- GETTERS ----
  const getStudent = () => data.students.find(s => s.id === user?.id) || user;
  const getTeacher = () => data.teachers.find(t => t.id === user?.id) || user;

  // ---- STUDENTS CRUD ----
  const addStudent = (d) => {
    const n = {
      id: genId(), ...d,
      joinDate: new Date().toISOString().split('T')[0],
      testResult: null, examResults: [],
      attendance: { total: 0, attended: 0 },
      documents: [{ id: genId(), type: 'contract', name: 'Договор', date: new Date().toISOString().split('T')[0] }],
      letters: [], internships: [], invitations: [],
      packages: d.packages || [],
      tasks: [], comments: [],
      history: [{ date: new Date().toISOString(), text: 'Зачислен в академию', type: 'system' }],
      initialResults: d.initialResults || {},
      status: d.status || 'active',
      city: d.city || '',
      graduationYear: d.graduationYear || null,
    };
    upd('students', [...data.students, n]);
    return n;
  };
  const updStudent = useCallback((id, u) => {
    upd('students', data.students.map(s => s.id === id ? { ...s, ...u } : s));
  }, [data.students, upd]);
  const delStudent = (id) => upd('students', data.students.filter(s => s.id !== id));

  // ---- PACKAGES CRUD ----
  const addPackage = (studentId, pkg) => {
    const newPkg = { id: genId(), ...pkg, completedLessons: 0, missedLessons: 0, currentStage: 1, stageNotes: {}, frozen: false, frozenDays: 0 };
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const packages = [...(student.packages || []), newPkg];
      updStudent(studentId, { packages });
      addHistory(studentId, `Добавлен пакет: ${pkg.type?.toUpperCase()}`);
    }
  };
  const updPackage = (studentId, pkgId, changes) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const packages = (student.packages || []).map(p => p.id === pkgId ? { ...p, ...changes } : p);
      updStudent(studentId, { packages });
    }
  };
  const freezePackage = (studentId, pkgId, freeze) => {
    updPackage(studentId, pkgId, { frozen: freeze });
    addHistory(studentId, freeze ? 'Пакет заморожен' : 'Пакет разморожен');
  };

  // ---- FREEZE STUDENT ----
  const freezeStudent = (studentId, freezeData) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const freezes = [...(student.freezes || []), { id: genId(), ...freezeData, createdAt: new Date().toISOString() }];
      updStudent(studentId, { freezes, status: 'paused' });
      addHistory(studentId, `Студент заморожен: ${freezeData.reason || 'По заявлению'}`);
    }
  };
  const unfreezeStudent = (studentId, freezeId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const freezes = (student.freezes || []).map(f => f.id === freezeId ? { ...f, endDate: new Date().toISOString().split('T')[0], active: false } : f);
      updStudent(studentId, { freezes, status: 'active' });
      addHistory(studentId, 'Студент разморожен');
    }
  };

  // ---- AVATAR ----
  const setAvatar = (role, id, avatarData) => {
    if (role === 'student') updStudent(id, { avatar: avatarData });
    else if (role === 'teacher') updTeacher(id, { avatar: avatarData });
    else if (role === 'curator') {
      // Store curator avatar in data
      upd('curatorAvatar', avatarData);
    }
  };

  // ---- TASKS CRUD ----
  const addTask = (studentId, task) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const newTask = { id: genId(), ...task, done: false, created: new Date().toISOString() };
      updStudent(studentId, { tasks: [...(student.tasks || []), newTask] });
    }
  };
  const toggleTask = (studentId, taskId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      updStudent(studentId, { tasks: (student.tasks || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t) });
    }
  };

  // ---- COMMENTS ----
  const addComment = (studentId, text) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const newComment = { id: genId(), text, author: user?.name || 'Система', date: new Date().toISOString() };
      updStudent(studentId, { comments: [...(student.comments || []), newComment] });
    }
  };

  // ---- HISTORY ----
  const addHistory = (studentId, text, type = 'action') => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      updStudent(studentId, { history: [...(student.history || []), { date: new Date().toISOString(), text, type }] });
    }
  };

  // ---- TEACHERS CRUD ----
  const addTeacher = (d) => {
    const n = { id: genId(), ...d, hoursWorked: 0, totalLessons: 0, lessons: [], syllabus: [] };
    upd('teachers', [...data.teachers, n]);
    return n;
  };
  const updTeacher = (id, u) => upd('teachers', data.teachers.map(t => t.id === id ? { ...t, ...u } : t));
  const delTeacher = (id) => {
    upd('teachers', data.teachers.filter(t => t.id !== id));
    upd('schedule', data.schedule.map(s => s.teacherId === id ? { ...s, teacherId: null } : s));
  };

  // ---- SCHEDULE CRUD ----
  const addSchedule = (d) => { upd('schedule', [...data.schedule, { id: genId(), ...d }]); };
  const updSchedule = (id, u) => upd('schedule', data.schedule.map(s => s.id === id ? { ...s, ...u } : s));
  const delSchedule = (id) => upd('schedule', data.schedule.filter(s => s.id !== id));

  // ---- MOCK TESTS CRUD ----
  const addMockTest = (d) => { upd('mockTests', [...data.mockTests, { id: genId(), ...d }]); };
  const updMockTest = (id, u) => upd('mockTests', data.mockTests.map(t => t.id === id ? { ...t, ...u } : t));
  const delMockTest = (id) => upd('mockTests', data.mockTests.filter(t => t.id !== id));

  // ---- INTERNSHIPS CRUD ----
  const addInternship = (d) => { upd('internships', [...data.internships, { id: genId(), ...d }]); };
  const updInternship = (id, u) => upd('internships', data.internships.map(i => i.id === id ? { ...i, ...u } : i));
  const delInternship = (id) => upd('internships', data.internships.filter(i => i.id !== id));

  // ---- DOCUMENTS ----
  const addDoc = (sid, doc) => {
    const d = { id: genId(), date: new Date().toISOString().split('T')[0], ...doc };
    const student = data.students.find(s => s.id === sid);
    if (student) {
      const documents = [...(student.documents || []), d];
      const updates = { documents };
      if (DOCUMENT_TYPES[doc.type]?.isExam && doc.score) {
        const e = { id: genId(), type: doc.type, name: DOCUMENT_TYPES[doc.type].label, score: doc.score, date: d.date };
        updates.examResults = [...(student.examResults || []), e];
      }
      // If recommendation document, also add to letters
      if (doc.type === 'recommendation') {
        updates.letters = [...(student.letters || []), {
          id: genId(), type: 'recommendation', author: doc.name || 'Куратор',
          subject: '', content: '', status: 'completed',
          fileName: doc.fileName || null, fileData: doc.fileData || null, fileSize: doc.fileSize || null,
          lastEdit: new Date().toISOString().split('T')[0],
        }];
      }
      // Combine history update with doc update to avoid stale closure overwrite
      updates.history = [...(student.history || []), { date: new Date().toISOString(), text: `Загружен документ: ${d.name}`, type: 'action' }];
      updStudent(sid, updates);
    }
  };
  const delDoc = (sid, did) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { documents: (student.documents || []).filter(d => d.id !== did) });
  };

  // ---- LETTERS ----
  const addLetter = (sid, l) => {
    const n = { id: genId(), lastEdit: new Date().toISOString().split('T')[0], ...l };
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: [...(student.letters || []), n] });
  };
  const updLetter = (sid, lid, u) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: (student.letters || []).map(l => l.id === lid ? { ...l, ...u, lastEdit: new Date().toISOString().split('T')[0] } : l) });
  };
  const delLetter = (sid, lid) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: (student.letters || []).filter(l => l.id !== lid) });
  };

  // ---- SYLLABUS ----
  const addSyllabus = (tid, syl) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: [...t.syllabus, { id: genId(), progress: 0, students: [], youtubeLinks: {}, ...syl }] });
  };
  const updSyllabus = (tid, sid, u) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: t.syllabus.map(s => s.id === sid ? { ...s, ...u } : s) });
  };
  const delSyllabus = (tid, sid) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: t.syllabus.filter(s => s.id !== sid) });
  };

  // ---- ATTENDANCE with homework ----
  const markAtt = (schId, stuId, date, status, homework = null) => {
    const k = `${schId}_${date}`;
    const prev = data.attendance[k] || {};
    const entry = { ...(prev[stuId] || {}), status };
    if (homework !== null) entry.homework = homework;
    upd('attendance', { ...data.attendance, [k]: { ...prev, [stuId]: entry } });

    // Auto-deduct: if absent without reason, count as service rendered (missedLessons++)
    if (status === 'absent') {
      const sc = data.schedule.find(s => s.id === schId);
      if (sc) {
        const student = data.students.find(s => s.id === stuId);
        if (student) {
          const pkg = (student.packages || []).find(p => !p.frozen && p.type !== 'support');
          if (pkg) {
            updPackage(stuId, pkg.id, { missedLessons: (pkg.missedLessons || 0) + 1 });
          }
        }
      }
    }
    if (status === 'present') {
      const student = data.students.find(s => s.id === stuId);
      if (student) {
        const pkg = (student.packages || []).find(p => !p.frozen && p.type !== 'support');
        if (pkg) {
          updPackage(stuId, pkg.id, { completedLessons: (pkg.completedLessons || 0) + 1 });
        }
      }
    }
  };

  // ---- LESSON LOG ----
  const addLessonLog = (entry) => {
    upd('lessonLog', [...(data.lessonLog || []), { id: genId(), ...entry, date: entry.date || new Date().toISOString().split('T')[0] }]);
  };

  // ---- LESSONS (teacher) ----
  const markLesson = (tid, lesson) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { lessons: [...t.lessons, { id: genId(), ...lesson, confirmed: false }] });
  };
  const confirmLesson = (tid, lid) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) {
      const lessons = t.lessons.map(l => l.id === lid ? { ...l, confirmed: true } : l);
      const confirmedConducted = lessons.filter(l => l.confirmed && l.status === 'conducted');
      const hrs = confirmedConducted.reduce((s, l) => s + (l.hours || 0), 0);
      updTeacher(tid, { lessons, hoursWorked: hrs, totalLessons: confirmedConducted.length });
    }
  };

  // ---- INTERNSHIP APPLY ----
  const applyInternship = (sid, iid) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { internships: [...(student.internships || []), { internshipId: iid, status: 'applied', appliedDate: new Date().toISOString().split('T')[0] }] });
  };

  // ---- SUPPORT ----
  const resolveTicket = (id) => upd('supportTickets', data.supportTickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  const addTicket = (sid, msg) => {
    const s = data.students.find(x => x.id === sid);
    upd('supportTickets', [...data.supportTickets, {
      id: genId(), studentId: sid, studentName: s?.name || '', message: msg,
      priority: 'normal', created: new Date().toISOString(),
      deadline: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'open'
    }]);
  };

  // ---- CAREER TEST (Holland RIASEC) ----
  const submitTest = () => {
    if (Object.keys(testAnswers).length < HOLLAND_QUESTIONS.length) { alert('Ответьте на все вопросы'); return; }
    const r = calculateTestResult(testAnswers, HOLLAND_QUESTIONS, HOLLAND_PROFILES);
    if (user?.role === 'student') {
      const student = data.students.find(x => x.id === user.id);
      const updates = {
        testResult: r.profileName, testProfile: r.profile,
        testRiasecCode: r.riasecCode, testScores: r.scores, testCareers: r.careers,
        retakeAllowed: false,
        history: [...(student?.history || []), { date: new Date().toISOString(), text: `Пройден тест профориентации: ${r.profileName} (${r.riasecCode})`, type: 'action' }],
      };
      updStudent(user.id, updates);
      setUser(p => ({ ...p, ...updates }));
    }
    setTestAnswers({});
    setTestQ(0);
  };

  const resetTest = () => {
    const s = data.students.find(x => x.id === user?.id);
    if (!s?.retakeAllowed) return;
    updStudent(s.id, { testResult: null, testProfile: null, testRiasecCode: null, testScores: null, testCareers: null, retakeAllowed: false });
    setUser(prev => ({ ...prev, testResult: null, testProfile: null, testRiasecCode: null, testScores: null, testCareers: null, retakeAllowed: false }));
  };

  // ---- RETAKE MANAGEMENT ----
  const requestRetake = (studentId, testType) => {
    const s = data.students.find(x => x.id === studentId);
    if (!s) return;
    if (testType === 'career') updStudent(studentId, { retakeRequested: true });
    else if (testType === 'english') updStudent(studentId, { englishRetakeRequested: true });
  };

  const approveRetake = (studentId, testType) => {
    if (testType === 'career') updStudent(studentId, { retakeAllowed: true, retakeRequested: false });
    else if (testType === 'english') updStudent(studentId, { englishRetakeAllowed: true, englishRetakeRequested: false });
  };

  const denyRetake = (studentId, testType) => {
    if (testType === 'career') updStudent(studentId, { retakeRequested: false });
    else if (testType === 'english') updStudent(studentId, { englishRetakeRequested: false });
  };

  // ---- ENGLISH TEST ----
  const submitEnglishTest = (studentId, result) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const prevResults = student.englishTestHistory || [];
      updStudent(studentId, {
        englishTestResult: result,
        englishTestHistory: [...prevResults, result],
        history: [...(student.history || []), { date: new Date().toISOString(), text: `Прошел тест на знание английского: ${result.levelName} (${result.score}/${result.total})`, type: 'action' }],
      });
    }
  };

  const resetEnglishTest = (studentId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student && student.englishRetakeAllowed) {
      updStudent(studentId, { englishTestResult: null, englishRetakeAllowed: false });
    }
  };

  // ---- GLOBAL TASKS (Bitrix-style) ----
  const addGlobalTask = (task) => {
    const newTask = { id: genId(), ...task };
    upd('globalTasks', [...(data.globalTasks || []), newTask]);
  };
  const toggleGlobalTask = (taskId) => {
    upd('globalTasks', (data.globalTasks || []).map(t => t.id === taskId ? { ...t, done: !t.done, doneDate: !t.done ? new Date().toISOString() : null } : t));
  };
  const deleteGlobalTask = (taskId) => {
    upd('globalTasks', (data.globalTasks || []).filter(t => t.id !== taskId));
  };

  return {
    // State
    data, user, view, modal, selected, search, form,
    testAnswers, testQ, attDate, attSchedule, sylSearch,
    sidebarOpen, cityFilter, statusFilter, studentPage, calendarMode,
    // Setters
    setView, setModal, setSelected, setSearch, setForm,
    setTestAnswers, setTestQ, setAttDate, setAttSchedule, setSylSearch,
    setSidebarOpen, setCityFilter, setStatusFilter, setStudentPage, setCalendarMode,
    // Auth
    handleLogin, logout, setUser,
    // Getters
    getStudent, getTeacher,
    // CRUD
    addStudent, updStudent, delStudent,
    addTeacher, updTeacher, delTeacher,
    addSchedule, updSchedule, delSchedule,
    addMockTest, updMockTest, delMockTest,
    addInternship, updInternship, delInternship,
    addDoc, delDoc,
    addLetter, updLetter, delLetter,
    addSyllabus, updSyllabus, delSyllabus,
    markAtt, markLesson, confirmLesson,
    applyInternship, resolveTicket, addTicket,
    submitTest, resetTest,
    requestRetake, approveRetake, denyRetake,
    // New v3
    addPackage, updPackage, freezePackage,
    addTask, toggleTask,
    addComment, addHistory, addLessonLog,
    freezeStudent, unfreezeStudent, setAvatar,
    // English test
    submitEnglishTest, resetEnglishTest,
    // Global tasks (Bitrix-style)
    addGlobalTask, toggleGlobalTask, deleteGlobalTask,
    // Helpers
    generateLogin, generatePassword,
  };
}
