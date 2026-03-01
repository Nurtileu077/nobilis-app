import { useState, useEffect, useCallback } from 'react';
import { getInitialData } from '../data/initialData';
import { STORAGE_KEY, DOCUMENT_TYPES, GALLUP_QUESTIONS, CAREER_PROFILES } from '../data/constants';
import { generateLogin, generatePassword, calculateTestResult } from '../data/utils';

export default function useAppData() {
  const [data, setData] = useState(getInitialData);
  const [user, setUser] = useState(null);
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

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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
  };

  // ---- GETTERS ----
  const getStudent = () => data.students.find(s => s.id === user?.id) || user;
  const getTeacher = () => data.teachers.find(t => t.id === user?.id) || user;

  // ---- STUDENTS CRUD ----
  const addStudent = (d) => {
    const n = {
      id: Date.now().toString(), ...d,
      joinDate: new Date().toISOString().split('T')[0],
      testResult: null, examResults: [],
      attendance: { total: 0, attended: 0 },
      packages: d.packages || [],
      freeze: null,
      avatar: null,
      documents: [{ id: Date.now().toString(), type: 'contract', name: 'Договор', date: new Date().toISOString().split('T')[0] }],
      letters: [], internships: []
    };
    upd('students', [...data.students, n]);
    return n;
  };
  const updStudent = (id, u) => upd('students', data.students.map(s => s.id === id ? { ...s, ...u } : s));
  const delStudent = (id) => upd('students', data.students.filter(s => s.id !== id));

  // ---- PACKAGES ----
  const addPackage = (studentId, pkg) => {
    const s = data.students.find(x => x.id === studentId);
    if (s) {
      const newPkg = { id: Date.now().toString(), ...pkg, completedLessons: 0 };
      updStudent(studentId, { packages: [...(s.packages || []), newPkg] });
    }
  };
  const removePackage = (studentId, pkgId) => {
    const s = data.students.find(x => x.id === studentId);
    if (s) updStudent(studentId, { packages: (s.packages || []).filter(p => p.id !== pkgId) });
  };

  // ---- FREEZE ----
  const freezeStudent = (studentId, freezeData) => {
    updStudent(studentId, { freeze: { ...freezeData, createdAt: new Date().toISOString() } });
  };
  const unfreezeStudent = (studentId) => {
    updStudent(studentId, { freeze: null });
  };

  // ---- AVATAR ----
  const setAvatar = (role, id, avatarData) => {
    if (role === 'student') updStudent(id, { avatar: avatarData });
    else if (role === 'teacher') updTeacher(id, { avatar: avatarData });
  };

  // ---- TEACHERS CRUD ----
  const addTeacher = (d) => {
    const n = { id: Date.now().toString(), ...d, hoursWorked: 0, totalLessons: 0, lessons: [], syllabus: [], avatar: null };
    upd('teachers', [...data.teachers, n]);
    return n;
  };
  const updTeacher = (id, u) => upd('teachers', data.teachers.map(t => t.id === id ? { ...t, ...u } : t));
  const delTeacher = (id) => {
    upd('teachers', data.teachers.filter(t => t.id !== id));
    upd('schedule', data.schedule.map(s => s.teacherId === id ? { ...s, teacherId: null } : s));
  };

  // ---- SCHEDULE CRUD ----
  const addSchedule = (d) => { upd('schedule', [...data.schedule, { id: Date.now().toString(), ...d }]); };
  const updSchedule = (id, u) => upd('schedule', data.schedule.map(s => s.id === id ? { ...s, ...u } : s));
  const delSchedule = (id) => upd('schedule', data.schedule.filter(s => s.id !== id));

  // ---- MOCK TESTS CRUD ----
  const addMockTest = (d) => { upd('mockTests', [...data.mockTests, { id: Date.now().toString(), ...d }]); };
  const updMockTest = (id, u) => upd('mockTests', data.mockTests.map(t => t.id === id ? { ...t, ...u } : t));
  const delMockTest = (id) => upd('mockTests', data.mockTests.filter(t => t.id !== id));

  // ---- INTERNSHIPS CRUD ----
  const addInternship = (d) => { upd('internships', [...data.internships, { id: Date.now().toString(), ...d }]); };
  const updInternship = (id, u) => upd('internships', data.internships.map(i => i.id === id ? { ...i, ...u } : i));
  const delInternship = (id) => upd('internships', data.internships.filter(i => i.id !== id));

  // ---- DOCUMENTS ----
  const addDoc = (sid, doc) => {
    const d = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...doc };
    upd('students', data.students.map(s => s.id === sid ? { ...s, documents: [...s.documents, d] } : s));
    if (DOCUMENT_TYPES[doc.type]?.isExam && doc.score) {
      const e = { id: (Date.now() + 1).toString(), type: doc.type, name: DOCUMENT_TYPES[doc.type].label, score: doc.score, date: d.date };
      upd('students', data.students.map(s => s.id === sid ? { ...s, examResults: [...s.examResults, e] } : s));
    }
  };
  const delDoc = (sid, did) => upd('students', data.students.map(s => s.id === sid ? { ...s, documents: s.documents.filter(d => d.id !== did) } : s));

  // ---- LETTERS ----
  const addLetter = (sid, l) => {
    const n = { id: Date.now().toString(), lastEdit: new Date().toISOString().split('T')[0], ...l };
    upd('students', data.students.map(s => s.id === sid ? { ...s, letters: [...s.letters, n] } : s));
  };
  const updLetter = (sid, lid, u) =>
    upd('students', data.students.map(s => s.id === sid ? { ...s, letters: s.letters.map(l => l.id === lid ? { ...l, ...u, lastEdit: new Date().toISOString().split('T')[0] } : l) } : s));
  const delLetter = (sid, lid) =>
    upd('students', data.students.map(s => s.id === sid ? { ...s, letters: s.letters.filter(l => l.id !== lid) } : s));

  // ---- SYLLABUS ----
  const addSyllabus = (tid, syl) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: [...t.syllabus, { id: Date.now().toString(), progress: 0, students: [], ...syl }] });
  };
  const updSyllabus = (tid, sid, u) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: t.syllabus.map(s => s.id === sid ? { ...s, ...u } : s) });
  };
  const delSyllabus = (tid, sid) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: t.syllabus.filter(s => s.id !== sid) });
  };

  // ---- ATTENDANCE ----
  const markAtt = (schId, stuId, date, status) => {
    const k = `${schId}_${date}`;
    upd('attendance', { ...data.attendance, [k]: { ...(data.attendance[k] || {}), [stuId]: status } });
  };

  // ---- LESSONS ----
  const markLesson = (tid, lesson) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { lessons: [...t.lessons, { id: Date.now().toString(), ...lesson, confirmed: false }] });
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
  const updLesson = (tid, lid, updates) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { lessons: t.lessons.map(l => l.id === lid ? { ...l, ...updates } : l) });
  };

  // ---- INTERNSHIP APPLY ----
  const applyInternship = (sid, iid) =>
    upd('students', data.students.map(s => s.id === sid ? { ...s, internships: [...s.internships, { internshipId: iid, status: 'applied', appliedDate: new Date().toISOString().split('T')[0] }] } : s));

  // ---- SUPPORT ----
  const resolveTicket = (id) => upd('supportTickets', data.supportTickets.map(t => t.id === id ? { ...t, status: 'resolved', resolvedDate: new Date().toISOString() } : t));
  const addTicket = (sid, msg) => {
    const s = data.students.find(x => x.id === sid);
    upd('supportTickets', [...data.supportTickets, {
      id: Date.now().toString(), studentId: sid, studentName: s?.name || '', message: msg,
      priority: 'normal', created: new Date().toISOString(),
      deadline: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'open'
    }]);
  };

  // ---- CAREER TEST ----
  const submitTest = () => {
    if (Object.keys(testAnswers).length < 20) { alert('Ответьте на все вопросы'); return; }
    const r = calculateTestResult(testAnswers, GALLUP_QUESTIONS, CAREER_PROFILES);
    if (user?.role === 'student') {
      updStudent(user.id, { testResult: r.profile, testScores: r.scores });
      setUser(p => ({ ...p, testResult: r.profile, testScores: r.scores }));
    }
    setTestAnswers({});
    setTestQ(0);
    setView('results');
  };

  const resetTest = () => {
    const s = getStudent();
    updStudent(s.id, { testResult: null, testScores: null });
    setUser(prev => ({ ...prev, testResult: null, testScores: null }));
  };

  return {
    // State
    data, user, view, modal, selected, search, form,
    testAnswers, testQ, attDate, attSchedule, sylSearch,
    // Setters
    setView, setModal, setSelected, setSearch, setForm,
    setTestAnswers, setTestQ, setAttDate, setAttSchedule, setSylSearch,
    // Auth
    handleLogin, logout,
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
    markAtt, markLesson, confirmLesson, updLesson,
    applyInternship, resolveTicket, addTicket,
    submitTest, resetTest,
    // Packages
    addPackage, removePackage,
    // Freeze
    freezeStudent, unfreezeStudent,
    // Avatar
    setAvatar,
    // Helpers
    generateLogin, generatePassword,
  };
}
