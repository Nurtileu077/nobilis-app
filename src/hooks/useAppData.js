import { useState, useEffect, useCallback, useRef } from 'react';
import { SUPABASE_CONFIGURED, supabase, subscribeToTables } from '../lib/supabase';
import {
  studentsAPI, packagesAPI, scheduleAPI, attendanceAPI,
  documentsAPI, examResultsAPI, mockTestsAPI, internshipsAPI,
  lettersAPI, chatAPI, paymentsAPI, tasksAPI, leadsAPI,
  historyAPI, supportAPI, profilesAPI, syllabusAPI, teacherLessonsAPI,
} from '../lib/api';
import { getInitialData } from '../data/initialData';
import { STORAGE_KEY, USER_KEY, DOCUMENT_TYPES, HOLLAND_QUESTIONS, HOLLAND_PROFILES } from '../data/constants';
import { generateLogin, generatePassword, calculateTestResult, genId } from '../data/utils';

// Fallback mode when Supabase is not configured
const USE_LOCAL = !SUPABASE_CONFIGURED;

export default function useAppData() {
  // ----- DATA STATE -----
  const [data, setData] = useState(() => {
    if (USE_LOCAL) return getInitialData();
    return {
      students: [], teachers: [], schedule: [], mockTests: [], internships: [],
      supportTickets: [], attendance: {}, lessonLog: [],
      chatMessages: {}, payments: {}, globalTasks: [], leads: [], meetings: [],
      calls: [], integrations: {}, salesTeam: [],
    };
  });

  const [syncStatus, setSyncStatus] = useState(USE_LOCAL ? 'synced' : 'loading');
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  // ----- UI STATE -----
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
  const [managerFilter, setManagerFilter] = useState('');
  const [studentPage, setStudentPage] = useState(null);
  const [calendarMode, setCalendarMode] = useState(false);

  const initialLoadDone = useRef(false);
  const saveTimer = useRef(null);

  // =============================================
  // DATA LOADING FROM SUPABASE
  // =============================================

  const loadAllData = useCallback(async () => {
    if (USE_LOCAL) return;
    setSyncStatus('loading');
    try {
      const [
        studentsRaw, scheduleData, mockTestsData, internshipsData,
        tasksData, leadsData, chatMessages, teacherProfiles,
      ] = await Promise.all([
        studentsAPI.getAll(),
        scheduleAPI.getAll(),
        mockTestsAPI.getAll(),
        internshipsAPI.getAll(),
        tasksAPI.getAll(),
        leadsAPI.getAll(),
        chatAPI.getAllChats(),
        profilesAPI.getByRole('teacher'),
      ]);

      // Transform students to match expected shape (flatten nested relations)
      const students = studentsRaw.map(s => ({
        id: s.id,
        profileId: s.profile_id,
        contractNo: s.contract_no,
        name: s.profile?.name || '',
        login: s.profile?.login || '',
        email: s.profile?.email || '',
        phone: s.profile?.phone || '',
        avatar: s.profile?.avatar || null,
        parentName: s.parent_name,
        parentPhone: s.parent_phone,
        city: s.city,
        grade: s.grade,
        age: s.age,
        status: s.status || 'active',
        graduationYear: s.graduation_year,
        joinDate: s.join_date,
        contractEndDate: s.contract_end_date,
        manager: s.manager,
        conditions: s.conditions,
        studyPeriod: s.study_period,
        totalContractSum: parseFloat(s.total_contract_sum) || 0,
        paidAmount: parseFloat(s.paid_amount) || 0,
        paymentType: s.payment_type,
        paymentConditions: s.payment_conditions,
        bitrixLink: s.bitrix_link,
        targetIelts: s.target_ielts,
        targetSat: s.target_sat,
        selectedCountries: s.selected_countries || [],
        targetUniversities: s.target_universities || [],
        deadlines: s.deadlines || {},
        initialResults: s.initial_results || {},
        testResult: s.test_result,
        testScores: s.test_scores,
        englishTestResult: s.english_test_result,
        // Nested relations
        packages: (s.packages || []).map(p => ({
          id: p.id, type: p.type, startDate: p.start_date, endDate: p.end_date,
          totalLessons: p.total_lessons, completedLessons: p.completed_lessons,
          missedLessons: p.missed_lessons, currentStage: p.current_stage,
          stageNotes: p.stage_notes || {}, frozen: p.frozen, frozenDays: p.frozen_days,
        })),
        documents: (s.documents || []).map(d => ({
          id: d.id, type: d.type, name: d.name, fileName: d.file_name,
          fileUrl: d.file_url, fileSize: d.file_size, score: d.score, date: d.date,
        })),
        examResults: (s.exam_results || []).map(e => ({
          id: e.id, type: e.type, score: e.score, date: e.date, details: e.details,
        })),
        letters: (s.letters || []).map(l => ({
          id: l.id, type: l.type, university: l.university, author: l.author,
          subject: l.subject, content: l.content, status: l.status,
          fileName: l.file_name, fileUrl: l.file_url,
          lastEdit: l.updated_at,
        })),
        // These will be loaded separately or from student_history
        internships: [],
        invitations: [],
        tasks: [],
        comments: [],
        history: [],
        attendance: { total: 0, attended: 0 },
        freezes: [],
      }));

      // Transform teachers
      const teachers = teacherProfiles.map(t => ({
        id: t.id,
        name: t.name,
        login: t.login,
        email: t.email,
        phone: t.phone,
        avatar: t.avatar,
        role: 'teacher',
        department: t.department,
        hoursWorked: 0,
        totalLessons: 0,
        lessons: [],
        syllabus: [],
        hourlyRate: 0,
      }));

      // Transform chat messages to match expected format
      const chatMsgs = {};
      Object.entries(chatMessages).forEach(([chatId, msgs]) => {
        chatMsgs[chatId] = msgs.map(m => ({
          id: m.id,
          from: m.from_user_id,
          fromName: m.from_name,
          text: m.message,
          timestamp: m.created_at,
          read: m.read,
        }));
      });

      // Transform schedule
      const schedule = scheduleData.map(s => ({
        id: s.id, subject: s.subject, teacherId: s.teacher_id,
        teacherName: s.teacher?.name || '', day: s.day,
        time: s.time, duration: s.duration, room: s.room,
        format: s.format, meetLink: s.meet_link, isCurator: s.is_curator,
        studentIds: s.student_ids || [],
      }));

      // Transform mock tests
      const mockTests = mockTestsData.map(mt => ({
        id: mt.id, name: mt.name, type: mt.type, date: mt.date,
        time: mt.time, room: mt.room, studentIds: mt.student_ids || [],
      }));

      // Transform tasks to globalTasks format
      const globalTasks = tasksData.map(t => ({
        id: t.id, title: t.title, description: t.description,
        assignedTo: t.assigned_to, assignedBy: t.assigned_by,
        priority: t.priority, status: t.status, dueDate: t.due_date,
        department: t.department, done: t.done,
        created: t.created_at,
      }));

      setData(prev => ({
        ...prev,
        students, teachers, schedule, mockTests, internships: internshipsData,
        globalTasks, leads: leadsData, chatMessages: chatMsgs,
      }));

      setSyncStatus('synced');
      initialLoadDone.current = true;
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
      setSyncStatus('error');
      // Fallback to localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setData(JSON.parse(saved)); } catch { /* ignore */ }
      }
      initialLoadDone.current = true;
    }
  }, []);

  // Load data on mount (if user already logged in from localStorage) or after login
  useEffect(() => {
    if (USE_LOCAL) {
      initialLoadDone.current = true;
      return;
    }
    // Only load from Supabase when we have a user (session exists)
    if (user) {
      loadAllData();
    }
  }, [loadAllData, user]);

  // =============================================
  // REALTIME SUBSCRIPTIONS
  // =============================================

  useEffect(() => {
    if (USE_LOCAL) return;
    const unsub = subscribeToTables(
      ['chat_messages', 'tasks', 'attendance', 'payments', 'students', 'schedule'],
      (table, payload) => {
        // Refresh relevant data when changes are detected
        if (table === 'chat_messages') {
          chatAPI.getAllChats().then(chatMessages => {
            const chatMsgs = {};
            Object.entries(chatMessages).forEach(([chatId, msgs]) => {
              chatMsgs[chatId] = msgs.map(m => ({
                id: m.id, from: m.from_user_id, fromName: m.from_name,
                text: m.message, timestamp: m.created_at, read: m.read,
              }));
            });
            setData(prev => ({ ...prev, chatMessages: chatMsgs }));
          }).catch(console.error);
        } else if (table === 'tasks') {
          tasksAPI.getAll().then(tasksData => {
            const globalTasks = tasksData.map(t => ({
              id: t.id, title: t.title, description: t.description,
              assignedTo: t.assigned_to, assignedBy: t.assigned_by,
              priority: t.priority, status: t.status, dueDate: t.due_date,
              department: t.department, done: t.done, created: t.created_at,
            }));
            setData(prev => ({ ...prev, globalTasks }));
          }).catch(console.error);
        } else {
          // For other tables, trigger a full refresh (debounced)
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => loadAllData(), 1000);
        }
      }
    );
    return unsub;
  }, [loadAllData]);

  // =============================================
  // LOCAL FALLBACK PERSISTENCE
  // =============================================

  useEffect(() => {
    if (!USE_LOCAL) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota exceeded */ }
  }, [data]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  const upd = useCallback((k, v) => setData(p => ({ ...p, [k]: v })), []);

  // =============================================
  // AUTH
  // =============================================

  // Local fallback login (when Supabase not configured or DB not seeded)
  const STAFF_ACCOUNTS = [
    { login: 'aruzhan', password: 'Nob2024ar!', role: 'director', id: 'dir0', name: 'Аружан' },
    { login: 'nurtileu', password: 'Nobilis2024!', role: 'director', id: 'dir1', name: 'Нуртилеу' },
    { login: 'saltanat', password: 'Nobilis2024@', role: 'academic_director', id: 'ad1', name: 'Салтанат' },
    { login: 'sultan.curator', password: 'Nob2024sc!', role: 'curator', id: 'cur1', name: 'Султан куратор' },
    { login: 'dias', password: 'Nob2024di!', role: 'coordinator', id: 'co1', name: 'Диас' },
    { login: 'madiyar', password: 'Nobilis2024#', role: 'rop', id: 'rop1', name: 'Мадияр' },
    { login: 'darina', password: 'Nob2024dk!', role: 'callcenter', id: 'cc1', name: 'Дарина КЦ' },
    { login: 'erasyl', password: 'Nob2024er!', role: 'callcenter', id: 'cc2', name: 'Ерасыл Кц' },
    { login: 'kamila', password: 'Nob2024km!', role: 'office_manager', id: 'om1', name: 'Камила' },
    { login: 'gulzhakhan', password: 'Nob2024gz!', role: 'accountant', id: 'acc1', name: 'Гульжахан' },
    { login: 'director', password: 'director2024', role: 'director', id: 'dir1', name: 'Нуртилеу' },
    { login: 'rop', password: 'rop2024', role: 'rop', id: 'rop1', name: 'Мадияр' },
  ];

  const handleLocalLogin = (login, password) => {
    const staff = STAFF_ACCOUNTS.find(a => a.login === login && a.password === password);
    if (staff) { setUser({ role: staff.role, id: staff.id, name: staff.name }); return null; }

    // Use current data, or load initial data if arrays are empty (Supabase configured but DB not seeded)
    let students = data.students;
    let teachers = data.teachers;
    if (students.length === 0 && teachers.length === 0) {
      const initial = getInitialData();
      students = initial.students;
      teachers = initial.teachers;
      // Also populate app data so the user has data after login
      setData(prev => ({ ...prev, students: initial.students, teachers: initial.teachers, schedule: initial.schedule, mockTests: initial.mockTests, internships: initial.internships, attendance: initial.attendance, chatMessages: initial.chatMessages, payments: initial.payments, globalTasks: initial.globalTasks, leads: initial.leads }));
    }

    const s = students.find(x => x.login === login && x.password === password);
    if (s) { setUser({ role: 'student', ...s }); return null; }
    const t = teachers.find(x => x.login === login && x.password === password);
    if (t) { setUser({ role: 'teacher', ...t }); return null; }
    return 'Неверный логин или пароль';
  };

  const handleLogin = useCallback(async (login, password) => {
    if (USE_LOCAL) {
      // Fallback local auth for demo
      return handleLocalLogin(login, password);
    }

    try {
      // Find email by login (without is_active filter — it may be null for valid users)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('email, id, name, role, login, phone')
        .eq('login', login)
        .single();

      if (profileErr || !profile?.email) {
        // Try signing in directly with login as email (in case login IS the email)
        const { data: directAuth, error: directErr } = await supabase.auth.signInWithPassword({
          email: login,
          password,
        });

        if (!directErr && directAuth?.user) {
          // Fetch profile by auth user id
          const { data: authProfile } = await supabase
            .from('profiles')
            .select('id, name, role, login, phone, email')
            .eq('id', directAuth.user.id)
            .single();

          if (authProfile) {
            setUser({ role: authProfile.role, id: authProfile.id, name: authProfile.name, login: authProfile.login || login, email: authProfile.email });
            loadAllData();
            return null;
          }

          setUser({ role: 'student', id: directAuth.user.id, name: directAuth.user.email, login, email: directAuth.user.email });
          loadAllData();
          return null;
        }

        // Supabase DB not seeded or RLS blocking — fall back to local auth
        return handleLocalLogin(login, password);
      }

      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (authErr) {
        return 'Неверный логин или пароль';
      }

      setUser({ role: profile.role, id: profile.id, name: profile.name, login: profile.login, email: profile.email, phone: profile.phone });

      // Reload data for the new session (RLS will filter by user)
      loadAllData();

      return null;
    } catch (err) {
      // Network or other error — fall back to local auth
      return handleLocalLogin(login, password);
    }
  }, [loadAllData]);

  const logout = useCallback(async () => {
    if (!USE_LOCAL) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setView('dashboard');
    setModal(null);
    setSelected(null);
    setSearch('');
    setForm({});
    setSidebarOpen(false);
    setStudentPage(null);
  }, []);

  // =============================================
  // GETTERS
  // =============================================

  const getStudent = () => data.students.find(s => s.id === user?.id || s.profileId === user?.id) || user;
  const getTeacher = () => data.teachers.find(t => t.id === user?.id) || user;

  // =============================================
  // STUDENTS CRUD (Supabase + local state)
  // =============================================

  const addStudent = useCallback(async (d) => {
    if (USE_LOCAL) {
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
    }

    try {
      // Create profile first
      const login = d.login || generateLogin(d.name);
      const password = d.password || generatePassword();

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: d.email || `${login}@nobilis.kz`,
        password,
        options: { data: { name: d.name, role: 'student', login } },
      });
      if (authErr) throw authErr;

      // Create profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          login,
          name: d.name,
          email: d.email || `${login}@nobilis.kz`,
          phone: d.phone || null,
          role: 'student',
        }, { onConflict: 'id' })
        .select()
        .single();
      if (profileErr) throw profileErr;

      // Create student record
      const studentRecord = await studentsAPI.create({
        profile_id: profile.id,
        contract_no: d.contractNo || null,
        parent_name: d.parentName || null,
        parent_phone: d.parentPhone || null,
        city: d.city || null,
        grade: d.grade || null,
        age: d.age || null,
        status: d.status || 'active',
        graduation_year: d.graduationYear || null,
        manager: d.manager || null,
        conditions: d.conditions || null,
        study_period: d.studyPeriod || null,
        total_contract_sum: d.totalContractSum || 0,
        paid_amount: d.paidAmount || 0,
        payment_type: d.paymentType || null,
        target_ielts: d.targetIelts || null,
        target_sat: d.targetSat || null,
        selected_countries: d.selectedCountries || [],
        target_universities: d.targetUniversities || [],
      });

      // Create packages
      if (d.packages?.length) {
        await Promise.all(d.packages.map(pkg =>
          packagesAPI.create({
            student_id: studentRecord.id,
            type: pkg.type,
            start_date: pkg.startDate || new Date().toISOString().split('T')[0],
            total_lessons: pkg.totalLessons || 0,
          })
        ));
      }

      // Add history entry
      await historyAPI.add(studentRecord.id, 'Зачислен в академию', 'system');

      // Reload data to get fresh state
      await loadAllData();
      return studentRecord;
    } catch (err) {
      console.error('Failed to add student:', err);
      throw err;
    }
  }, [data.students, upd, loadAllData]);

  const updStudent = useCallback(async (id, u) => {
    // Optimistic update locally
    setData(p => ({
      ...p,
      students: p.students.map(s => s.id === id ? { ...s, ...u } : s),
    }));

    if (!USE_LOCAL) {
      try {
        // Map camelCase to snake_case for DB fields
        const dbUpdates = {};
        const fieldMap = {
          status: 'status', city: 'city', grade: 'grade', age: 'age',
          parentName: 'parent_name', parentPhone: 'parent_phone',
          manager: 'manager', conditions: 'conditions',
          totalContractSum: 'total_contract_sum', paidAmount: 'paid_amount',
          paymentType: 'payment_type', paymentConditions: 'payment_conditions',
          targetIelts: 'target_ielts', targetSat: 'target_sat',
          selectedCountries: 'selected_countries', targetUniversities: 'target_universities',
          deadlines: 'deadlines', initialResults: 'initial_results',
          testResult: 'test_result', testScores: 'test_scores',
          englishTestResult: 'english_test_result', graduationYear: 'graduation_year',
          contractEndDate: 'contract_end_date', studyPeriod: 'study_period',
          bitrixLink: 'bitrix_link',
        };
        for (const [key, val] of Object.entries(u)) {
          if (fieldMap[key]) dbUpdates[fieldMap[key]] = val;
        }
        if (Object.keys(dbUpdates).length > 0) {
          await studentsAPI.update(id, dbUpdates);
        }
      } catch (err) {
        console.error('Failed to update student in Supabase:', err);
      }
    }
  }, []);

  const delStudent = useCallback(async (id) => {
    upd('students', data.students.filter(s => s.id !== id));
    if (!USE_LOCAL) {
      try { await studentsAPI.delete(id); } catch (err) { console.error(err); }
    }
  }, [data.students, upd]);

  // =============================================
  // PACKAGES
  // =============================================

  const addPackage = useCallback(async (studentId, pkg) => {
    const newPkg = { id: genId(), ...pkg, completedLessons: 0, missedLessons: 0, currentStage: 1, stageNotes: {}, frozen: false, frozenDays: 0 };

    // Local update
    setData(p => ({
      ...p,
      students: p.students.map(s =>
        s.id === studentId ? { ...s, packages: [...(s.packages || []), newPkg] } : s
      ),
    }));

    if (!USE_LOCAL) {
      try {
        const created = await packagesAPI.create({
          student_id: studentId,
          type: pkg.type,
          start_date: pkg.startDate || new Date().toISOString().split('T')[0],
          end_date: pkg.endDate || null,
          total_lessons: pkg.totalLessons || 0,
        });
        // Update local ID with real ID
        setData(p => ({
          ...p,
          students: p.students.map(s =>
            s.id === studentId ? {
              ...s,
              packages: s.packages.map(p2 => p2.id === newPkg.id ? { ...p2, id: created.id } : p2),
            } : s
          ),
        }));
        await historyAPI.add(studentId, `Добавлен пакет: ${pkg.type?.toUpperCase()}`);
      } catch (err) { console.error(err); }
    }
  }, []);

  const updPackage = useCallback(async (studentId, pkgId, changes) => {
    setData(p => ({
      ...p,
      students: p.students.map(s =>
        s.id === studentId ? {
          ...s,
          packages: (s.packages || []).map(pkg => pkg.id === pkgId ? { ...pkg, ...changes } : pkg),
        } : s
      ),
    }));

    if (!USE_LOCAL) {
      try {
        const dbChanges = {};
        const map = {
          completedLessons: 'completed_lessons', missedLessons: 'missed_lessons',
          currentStage: 'current_stage', stageNotes: 'stage_notes',
          frozen: 'frozen', frozenDays: 'frozen_days',
          totalLessons: 'total_lessons', startDate: 'start_date', endDate: 'end_date',
        };
        for (const [k, v] of Object.entries(changes)) {
          if (map[k]) dbChanges[map[k]] = v;
        }
        if (Object.keys(dbChanges).length) await packagesAPI.update(pkgId, dbChanges);
      } catch (err) { console.error(err); }
    }
  }, []);

  const freezePackage = useCallback((studentId, pkgId, freeze) => {
    updPackage(studentId, pkgId, { frozen: freeze });
  }, [updPackage]);

  // =============================================
  // FREEZE STUDENT
  // =============================================

  const freezeStudent = useCallback((studentId, freezeData) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const freezes = [...(student.freezes || []), { id: genId(), ...freezeData, createdAt: new Date().toISOString() }];
      updStudent(studentId, { freezes, status: 'paused' });
    }
  }, [data.students, updStudent]);

  const unfreezeStudent = useCallback((studentId, freezeId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const freezes = (student.freezes || []).map(f =>
        f.id === freezeId ? { ...f, endDate: new Date().toISOString().split('T')[0], active: false } : f
      );
      updStudent(studentId, { freezes, status: 'active' });
    }
  }, [data.students, updStudent]);

  // =============================================
  // AVATAR
  // =============================================

  const setAvatar = useCallback(async (role, id, avatarData) => {
    if (role === 'student') updStudent(id, { avatar: avatarData });
    else if (role === 'teacher') updTeacher(id, { avatar: avatarData });
    else if (role === 'curator') upd('curatorAvatar', avatarData);

    if (!USE_LOCAL && avatarData && typeof avatarData !== 'string') {
      // If it's a File, upload to storage
      try {
        const { url } = await import('../lib/supabase').then(m => m.storage.uploadAvatar(id, avatarData));
        if (role === 'student') updStudent(id, { avatar: url });
        else if (role === 'teacher') updTeacher(id, { avatar: url });
      } catch (err) { console.error(err); }
    }
  }, [updStudent, upd]);

  // =============================================
  // TASKS
  // =============================================

  const addTask = useCallback((studentId, task) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const newTask = { id: genId(), ...task, done: false, created: new Date().toISOString() };
      updStudent(studentId, { tasks: [...(student.tasks || []), newTask] });
    }
  }, [data.students, updStudent]);

  const toggleTask = useCallback((studentId, taskId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      updStudent(studentId, { tasks: (student.tasks || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t) });
    }
  }, [data.students, updStudent]);

  // =============================================
  // COMMENTS & HISTORY
  // =============================================

  const addComment = useCallback((studentId, text) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      const newComment = { id: genId(), text, author: user?.name || 'Система', date: new Date().toISOString() };
      updStudent(studentId, { comments: [...(student.comments || []), newComment] });
    }
  }, [data.students, user, updStudent]);

  const addHistory = useCallback(async (studentId, text, type = 'action') => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      updStudent(studentId, {
        history: [...(student.history || []), { date: new Date().toISOString(), text, type }],
      });
    }
    if (!USE_LOCAL) {
      try { await historyAPI.add(studentId, text, type); } catch { /* ignore */ }
    }
  }, [data.students, updStudent]);

  // =============================================
  // TEACHERS CRUD
  // =============================================

  const addTeacher = useCallback(async (d) => {
    if (USE_LOCAL) {
      const n = { id: genId(), ...d, hoursWorked: 0, totalLessons: 0, lessons: [], syllabus: [] };
      upd('teachers', [...data.teachers, n]);
      return n;
    }

    try {
      const login = d.login || generateLogin(d.name);
      const password = d.password || generatePassword();

      const { data: authData } = await supabase.auth.signUp({
        email: d.email || `${login}@nobilis.kz`,
        password,
        options: { data: { name: d.name, role: 'teacher', login } },
      });

      const { data: profile } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          login, name: d.name,
          email: d.email || `${login}@nobilis.kz`,
          phone: d.phone || null,
          role: 'teacher',
        }, { onConflict: 'id' })
        .select()
        .single();

      await loadAllData();
      return profile;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [data.teachers, upd, loadAllData]);

  const updTeacher = useCallback(async (id, u) => {
    upd('teachers', data.teachers.map(t => t.id === id ? { ...t, ...u } : t));

    if (!USE_LOCAL) {
      try {
        const dbUpdates = {};
        if (u.name) dbUpdates.name = u.name;
        if (u.email) dbUpdates.email = u.email;
        if (u.phone) dbUpdates.phone = u.phone;
        if (u.avatar) dbUpdates.avatar = u.avatar;
        if (u.department) dbUpdates.department = u.department;
        if (Object.keys(dbUpdates).length) await profilesAPI.update(id, dbUpdates);
      } catch (err) { console.error(err); }
    }
  }, [data.teachers, upd]);

  const delTeacher = useCallback(async (id) => {
    upd('teachers', data.teachers.filter(t => t.id !== id));
    upd('schedule', data.schedule.map(s => s.teacherId === id ? { ...s, teacherId: null } : s));
    if (!USE_LOCAL) {
      try { await profilesAPI.update(id, { is_active: false }); } catch (err) { console.error(err); }
    }
  }, [data.teachers, data.schedule, upd]);

  // =============================================
  // SCHEDULE CRUD
  // =============================================

  const addSchedule = useCallback(async (d) => {
    const newSch = { id: genId(), ...d };
    upd('schedule', [...data.schedule, newSch]);
    if (!USE_LOCAL) {
      try {
        const created = await scheduleAPI.create({
          subject: d.subject, teacher_id: d.teacherId, day: d.day,
          time: d.time, duration: d.duration || 60, room: d.room || null,
          format: d.format || 'offline', meet_link: d.meetLink || null,
          is_curator: d.isCurator || false, student_ids: d.studentIds || [],
        });
        upd('schedule', data.schedule.map(s => s.id === newSch.id ? { ...s, id: created.id } : s));
      } catch (err) { console.error(err); }
    }
  }, [data.schedule, upd]);

  const updSchedule = useCallback(async (id, u) => {
    upd('schedule', data.schedule.map(s => s.id === id ? { ...s, ...u } : s));
    if (!USE_LOCAL) {
      try {
        const db = {};
        const map = {
          subject: 'subject', teacherId: 'teacher_id', day: 'day', time: 'time',
          duration: 'duration', room: 'room', format: 'format',
          meetLink: 'meet_link', isCurator: 'is_curator', studentIds: 'student_ids',
        };
        for (const [k, v] of Object.entries(u)) { if (map[k]) db[map[k]] = v; }
        if (Object.keys(db).length) await scheduleAPI.update(id, db);
      } catch (err) { console.error(err); }
    }
  }, [data.schedule, upd]);

  const delSchedule = useCallback(async (id) => {
    upd('schedule', data.schedule.filter(s => s.id !== id));
    if (!USE_LOCAL) {
      try { await scheduleAPI.delete(id); } catch (err) { console.error(err); }
    }
  }, [data.schedule, upd]);

  // =============================================
  // MOCK TESTS CRUD
  // =============================================

  const addMockTest = useCallback(async (d) => {
    const newMT = { id: genId(), ...d };
    upd('mockTests', [...data.mockTests, newMT]);
    if (!USE_LOCAL) {
      try {
        const created = await mockTestsAPI.create({
          name: d.name, type: d.type, date: d.date,
          time: d.time || null, room: d.room || null,
          student_ids: d.studentIds || [],
        });
        upd('mockTests', data.mockTests.map(t => t.id === newMT.id ? { ...t, id: created.id } : t));
      } catch (err) { console.error(err); }
    }
  }, [data.mockTests, upd]);

  const updMockTest = useCallback(async (id, u) => {
    upd('mockTests', data.mockTests.map(t => t.id === id ? { ...t, ...u } : t));
    if (!USE_LOCAL) {
      try {
        const db = {};
        const map = { name: 'name', type: 'type', date: 'date', time: 'time', room: 'room', studentIds: 'student_ids' };
        for (const [k, v] of Object.entries(u)) { if (map[k]) db[map[k]] = v; }
        if (Object.keys(db).length) await mockTestsAPI.update(id, db);
      } catch (err) { console.error(err); }
    }
  }, [data.mockTests, upd]);

  const delMockTest = useCallback(async (id) => {
    upd('mockTests', data.mockTests.filter(t => t.id !== id));
    if (!USE_LOCAL) { try { await mockTestsAPI.delete(id); } catch (err) { console.error(err); } }
  }, [data.mockTests, upd]);

  // =============================================
  // INTERNSHIPS CRUD
  // =============================================

  const addInternship = useCallback(async (d) => {
    const n = { id: genId(), ...d };
    upd('internships', [...data.internships, n]);
    if (!USE_LOCAL) {
      try { await internshipsAPI.create(d); } catch (err) { console.error(err); }
    }
  }, [data.internships, upd]);

  const updInternship = useCallback(async (id, u) => {
    upd('internships', data.internships.map(i => i.id === id ? { ...i, ...u } : i));
    if (!USE_LOCAL) { try { await internshipsAPI.update(id, u); } catch (err) { console.error(err); } }
  }, [data.internships, upd]);

  const delInternship = useCallback(async (id) => {
    upd('internships', data.internships.filter(i => i.id !== id));
    if (!USE_LOCAL) { try { await internshipsAPI.delete(id); } catch (err) { console.error(err); } }
  }, [data.internships, upd]);

  // =============================================
  // DOCUMENTS (with Supabase Storage)
  // =============================================

  const addDoc = useCallback(async (sid, doc) => {
    const d = { id: genId(), date: new Date().toISOString().split('T')[0], ...doc };
    const student = data.students.find(s => s.id === sid);
    if (!student) return;

    const updates = { documents: [...(student.documents || []), d] };

    if (DOCUMENT_TYPES[doc.type]?.isExam && doc.score) {
      const e = { id: genId(), type: doc.type, name: DOCUMENT_TYPES[doc.type].label, score: doc.score, date: d.date };
      updates.examResults = [...(student.examResults || []), e];
    }
    if (doc.type === 'recommendation') {
      updates.letters = [...(student.letters || []), {
        id: genId(), type: 'recommendation', author: doc.name || 'Куратор',
        subject: '', content: '', status: 'completed',
        fileName: doc.fileName || null, fileUrl: doc.fileUrl || null,
        lastEdit: new Date().toISOString().split('T')[0],
      }];
    }
    updates.history = [...(student.history || []), { date: new Date().toISOString(), text: `Загружен документ: ${d.name}`, type: 'action' }];
    updStudent(sid, updates);

    if (!USE_LOCAL) {
      try {
        // Upload file to Supabase Storage if file data provided
        let fileUrl = doc.fileUrl || null;
        let fileName = doc.fileName || null;

        if (doc.file instanceof File) {
          const uploaded = await documentsAPI.uploadFile(doc.file, sid);
          fileUrl = uploaded.url;
          fileName = uploaded.fileName;
        }

        await documentsAPI.create({
          student_id: sid, type: doc.type, name: doc.name,
          file_name: fileName, file_url: fileUrl,
          file_size: doc.fileSize || null, score: doc.score || null, date: d.date,
        });

        if (DOCUMENT_TYPES[doc.type]?.isExam && doc.score) {
          await examResultsAPI.create({
            student_id: sid, type: doc.type, score: doc.score, date: d.date,
          });
        }
        if (doc.type === 'recommendation') {
          await lettersAPI.create({
            student_id: sid, type: 'recommendation',
            author: doc.name || 'Куратор', status: 'completed',
            file_name: fileName, file_url: fileUrl,
          });
        }
        await historyAPI.add(sid, `Загружен документ: ${d.name}`);
      } catch (err) { console.error('Failed to save document to Supabase:', err); }
    }
  }, [data.students, updStudent]);

  const delDoc = useCallback(async (sid, did) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { documents: (student.documents || []).filter(d => d.id !== did) });
    if (!USE_LOCAL) {
      try { await documentsAPI.delete(did); } catch (err) { console.error(err); }
    }
  }, [data.students, updStudent]);

  // =============================================
  // LETTERS
  // =============================================

  const addLetter = useCallback(async (sid, l) => {
    const n = { id: genId(), lastEdit: new Date().toISOString().split('T')[0], ...l };
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: [...(student.letters || []), n] });
    if (!USE_LOCAL) {
      try {
        await lettersAPI.create({
          student_id: sid, type: l.type, university: l.university || null,
          author: l.author || null, subject: l.subject || null,
          content: l.content || null, status: l.status || 'draft',
        });
      } catch (err) { console.error(err); }
    }
  }, [data.students, updStudent]);

  const updLetter = useCallback(async (sid, lid, u) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: (student.letters || []).map(l => l.id === lid ? { ...l, ...u, lastEdit: new Date().toISOString().split('T')[0] } : l) });
    if (!USE_LOCAL) {
      try { await lettersAPI.update(lid, u); } catch (err) { console.error(err); }
    }
  }, [data.students, updStudent]);

  const delLetter = useCallback(async (sid, lid) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { letters: (student.letters || []).filter(l => l.id !== lid) });
    if (!USE_LOCAL) {
      try { await lettersAPI.delete(lid); } catch (err) { console.error(err); }
    }
  }, [data.students, updStudent]);

  // =============================================
  // SYLLABUS
  // =============================================

  const addSyllabus = useCallback(async (tid, syl) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: [...(t.syllabus || []), { id: genId(), progress: 0, students: [], youtubeLinks: {}, ...syl }] });
    if (!USE_LOCAL) {
      try { await syllabusAPI.create({ teacher_id: tid, ...syl }); } catch (err) { console.error(err); }
    }
  }, [data.teachers, updTeacher]);

  const updSyllabus = useCallback(async (tid, sid, u) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: (t.syllabus || []).map(s => s.id === sid ? { ...s, ...u } : s) });
    if (!USE_LOCAL) {
      try { await syllabusAPI.update(sid, u); } catch (err) { console.error(err); }
    }
  }, [data.teachers, updTeacher]);

  const delSyllabus = useCallback(async (tid, sid) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { syllabus: (t.syllabus || []).filter(s => s.id !== sid) });
    if (!USE_LOCAL) {
      try { await syllabusAPI.delete(sid); } catch (err) { console.error(err); }
    }
  }, [data.teachers, updTeacher]);

  // =============================================
  // ATTENDANCE
  // =============================================

  const markAtt = useCallback(async (schId, stuId, date, status, homework = null) => {
    const k = `${schId}_${date}`;
    const prev = data.attendance[k] || {};
    const entry = { ...(prev[stuId] || {}), status };
    if (homework !== null) entry.homework = homework;
    upd('attendance', { ...data.attendance, [k]: { ...prev, [stuId]: entry } });

    // Package auto-deduct logic
    if (status === 'absent' || status === 'present') {
      const student = data.students.find(s => s.id === stuId);
      if (student) {
        const pkg = (student.packages || []).find(p => !p.frozen && p.type !== 'support');
        if (pkg) {
          if (status === 'absent') updPackage(stuId, pkg.id, { missedLessons: (pkg.missedLessons || 0) + 1 });
          if (status === 'present') updPackage(stuId, pkg.id, { completedLessons: (pkg.completedLessons || 0) + 1 });
        }
      }
    }

    if (!USE_LOCAL) {
      try {
        await attendanceAPI.mark({
          student_id: stuId, schedule_id: schId, date, status,
        });
      } catch (err) { console.error(err); }
    }
  }, [data.attendance, data.students, upd, updPackage]);

  // =============================================
  // LESSON LOG & TEACHER LESSONS
  // =============================================

  const addLessonLog = useCallback((entry) => {
    upd('lessonLog', [...(data.lessonLog || []), { id: genId(), ...entry, date: entry.date || new Date().toISOString().split('T')[0] }]);
  }, [data.lessonLog, upd]);

  const markLesson = useCallback(async (tid, lesson) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) updTeacher(tid, { lessons: [...(t.lessons || []), { id: genId(), ...lesson, confirmed: false }] });
    if (!USE_LOCAL) {
      try {
        await teacherLessonsAPI.markLesson({
          teacher_id: tid, date: lesson.date,
          status: lesson.status || 'conducted', hours: lesson.hours || 1,
          schedule_id: lesson.scheduleId || null,
        });
      } catch (err) { console.error(err); }
    }
  }, [data.teachers, updTeacher]);

  const confirmLesson = useCallback(async (tid, lid) => {
    const t = data.teachers.find(x => x.id === tid);
    if (t) {
      const lessons = (t.lessons || []).map(l => l.id === lid ? { ...l, confirmed: true } : l);
      const confirmedConducted = lessons.filter(l => l.confirmed && l.status === 'conducted');
      const hrs = confirmedConducted.reduce((s, l) => s + (l.hours || 0), 0);
      updTeacher(tid, { lessons, hoursWorked: hrs, totalLessons: confirmedConducted.length });
    }
    if (!USE_LOCAL) {
      try { await teacherLessonsAPI.confirmLesson(lid, user?.id); } catch (err) { console.error(err); }
    }
  }, [data.teachers, updTeacher, user]);

  // =============================================
  // INTERNSHIP APPLY
  // =============================================

  const applyInternship = useCallback(async (sid, iid) => {
    const student = data.students.find(s => s.id === sid);
    if (student) updStudent(sid, { internships: [...(student.internships || []), { internshipId: iid, status: 'applied', appliedDate: new Date().toISOString().split('T')[0] }] });
  }, [data.students, updStudent]);

  // =============================================
  // SUPPORT TICKETS
  // =============================================

  const resolveTicket = useCallback(async (id) => {
    upd('supportTickets', (data.supportTickets || []).map(t => t.id === id ? { ...t, status: 'resolved' } : t));
    if (!USE_LOCAL) {
      try { await supportAPI.resolve(id, user?.id); } catch (err) { console.error(err); }
    }
  }, [data.supportTickets, upd, user]);

  const addTicket = useCallback(async (sid, msg) => {
    const s = data.students.find(x => x.id === sid);
    const ticket = {
      id: genId(), studentId: sid, studentName: s?.name || '', message: msg,
      priority: 'normal', created: new Date().toISOString(),
      deadline: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'open',
    };
    upd('supportTickets', [...(data.supportTickets || []), ticket]);
    if (!USE_LOCAL) {
      try {
        await supportAPI.create({ student_id: sid, message: msg, priority: 'normal', status: 'open' });
      } catch (err) { console.error(err); }
    }
  }, [data.students, data.supportTickets, upd]);

  // =============================================
  // CAREER TEST (Holland RIASEC)
  // =============================================

  const submitTest = useCallback(() => {
    if (Object.keys(testAnswers).length < HOLLAND_QUESTIONS.length) { alert('Ответьте на все вопросы'); return; }
    const r = calculateTestResult(testAnswers, HOLLAND_QUESTIONS, HOLLAND_PROFILES);
    if (user?.role === 'student') {
      const student = data.students.find(x => x.id === user.id);
      const updates = {
        testResult: r.profileName, testProfile: r.profile,
        testRiasecCode: r.riasecCode, testScores: r.scores, testCareers: r.careers,
        retakeAllowed: false,
      };
      updStudent(user.id, updates);
      setUser(p => ({ ...p, ...updates }));
    }
    setTestAnswers({});
    setTestQ(0);
  }, [testAnswers, user, data.students, updStudent]);

  const resetTest = useCallback(() => {
    const s = data.students.find(x => x.id === user?.id);
    if (!s?.retakeAllowed) return;
    updStudent(s.id, { testResult: null, testProfile: null, testRiasecCode: null, testScores: null, testCareers: null, retakeAllowed: false });
    setUser(prev => ({ ...prev, testResult: null, testProfile: null, testRiasecCode: null, testScores: null, testCareers: null, retakeAllowed: false }));
  }, [data.students, user, updStudent]);

  // =============================================
  // RETAKE MANAGEMENT
  // =============================================

  const requestRetake = useCallback((studentId, testType) => {
    if (testType === 'career') updStudent(studentId, { retakeRequested: true });
    else if (testType === 'english') updStudent(studentId, { englishRetakeRequested: true });
  }, [updStudent]);

  const approveRetake = useCallback((studentId, testType) => {
    if (testType === 'career') updStudent(studentId, { retakeAllowed: true, retakeRequested: false });
    else if (testType === 'english') updStudent(studentId, { englishRetakeAllowed: true, englishRetakeRequested: false });
  }, [updStudent]);

  const denyRetake = useCallback((studentId, testType) => {
    if (testType === 'career') updStudent(studentId, { retakeRequested: false });
    else if (testType === 'english') updStudent(studentId, { englishRetakeRequested: false });
  }, [updStudent]);

  // =============================================
  // ENGLISH TEST
  // =============================================

  const submitEnglishTest = useCallback((studentId, result) => {
    const student = data.students.find(s => s.id === studentId);
    if (student) {
      updStudent(studentId, {
        englishTestResult: result,
        englishTestHistory: [...(student.englishTestHistory || []), result],
      });
    }
  }, [data.students, updStudent]);

  const resetEnglishTest = useCallback((studentId) => {
    const student = data.students.find(s => s.id === studentId);
    if (student?.englishRetakeAllowed) {
      updStudent(studentId, { englishTestResult: null, englishRetakeAllowed: false });
    }
  }, [data.students, updStudent]);

  // =============================================
  // GLOBAL TASKS (Bitrix-style)
  // =============================================

  const addGlobalTask = useCallback(async (task) => {
    const newTask = { id: genId(), ...task };
    upd('globalTasks', [...(data.globalTasks || []), newTask]);
    if (!USE_LOCAL) {
      try {
        await tasksAPI.create({
          title: task.title, description: task.description,
          assigned_to: task.assignedTo, assigned_by: task.assignedBy,
          priority: task.priority || 'normal', due_date: task.dueDate,
          department: task.department,
        });
      } catch (err) { console.error(err); }
    }
  }, [data.globalTasks, upd]);

  const toggleGlobalTask = useCallback(async (taskId) => {
    const task = (data.globalTasks || []).find(t => t.id === taskId);
    upd('globalTasks', (data.globalTasks || []).map(t =>
      t.id === taskId ? { ...t, done: !t.done, doneDate: !t.done ? new Date().toISOString() : null } : t
    ));
    if (!USE_LOCAL && task) {
      try { await tasksAPI.toggleDone(taskId, task.done); } catch (err) { console.error(err); }
    }
  }, [data.globalTasks, upd]);

  const deleteGlobalTask = useCallback(async (taskId) => {
    upd('globalTasks', (data.globalTasks || []).filter(t => t.id !== taskId));
    if (!USE_LOCAL) {
      try { await tasksAPI.delete(taskId); } catch (err) { console.error(err); }
    }
  }, [data.globalTasks, upd]);

  // =============================================
  // LEADS CRM
  // =============================================

  const addLead = useCallback(async (lead) => {
    const newLead = {
      id: genId(), ...lead, created: new Date().toISOString(), updated: new Date().toISOString(),
      history: [{ date: new Date().toISOString(), action: 'created', text: 'Лид создан' }],
    };
    upd('leads', [...(data.leads || []), newLead]);
    if (!USE_LOCAL) {
      try { await leadsAPI.create(lead); } catch (err) { console.error(err); }
    }
    return newLead;
  }, [data.leads, upd]);

  const updLead = useCallback(async (id, changes) => {
    upd('leads', (data.leads || []).map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, ...changes, updated: new Date().toISOString() };
      if (changes.status && changes.status !== l.status) {
        updated.history = [...(l.history || []), { date: new Date().toISOString(), action: 'status_change', text: `Статус: ${changes.status}` }];
      }
      return updated;
    }));
    if (!USE_LOCAL) {
      try { await leadsAPI.update(id, changes); } catch (err) { console.error(err); }
    }
  }, [data.leads, upd]);

  const delLead = useCallback(async (id) => {
    upd('leads', (data.leads || []).filter(l => l.id !== id));
    if (!USE_LOCAL) { try { await leadsAPI.delete(id); } catch (err) { console.error(err); } }
  }, [data.leads, upd]);

  const addLeadNote = useCallback((leadId, text) => {
    upd('leads', (data.leads || []).map(l => l.id === leadId ? {
      ...l, updated: new Date().toISOString(),
      history: [...(l.history || []), { date: new Date().toISOString(), action: 'note', text }],
    } : l));
  }, [data.leads, upd]);

  // =============================================
  // MEETINGS & CALLS
  // =============================================

  const addMeeting = useCallback((meeting) => {
    const n = { id: genId(), ...meeting, created: new Date().toISOString() };
    upd('meetings', [...(data.meetings || []), n]);
    return n;
  }, [data.meetings, upd]);

  const updMeeting = useCallback((id, changes) => {
    upd('meetings', (data.meetings || []).map(m => m.id === id ? { ...m, ...changes } : m));
  }, [data.meetings, upd]);

  const delMeeting = useCallback((id) => {
    upd('meetings', (data.meetings || []).filter(m => m.id !== id));
  }, [data.meetings, upd]);

  const addCall = useCallback((call) => {
    const n = { id: genId(), ...call, date: call.date || new Date().toISOString() };
    upd('calls', [...(data.calls || []), n]);
    return n;
  }, [data.calls, upd]);

  const updCall = useCallback((id, changes) => {
    upd('calls', (data.calls || []).map(c => c.id === id ? { ...c, ...changes } : c));
  }, [data.calls, upd]);

  // =============================================
  // INTEGRATIONS & SALES TEAM
  // =============================================

  const updateIntegration = useCallback((service, settings) => {
    upd('integrations', { ...(data.integrations || {}), [service]: { ...(data.integrations?.[service] || {}), ...settings } });
  }, [data.integrations, upd]);

  const addSalesTeamMember = useCallback((member) => {
    const n = { id: genId(), ...member };
    upd('salesTeam', [...(data.salesTeam || []), n]);
    return n;
  }, [data.salesTeam, upd]);

  const updSalesTeamMember = useCallback((id, changes) => {
    upd('salesTeam', (data.salesTeam || []).map(m => m.id === id ? { ...m, ...changes } : m));
  }, [data.salesTeam, upd]);

  const delSalesTeamMember = useCallback((id) => {
    upd('salesTeam', (data.salesTeam || []).filter(m => m.id !== id));
  }, [data.salesTeam, upd]);

  // =============================================
  // CHAT
  // =============================================

  const sendMessage = useCallback(async (chatId, text, fromUser) => {
    const messages = { ...(data.chatMessages || {}) };
    const chatMsgs = [...(messages[chatId] || [])];
    const msg = {
      id: genId(), from: fromUser.id, fromName: fromUser.name,
      text, timestamp: new Date().toISOString(), read: false,
    };
    chatMsgs.push(msg);
    messages[chatId] = chatMsgs;
    upd('chatMessages', messages);

    if (!USE_LOCAL) {
      try { await chatAPI.sendMessage(chatId, fromUser.id, fromUser.name, text); } catch (err) { console.error(err); }
    }
  }, [data.chatMessages, upd]);

  const markChatRead = useCallback(async (chatId, userId) => {
    const messages = { ...(data.chatMessages || {}) };
    const chatMsgs = (messages[chatId] || []).map(m =>
      m.from !== userId ? { ...m, read: true } : m
    );
    messages[chatId] = chatMsgs;
    upd('chatMessages', messages);

    if (!USE_LOCAL) {
      try { await chatAPI.markRead(chatId, userId); } catch (err) { console.error(err); }
    }
  }, [data.chatMessages, upd]);

  // =============================================
  // PAYMENTS
  // =============================================

  const addPayment = useCallback(async (studentId, payment) => {
    const payments = { ...(data.payments || {}) };
    const studentPayments = [...(payments[studentId] || [])];
    const newPayment = { id: genId(), ...payment, date: payment.date || new Date().toISOString().split('T')[0] };
    studentPayments.push(newPayment);
    payments[studentId] = studentPayments;
    upd('payments', payments);

    const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    updStudent(studentId, { paidAmount: totalPaid });
    addHistory(studentId, `Платёж: ${(payment.amount || 0).toLocaleString()} ₸ (${payment.method || 'Freedom Pay'})`);

    if (!USE_LOCAL) {
      try {
        await paymentsAPI.create({
          student_id: studentId,
          amount: payment.amount,
          method: payment.method || 'freedom_pay',
          receipt_url: payment.receiptUrl || null,
          note: payment.note || null,
          date: newPayment.date,
          created_by: user?.id,
        });
      } catch (err) { console.error(err); }
    }
  }, [data.payments, upd, updStudent, addHistory, user]);

  // =============================================
  // DEADLINES
  // =============================================

  const updateDeadline = useCallback((student, key, value) => {
    const deadlines = { ...(student.deadlines || {}) };
    if (value === null) delete deadlines[key];
    else deadlines[key] = value;
    updStudent(student.id, { deadlines });
  }, [updStudent]);

  // =============================================
  // GENERIC DATA UPDATE
  // =============================================

  const updateData = useCallback((key, value) => upd(key, value), [upd]);

  // =============================================
  // RETURN
  // =============================================

  return {
    // State
    data, user, view, modal, selected, search, form, syncStatus,
    testAnswers, testQ, attDate, attSchedule, sylSearch,
    sidebarOpen, cityFilter, statusFilter, managerFilter, studentPage, calendarMode,
    // Setters
    setView, setModal, setSelected, setSearch, setForm,
    setTestAnswers, setTestQ, setAttDate, setAttSchedule, setSylSearch,
    setSidebarOpen, setCityFilter, setStatusFilter, setManagerFilter, setStudentPage, setCalendarMode,
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
    addPackage, updPackage, freezePackage,
    addTask, toggleTask,
    addComment, addHistory, addLessonLog,
    freezeStudent, unfreezeStudent, setAvatar,
    submitEnglishTest, resetEnglishTest,
    addGlobalTask, toggleGlobalTask, deleteGlobalTask,
    addLead, updLead, delLead, addLeadNote,
    addMeeting, updMeeting, delMeeting,
    addCall, updCall,
    addSalesTeamMember, updSalesTeamMember, delSalesTeamMember,
    updateIntegration,
    updateData,
    sendMessage, markChatRead,
    addPayment,
    updateDeadline,
    generateLogin, generatePassword,
  };
}
