// =============================================
// NOBILIS ACADEMY - INITIAL DEMO DATA v3
// =============================================

import { STORAGE_KEY } from './constants';

export const getInitialData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* ignore parse errors */ }
  }
  return {
    students: [
      {
        id: '1', name: "Алексей Петров", login: "alexey.pet47", password: "Nobilis2024!",
        email: "alex@mail.com", phone: "+7 999 123-45-67", age: 16, grade: "10 класс",
        city: "Алматы", status: "active", graduationYear: 2025,
        joinDate: "2024-09-15", contractEndDate: "2025-09-15",
        parentName: "Петров Игорь", parentPhone: "+7 999 765-43-21",
        testResult: null, testScores: null,
        targetIelts: "7.5", targetSat: "1500",
        selectedCountries: ["США", "Германия"],
        targetUniversities: ["MIT", "TU Munich"],
        deadlines: { ielts: "2025-03-01", sat: "2025-04-15" },
        initialResults: { ielts: "5.5", sat: "1100", date: "2024-09-15" },
        packages: [
          { id: 'pkg1', type: 'ielts', startDate: '2024-09-01', endDate: '2025-06-01', totalLessons: 48, completedLessons: 22, missedLessons: 2, frozen: false, frozenDays: 0 },
          { id: 'pkg2', type: 'sat', startDate: '2024-09-01', endDate: '2025-04-15', totalLessons: 36, completedLessons: 12, missedLessons: 1, frozen: false, frozenDays: 0 },
          { id: 'pkg3', type: 'support', startDate: '2024-09-01', endDate: '2025-09-01', currentStage: 3, stageNotes: { 1: 'Тест Gallup пройден', 2: 'США, Германия' }, frozen: false }
        ],
        examResults: [
          { id: 'e1', type: "ielts", name: "IELTS", score: "7.0", date: "2024-11-20", breakdown: { listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 } },
          { id: 'e2', type: "mock_ielts", name: "Пробный IELTS #1", score: "6.5", date: "2024-09-20" }
        ],
        attendance: { total: 24, attended: 22 },
        documents: [
          { id: 'd1', type: "contract", name: "Договор", date: "2024-09-15" },
          { id: 'd2', type: "ielts_cert", name: "IELTS 7.0", date: "2024-11-20", score: "7.0" }
        ],
        letters: [{ id: 'l1', type: "motivation", university: "MIT", status: "draft", content: "Dear Admissions Committee...", lastEdit: "2024-12-10" }],
        internships: [{ internshipId: '1', status: "applied", appliedDate: "2024-12-01" }],
        invitations: [{ id: 'inv1', country: 'usa', university: 'MIT', date: '2025-01-20', status: 'pending' }],
        tasks: [
          { id: 'task1', text: 'Написать мотивационное письмо для MIT', assignee: 'curator', deadline: '2025-02-01', done: false, created: '2024-12-01' },
          { id: 'task2', text: 'Подготовить транскрипт оценок', assignee: '1', deadline: '2025-01-15', done: true, created: '2024-12-05' }
        ],
        comments: [
          { id: 'com1', text: 'Хороший прогресс по IELTS, вырос с 5.5 до 7.0', author: 'Куратор Мария', date: '2024-12-10T10:30:00' }
        ],
        history: [
          { date: '2024-09-15', text: 'Зачислен в академию', type: 'system' },
          { date: '2024-11-20', text: 'Сдал IELTS на 7.0', type: 'achievement' },
          { date: '2025-01-20', text: 'Получил приглашение от MIT', type: 'invitation' }
        ]
      },
      {
        id: '2', name: "Мария Иванова", login: "maria.iva23", password: "Nobilis2024@",
        email: "maria@mail.com", phone: "+7 999 234-56-78", age: 17, grade: "11 класс",
        city: "Астана", status: "process", graduationYear: 2025,
        joinDate: "2024-08-01", contractEndDate: "2025-08-01",
        parentName: "Иванова Елена", parentPhone: "+7 999 876-54-32",
        testResult: "Творческий Визионер", testScores: { creative: 28, social: 18 },
        targetIelts: "7.5", targetSat: null,
        selectedCountries: ["Нидерланды"],
        targetUniversities: ["TU Delft"],
        deadlines: { ielts: "2025-02-15" },
        initialResults: { ielts: "6.0", date: "2024-08-01" },
        packages: [
          { id: 'pkg4', type: 'ielts', startDate: '2024-08-01', endDate: '2025-05-01', totalLessons: 36, completedLessons: 30, missedLessons: 1, frozen: false, frozenDays: 0 },
          { id: 'pkg5', type: 'support', startDate: '2024-08-01', endDate: '2025-08-01', currentStage: 6, stageNotes: { 1: '\u2713', 2: 'Нидерланды', 3: '\u2713', 4: '\u2713', 5: 'TU Delft подана', 6: 'Ждём ответ' }, frozen: false }
        ],
        examResults: [
          { id: 'e4', type: "ielts", name: "IELTS", score: "7.5", date: "2024-10-10", breakdown: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 } }
        ],
        attendance: { total: 30, attended: 29 },
        documents: [{ id: 'd3', type: "contract", name: "Договор", date: "2024-08-01" }],
        letters: [{ id: 'l3', type: "motivation", university: "TU Delft", status: "completed", content: "My name is Maria...", lastEdit: "2024-11-20" }],
        internships: [{ internshipId: '3', status: "accepted", appliedDate: "2024-10-15" }],
        invitations: [],
        tasks: [],
        comments: [],
        history: [{ date: '2024-08-01', text: 'Зачислена в академию', type: 'system' }]
      },
      {
        id: '3', name: "Дмитрий Козлов", login: "dmitry.koz15", password: "Nobilis2024#",
        email: "dmitry@mail.com", phone: "+7 999 345-67-89", age: 15, grade: "9 класс",
        city: "Алматы", status: "active", graduationYear: 2026,
        joinDate: "2024-12-01", contractEndDate: "2026-06-01",
        parentName: "Козлов Андрей", parentPhone: "+7 999 987-65-43",
        testResult: null, testScores: null,
        targetIelts: "7.0", targetSat: "1400",
        selectedCountries: [], targetUniversities: [],
        deadlines: { ielts: "2025-12-01" },
        initialResults: { ielts: "4.5", sat: "900", date: "2024-12-01" },
        packages: [
          { id: 'pkg6', type: 'ielts', startDate: '2024-12-01', endDate: '2025-12-01', totalLessons: 60, completedLessons: 8, missedLessons: 2, frozen: false, frozenDays: 0 },
          { id: 'pkg7', type: 'sat', startDate: '2024-12-01', endDate: '2026-03-01', totalLessons: 48, completedLessons: 4, missedLessons: 0, frozen: false, frozenDays: 0 },
          { id: 'pkg8', type: 'support', startDate: '2024-12-01', endDate: '2026-06-01', currentStage: 1, stageNotes: {}, frozen: false }
        ],
        examResults: [{ id: 'e5', type: "mock_ielts", name: "Пробный IELTS", score: "5.0", date: "2024-10-25" }],
        attendance: { total: 12, attended: 10 },
        documents: [{ id: 'd5', type: "contract", name: "Договор", date: "2024-10-01" }],
        letters: [], internships: [],
        invitations: [],
        tasks: [{ id: 'task3', text: 'Пройти профориентацию', assignee: 'curator', deadline: '2025-01-30', done: false, created: '2024-12-15' }],
        comments: [],
        history: [{ date: '2024-12-01', text: 'Зачислен в академию', type: 'system' }]
      },
      {
        id: '4', name: "Анна Сидорова", login: "anna.sid88", password: "Nobilis2024$",
        email: "anna.s@mail.com", phone: "+7 999 456-78-90", age: 17, grade: "11 класс",
        city: "Шымкент", status: "process", graduationYear: 2025,
        joinDate: "2024-09-01", contractEndDate: "2025-09-01",
        parentName: "Сидорова Ольга", parentPhone: "+7 999 444-55-66",
        testResult: null, testScores: null,
        targetIelts: "7.0", targetSat: null,
        selectedCountries: ["Великобритания"],
        targetUniversities: ["Cambridge"],
        deadlines: {},
        initialResults: { ielts: "5.0", date: "2024-09-01" },
        packages: [
          { id: 'pkg9', type: 'ielts', startDate: '2024-09-01', endDate: '2025-06-01', totalLessons: 48, completedLessons: 36, missedLessons: 3, frozen: false, frozenDays: 0 },
          { id: 'pkg10', type: 'support', startDate: '2024-09-01', endDate: '2025-09-01', currentStage: 7, stageNotes: { 7: 'Приглашение от Cambridge!' }, frozen: false }
        ],
        examResults: [{ id: 'e6', type: "ielts", name: "IELTS", score: "7.0", date: "2025-01-10" }],
        attendance: { total: 39, attended: 36 },
        documents: [],
        letters: [],
        internships: [],
        invitations: [{ id: 'inv2', country: 'uk', university: 'Cambridge', date: '2025-01-25', status: 'accepted' }],
        tasks: [],
        comments: [],
        history: [
          { date: '2024-09-01', text: 'Зачислена в академию', type: 'system' },
          { date: '2025-01-25', text: 'Получила приглашение от Cambridge!', type: 'invitation' }
        ]
      }
    ],
    teachers: [
      {
        id: '1', name: "Смирнова Анна Владимировна", login: "smirnova.ann", password: "Teacher2024!",
        email: "smirnova@nobilis.edu", phone: "+7 999 111-22-33",
        subject: "Английский / IELTS", hourlyRate: 2500, hoursWorked: 48, totalLessons: 32,
        lessons: [
          { id: 'tl1', date: "2024-12-09", scheduleId: '1', status: "conducted", hours: 1.5, confirmed: true },
          { id: 'tl2', date: "2024-12-12", scheduleId: '1', status: "cancelled", hours: 0, note: "Больничный", confirmed: false }
        ],
        syllabus: [
          { id: 's1', course: "IELTS Prep", weeks: 12, topics: ["Listening", "Reading", "Writing", "Speaking"], progress: 75, students: ['1', '2'], youtubeLinks: { "Listening": "https://youtube.com/watch?v=example1", "Reading": "" } }
        ]
      },
      {
        id: '2', name: "Петров Иван Константинович", login: "petrov.iva", password: "Teacher2024@",
        email: "petrov@nobilis.edu", phone: "+7 999 222-33-44",
        subject: "Математика / SAT", hourlyRate: 2800, hoursWorked: 36, totalLessons: 24,
        lessons: [{ id: 'tl4', date: "2024-12-13", scheduleId: '3', status: "conducted", hours: 1.5, confirmed: true }],
        syllabus: [{ id: 's3', course: "SAT Math", weeks: 16, topics: ["Algebra", "Geometry", "Statistics"], progress: 60, students: ['1', '3'], youtubeLinks: {} }]
      },
      {
        id: '3', name: "Дизайнова Анна Сергеевна", login: "anna.dsgn", password: "Teacher2024#",
        email: "anna@nobilis.edu", phone: "+7 999 333-44-55",
        subject: "Портфолио / Дизайн", hourlyRate: 3000, hoursWorked: 24, totalLessons: 12,
        lessons: [],
        syllabus: [{ id: 's4', course: "Portfolio", weeks: 10, topics: ["Concept", "Execution"], progress: 40, students: ['2'], youtubeLinks: {} }]
      }
    ],
    schedule: [
      { id: '1', subject: "Подготовка к IELTS", teacherId: '1', day: "Понедельник", time: "16:00", duration: 90, room: "201", students: ['1', '2'] },
      { id: '2', subject: "Профориентация", teacherId: null, day: "Среда", time: "15:00", duration: 60, room: "105", students: ['1', '2', '3'], isCurator: true },
      { id: '3', subject: "SAT Math", teacherId: '2', day: "Пятница", time: "17:00", duration: 90, room: "203", students: ['1', '3'] },
      { id: '4', subject: "Portfolio Workshop", teacherId: '3', day: "Вторник", time: "16:00", duration: 120, room: "Studio", students: ['2'] },
      { id: '5', subject: "Academic Writing", teacherId: '1', day: "Четверг", time: "15:30", duration: 90, room: "201", students: ['1', '2', '3'] }
    ],
    mockTests: [
      { id: '1', type: "ielts", name: "Пробный IELTS Январь", date: "2025-01-11", time: "10:00", room: "301", students: ['1', '2', '3'] },
      { id: '2', type: "sat", name: "Пробный SAT Январь", date: "2025-01-18", time: "09:00", room: "302", students: ['1', '3'] }
    ],
    internships: [
      { id: '1', name: "Google Summer of Code", country: "США", type: "IT", requirements: "IELTS 7.0+", deadline: "2025-03-15", link: "https://summerofcode.withgoogle.com", description: "Программа для разработчиков" },
      { id: '2', name: "CERN Summer Student", country: "Швейцария", type: "Наука", requirements: "IELTS 6.5+", deadline: "2025-01-25", link: "https://careers.cern.ch", description: "Летняя программа в ЦЕРН" },
      { id: '3', name: "Design Week Milan", country: "Италия", type: "Дизайн", requirements: "Portfolio", deadline: "2025-02-28", link: "https://designweek.it", description: "Стажировка на неделе дизайна" }
    ],
    supportTickets: [
      { id: '1', studentId: '3', studentName: "Дмитрий Козлов", message: "Не могу зайти в ЛК", priority: "high", created: "2024-12-10T10:30:00", deadline: "2024-12-12T10:30:00", status: "open" }
    ],
    attendance: {},
    lessonLog: []
  };
};
