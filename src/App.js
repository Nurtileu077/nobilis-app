import React, { useState, useEffect } from 'react';

// ========== УТИЛИТЫ ==========
const generatePassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateLogin = (name) => {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  const parts = name.toLowerCase().split(' ');
  const translit = (str) => str.split('').map(c => translitMap[c] || c).join('');
  return translit(parts[0] || 'user') + '.' + translit(parts[1] || '').slice(0, 1) + Math.floor(Math.random() * 100);
};

const daysBetween = (date1, date2) => Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));

const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU');

// Мотивационные цитаты
const motivationalQuotes = [
  "🎉 Поздравляем! Твоя мечта становится реальностью!",
  "🌟 Ты сделал это! Впереди — невероятные возможности!",
  "🚀 Новая глава твоей жизни начинается сейчас!",
  "💪 Твой труд окупился! Гордимся тобой!",
  "🎓 Добро пожаловать в мир больших возможностей!"
];

// ========== ЦВЕТА БРЕНДА ==========
const colors = {
  primary: '#1a3a32', // Тёмно-зелёный
  primaryLight: '#2d5a4a',
  primaryDark: '#0f2a22',
  gold: '#c9a227', // Золотой
  goldLight: '#e8c547',
  goldDark: '#a68620',
  white: '#ffffff',
  gray: {
    50: '#f8faf9',
    100: '#f0f4f2',
    200: '#e0e8e4',
    300: '#c5d1cb',
    400: '#9aac a3',
    500: '#6b7f74',
    600: '#526259',
    700: '#3d4a43',
    800: '#2a332e',
    900: '#1a201d'
  }
};

// ========== ТИПЫ ДОКУМЕНТОВ ==========
const documentTypes = {
  contract: { icon: '📄', label: 'Договор', color: 'blue' },
  receipt: { icon: '🧾', label: 'Чек об оплате', color: 'green' },
  ielts: { icon: '📊', label: 'IELTS сертификат', isExam: true },
  sat: { icon: '📈', label: 'SAT сертификат', isExam: true },
  toefl: { icon: '📋', label: 'TOEFL сертификат', isExam: true },
  gre: { icon: '📑', label: 'GRE сертификат', isExam: true },
  invitation: { icon: '✉️', label: 'Приглашение из университета' },
  motivation: { icon: '💌', label: 'Мотивационное письмо' },
  recommendation: { icon: '📝', label: 'Рекомендательное письмо' },
  certificate: { icon: '🏆', label: 'Сертификат/Диплом' },
  passport: { icon: '🛂', label: 'Паспорт/ID' },
  transcript: { icon: '📚', label: 'Транскрипт оценок' },
  mock_ielts: { icon: '📝', label: 'Пробный IELTS', isExam: true },
  mock_sat: { icon: '📝', label: 'Пробный SAT', isExam: true }
};

// ========== ПРОФОРИЕНТАЦИОННЫЙ ТЕСТ ==========
const careerTestQuestions = [
  {
    id: 1,
    question: "Когда вы работаете над проектом, вам больше нравится:",
    options: [
      { text: "Разрабатывать новые идеи и концепции", traits: ["creative", "innovative"] },
      { text: "Организовывать процесс и следить за выполнением", traits: ["organized", "leader"] },
      { text: "Анализировать данные и находить закономерности", traits: ["analytical", "research"] },
      { text: "Общаться с людьми и помогать им", traits: ["social", "helper"] }
    ]
  },
  {
    id: 2,
    question: "В команде вы обычно берёте на себя роль:",
    options: [
      { text: "Лидера, который направляет команду", traits: ["leader", "decisive"] },
      { text: "Генератора идей", traits: ["creative", "innovative"] },
      { text: "Исполнителя, который доводит дело до конца", traits: ["organized", "reliable"] },
      { text: "Медиатора, который сглаживает конфликты", traits: ["social", "diplomatic"] }
    ]
  },
  {
    id: 3,
    question: "Какой тип задач вас больше привлекает?",
    options: [
      { text: "Решение сложных технических проблем", traits: ["analytical", "technical"] },
      { text: "Создание визуального контента", traits: ["creative", "artistic"] },
      { text: "Работа с финансами и цифрами", traits: ["analytical", "finance"] },
      { text: "Преподавание и наставничество", traits: ["social", "helper"] }
    ]
  },
  {
    id: 4,
    question: "Как вы предпочитаете проводить свободное время?",
    options: [
      { text: "Читать книги, изучать новое", traits: ["research", "curious"] },
      { text: "Заниматься творчеством", traits: ["creative", "artistic"] },
      { text: "Общаться с друзьями", traits: ["social", "active"] },
      { text: "Планировать, организовывать", traits: ["organized", "leader"] }
    ]
  },
  {
    id: 5,
    question: "Что для вас важнее в будущей профессии?",
    options: [
      { text: "Высокий доход и стабильность", traits: ["finance", "reliable"] },
      { text: "Творческая самореализация", traits: ["creative", "innovative"] },
      { text: "Польза обществу", traits: ["social", "helper"] },
      { text: "Карьерный рост и влияние", traits: ["leader", "ambitious"] }
    ]
  },
  {
    id: 6,
    question: "Какой предмет вам нравится больше?",
    options: [
      { text: "Математика и физика", traits: ["analytical", "technical"] },
      { text: "Литература и языки", traits: ["creative", "communication"] },
      { text: "История и обществознание", traits: ["research", "social"] },
      { text: "Биология и химия", traits: ["research", "scientific"] }
    ]
  },
  {
    id: 7,
    question: "Как вы относитесь к риску?",
    options: [
      { text: "Готов рисковать ради результатов", traits: ["ambitious", "innovative"] },
      { text: "Предпочитаю взвешенные решения", traits: ["analytical", "reliable"] },
      { text: "Рискую в знакомых областях", traits: ["organized", "cautious"] },
      { text: "Избегаю рисков", traits: ["reliable", "cautious"] }
    ]
  },
  {
    id: 8,
    question: "Какая рабочая среда вам ближе?",
    options: [
      { text: "Офис крупной корпорации", traits: ["organized", "reliable"] },
      { text: "Стартап или своё дело", traits: ["innovative", "ambitious"] },
      { text: "Удалённая работа", traits: ["creative", "independent"] },
      { text: "Работа с людьми", traits: ["social", "helper"] }
    ]
  },
  {
    id: 9,
    question: "Что вас мотивирует?",
    options: [
      { text: "Признание и похвала", traits: ["social", "ambitious"] },
      { text: "Интересные задачи", traits: ["curious", "innovative"] },
      { text: "Финансовое вознаграждение", traits: ["finance", "ambitious"] },
      { text: "Видимый результат", traits: ["organized", "reliable"] }
    ]
  },
  {
    id: 10,
    question: "Как вы принимаете решения?",
    options: [
      { text: "Логически, на основе фактов", traits: ["analytical", "decisive"] },
      { text: "Интуитивно", traits: ["creative", "intuitive"] },
      { text: "Советуюсь с другими", traits: ["social", "diplomatic"] },
      { text: "Следую проверенным методам", traits: ["organized", "reliable"] }
    ]
  }
];

const careerProfiles = {
  "Аналитик-Исследователь": {
    traits: ["analytical", "research", "curious"],
    description: "Вы обладаете сильным аналитическим мышлением. Вам подходят профессии, связанные с исследованиями и анализом данных.",
    careers: ["Data Scientist", "Учёный", "Аналитик", "Программист", "Финансист"],
    universities: ["MIT", "Stanford", "ETH Zurich", "Cambridge"],
    countries: ["США", "Германия", "Великобритания", "Сингапур"],
    color: "#3B82F6"
  },
  "Творческий Визионер": {
    traits: ["creative", "innovative", "artistic"],
    description: "Вы креативная личность с богатым воображением. Ваша сила в генерации идей и творческом подходе.",
    careers: ["Дизайнер", "Архитектор", "Маркетолог", "Режиссёр", "UX дизайнер"],
    universities: ["RISD", "Parsons", "Central Saint Martins", "Politecnico di Milano"],
    countries: ["Нидерланды", "Италия", "США", "Южная Корея"],
    color: "#8B5CF6"
  },
  "Лидер-Организатор": {
    traits: ["leader", "organized", "ambitious"],
    description: "Вы прирождённый лидер с отличными организаторскими способностями.",
    careers: ["Менеджер", "Предприниматель", "Консультант", "HR-директор", "CEO"],
    universities: ["Harvard", "INSEAD", "London Business School", "Wharton"],
    countries: ["США", "Великобритания", "ОАЭ", "Швейцария"],
    color: "#F59E0B"
  },
  "Социальный Помощник": {
    traits: ["social", "helper", "diplomatic"],
    description: "Вы эмпатичны и любите работать с людьми. Ваше призвание — помогать другим.",
    careers: ["Психолог", "Врач", "Учитель", "Социальный работник", "HR"],
    universities: ["University of Toronto", "Melbourne", "Copenhagen", "Heidelberg"],
    countries: ["Канада", "Австралия", "Скандинавия", "Германия"],
    color: "#10B981"
  },
  "Технический Специалист": {
    traits: ["technical", "reliable", "analytical"],
    description: "Вы технически подкованы и надёжны. Вам подходят инженерные специальности.",
    careers: ["Инженер", "IT-специалист", "Разработчик", "Сисадмин", "CTO"],
    universities: ["TU Munich", "Tokyo University", "KAIST", "Czech Technical"],
    countries: ["Германия", "Япония", "Южная Корея", "Чехия"],
    color: "#EF4444"
  }
};

// ========== НАЧАЛЬНЫЕ ДАННЫЕ ==========
const initialStudents = [
  {
    id: 1,
    name: "Алексей Петров",
    login: "alexey.p42",
    password: "Nobilis2024!",
    email: "alex.petrov@mail.com",
    phone: "+7 (999) 123-45-67",
    age: 16,
    grade: "10 класс",
    joinDate: "2024-09-15",
    contractEndDate: "2025-09-15",
    parentName: "Петров Игорь Сергеевич",
    parentPhone: "+7 (999) 765-43-21",
    testResult: "Аналитик-Исследователь",
    selectedCountries: ["США", "Германия"],
    targetUniversities: ["MIT", "TU Munich"],
    deadlines: { ielts: "2025-03-01", sat: "2025-04-15", applications: "2025-06-01" },
    examResults: [
      { type: "ielts", name: "IELTS", score: "7.0", date: "2024-11-20", breakdown: { listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 } },
      { type: "sat", name: "SAT", score: "1420", date: "2024-10-15", breakdown: { math: 750, verbal: 670 } },
      { type: "mock_ielts", name: "Пробный IELTS #1", score: "6.5", date: "2024-09-20" },
      { type: "mock_ielts", name: "Пробный IELTS #2", score: "6.5", date: "2024-10-20" },
      { type: "mock_ielts", name: "Пробный IELTS #3", score: "7.0", date: "2024-11-10" }
    ],
    attendance: { total: 24, attended: 22 },
    documents: [
      { type: "contract", name: "Договор на обучение", date: "2024-09-15" },
      { type: "receipt", name: "Чек - Сентябрь", date: "2024-09-15", amount: "150000" },
      { type: "ielts", name: "IELTS Certificate", date: "2024-11-20", score: "7.0" }
    ],
    internships: [{ name: "Google Summer Program", country: "США", status: "applied" }],
    letters: {
      motivation: [{ id: 1, university: "MIT", status: "draft", lastEdit: "2024-12-10" }],
      recommendation: [{ id: 1, author: "Иванов А.А.", subject: "Физика", status: "completed", date: "2024-11-15" }]
    }
  },
  {
    id: 2,
    name: "Мария Иванова",
    login: "maria.i87",
    password: "Nobilis2024@",
    email: "maria.ivanova@mail.com",
    phone: "+7 (999) 234-56-78",
    age: 17,
    grade: "11 класс",
    joinDate: "2024-08-01",
    contractEndDate: "2025-08-01",
    parentName: "Иванова Елена Викторовна",
    parentPhone: "+7 (999) 876-54-32",
    testResult: "Творческий Визионер",
    selectedCountries: ["Нидерланды", "Италия"],
    targetUniversities: ["TU Delft", "Politecnico di Milano"],
    deadlines: { ielts: "2025-02-15", portfolio: "2025-03-01", applications: "2025-04-01" },
    examResults: [
      { type: "ielts", name: "IELTS", score: "7.5", date: "2024-10-10", breakdown: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 } },
      { type: "mock_ielts", name: "Пробный IELTS #1", score: "7.0", date: "2024-09-15" }
    ],
    attendance: { total: 30, attended: 29 },
    documents: [
      { type: "contract", name: "Договор на обучение", date: "2024-08-01" },
      { type: "invitation", name: "Приглашение от TU Delft", date: "2024-12-01", university: "TU Delft" }
    ],
    internships: [{ name: "Design Week Milan", country: "Италия", status: "accepted" }],
    letters: {
      motivation: [{ id: 1, university: "TU Delft", status: "completed", lastEdit: "2024-11-20" }],
      recommendation: [{ id: 1, author: "Дизайнер Анна", subject: "Портфолио", status: "completed", date: "2024-11-10" }]
    }
  },
  {
    id: 3,
    name: "Дмитрий Козлов",
    login: "dmitry.k15",
    password: "Nobilis2024#",
    email: "dmitry.kozlov@mail.com",
    phone: "+7 (999) 345-67-89",
    age: 15,
    grade: "9 класс",
    joinDate: "2024-12-01",
    contractEndDate: "2026-06-01",
    parentName: "Козлов Андрей Петрович",
    parentPhone: "+7 (999) 987-65-43",
    testResult: null,
    selectedCountries: [],
    targetUniversities: [],
    deadlines: { ielts: "2025-12-01", sat: "2026-03-01" },
    examResults: [
      { type: "mock_ielts", name: "Пробный IELTS #1", score: "5.0", date: "2024-10-25" },
      { type: "mock_sat", name: "Пробный SAT #1", score: "1100", date: "2024-11-10" }
    ],
    attendance: { total: 12, attended: 10 },
    documents: [{ type: "contract", name: "Договор на обучение", date: "2024-10-01" }],
    internships: [],
    letters: { motivation: [], recommendation: [] }
  }
];

const initialTeachers = [
  { 
    id: 1, 
    name: "Смирнова Анна Владимировна", 
    login: "smirnova.av",
    password: "Teacher2024!",
    subject: "Английский язык / IELTS", 
    email: "smirnova@nobilis.edu",
    phone: "+7 (999) 111-22-33",
    hourlyRate: 2500,
    hoursWorked: 48,
    totalLessons: 32,
    attendance: [
      { date: "2024-12-09", hours: 4, present: true },
      { date: "2024-12-10", hours: 3, present: true },
      { date: "2024-12-11", hours: 4, present: true },
      { date: "2024-12-12", hours: 0, present: false, reason: "Больничный" }
    ],
    syllabus: [
      { id: 1, course: "IELTS Preparation", weeks: 12, topics: ["Listening", "Reading", "Writing", "Speaking"], progress: 75 },
      { id: 2, course: "Academic Writing", weeks: 8, topics: ["Essay Structure", "Argumentation", "Citations"], progress: 50 }
    ]
  },
  { 
    id: 2, 
    name: "Петров Иван Константинович", 
    login: "petrov.ik",
    password: "Teacher2024@",
    subject: "Математика / SAT", 
    email: "petrov@nobilis.edu",
    phone: "+7 (999) 222-33-44",
    hourlyRate: 2800,
    hoursWorked: 36,
    totalLessons: 24,
    attendance: [
      { date: "2024-12-09", hours: 3, present: true },
      { date: "2024-12-10", hours: 3, present: true }
    ],
    syllabus: [
      { id: 1, course: "SAT Math", weeks: 16, topics: ["Algebra", "Geometry", "Statistics"], progress: 60 }
    ]
  },
  { 
    id: 3, 
    name: "Дизайнер Анна Сергеевна", 
    login: "anna.design",
    password: "Teacher2024#",
    subject: "Портфолио / Дизайн", 
    email: "anna.design@nobilis.edu",
    phone: "+7 (999) 333-44-55",
    hourlyRate: 3000,
    hoursWorked: 24,
    totalLessons: 12,
    attendance: [{ date: "2024-12-10", hours: 4, present: true }],
    syllabus: [
      { id: 1, course: "Portfolio Development", weeks: 10, topics: ["Concept", "Execution", "Presentation"], progress: 40 }
    ]
  }
];

const initialSchedule = [
  { id: 1, subject: "Подготовка к IELTS", teacherId: 1, day: "Понедельник", time: "16:00", duration: 90, room: "201", students: [1, 2] },
  { id: 2, subject: "Профориентация", teacherId: null, day: "Среда", time: "15:00", duration: 60, room: "105", students: [1, 2, 3], isCurator: true },
  { id: 3, subject: "SAT Math", teacherId: 2, day: "Пятница", time: "17:00", duration: 90, room: "203", students: [1, 3] },
  { id: 4, subject: "Portfolio Workshop", teacherId: 3, day: "Вторник", time: "16:00", duration: 120, room: "Studio", students: [2] },
  { id: 5, subject: "Academic Writing", teacherId: 1, day: "Четверг", time: "15:30", duration: 90, room: "201", students: [1, 2, 3] }
];

const initialMockTests = [
  { id: 1, type: "ielts", name: "Пробный IELTS", date: "2024-12-14", time: "10:00", room: "301", students: [1, 2, 3] },
  { id: 2, type: "sat", name: "Пробный SAT", date: "2024-12-21", time: "09:00", room: "302", students: [1, 3] },
  { id: 3, type: "ielts", name: "Пробный IELTS", date: "2025-01-11", time: "10:00", room: "301", students: [1, 2, 3] },
  { id: 4, type: "sat", name: "Пробный SAT", date: "2025-01-18", time: "09:00", room: "302", students: [1, 3] }
];

const initialInternships = [
  { id: 1, name: "Google Summer of Code", country: "США", deadline: "2025-03-15", type: "IT", requirements: "IELTS 7.0+" },
  { id: 2, name: "CERN Summer Student", country: "Швейцария", deadline: "2025-01-25", type: "Наука", requirements: "IELTS 6.5+" },
  { id: 3, name: "Design Week Milan", country: "Италия", deadline: "2025-02-28", type: "Дизайн", requirements: "Portfolio" },
  { id: 4, name: "UN Youth Programme", country: "Швейцария", deadline: "2025-04-01", type: "Международные отношения", requirements: "IELTS 7.5+" },
  { id: 5, name: "BMW Group Internship", country: "Германия", deadline: "2025-03-01", type: "Инженерия", requirements: "IELTS 6.5+" }
];

// ========== ИКОНКИ ==========
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Test: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Results: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Documents: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Support: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Money: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Letters: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  MockTest: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
};

// ========== ГЛАВНЫЙ КОМПОНЕНТ ==========
export default function NobilisAcademy() {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [mockTests, setMockTests] = useState(initialMockTests);
  const [internships, setInternships] = useState(initialInternships);
  const [supportTickets, setSupportTickets] = useState([
    { id: 1, studentId: 3, studentName: "Дмитрий Козлов", message: "Не могу зайти в личный кабинет", priority: "high", created: "2024-12-10T10:30:00", deadline: "2024-12-12T10:30:00", status: "open" }
  ]);
  
  // Modals & Forms
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [testAnswers, setTestAnswers] = useState({});
  const [supportMessage, setSupportMessage] = useState('');
  
  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', phone: '', age: '', grade: '', 
    parentName: '', parentPhone: '', login: '', password: '',
    deadlineIelts: '', deadlineSat: '', contractEnd: ''
  });
  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', phone: '', subject: '', hourlyRate: '', login: '', password: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: []
  });
  const [documentForm, setDocumentForm] = useState({ type: '', name: '', score: '' });
  const [syllabusForm, setSyllabusForm] = useState({ course: '', weeks: '', topics: '' });

  // ========== АВТОРИЗАЦИЯ ==========
  const handleLogin = () => {
    const { login, password } = loginForm;
    
    if (login === 'curator' && password === 'curator2024') {
      setCurrentUser({ role: 'curator', name: 'Куратор Мария', email: 'maria@nobilis.edu' });
      return;
    }
    
    const student = students.find(s => s.login === login && s.password === password);
    if (student) { setCurrentUser({ role: 'student', ...student }); return; }
    
    const teacher = teachers.find(t => t.login === login && t.password === password);
    if (teacher) { setCurrentUser({ role: 'teacher', ...teacher }); return; }
    
    setLoginError('Неверный логин или пароль');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ login: '', password: '' });
    setLoginError('');
    setCurrentView('dashboard');
  };

  // ========== ТЕСТ ПРОФОРИЕНТАЦИИ ==========
  const calculateTestResult = () => {
    const traitCounts = {};
    Object.values(testAnswers).forEach(answer => {
      answer.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    });
    
    let bestProfile = null;
    let bestScore = 0;
    Object.entries(careerProfiles).forEach(([name, profile]) => {
      const score = profile.traits.reduce((sum, trait) => sum + (traitCounts[trait] || 0), 0);
      if (score > bestScore) { bestScore = score; bestProfile = name; }
    });
    return bestProfile;
  };

  const handleTestSubmit = () => {
    const result = calculateTestResult();
    if (currentUser.role === 'student') {
      setStudents(prev => prev.map(s => s.id === currentUser.id ? { ...s, testResult: result } : s));
      setCurrentUser(prev => ({ ...prev, testResult: result }));
    }
    setTestAnswers({});
  };

  // ========== CRUD ОПЕРАЦИИ ==========
  const addStudent = () => {
    const newStudent = {
      id: Date.now(),
      name: studentForm.name,
      login: studentForm.login,
      password: studentForm.password,
      email: studentForm.email,
      phone: studentForm.phone,
      age: parseInt(studentForm.age) || 16,
      grade: studentForm.grade,
      joinDate: new Date().toISOString().split('T')[0],
      contractEndDate: studentForm.contractEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      parentName: studentForm.parentName,
      parentPhone: studentForm.parentPhone,
      testResult: null,
      selectedCountries: [],
      targetUniversities: [],
      deadlines: { ielts: studentForm.deadlineIelts, sat: studentForm.deadlineSat },
      examResults: [],
      attendance: { total: 0, attended: 0 },
      documents: [{ type: 'contract', name: 'Договор на обучение', date: new Date().toISOString().split('T')[0] }],
      internships: [],
      letters: { motivation: [], recommendation: [] }
    };
    setStudents(prev => [...prev, newStudent]);
    resetStudentForm();
    setModal(null);
  };

  const addTeacher = () => {
    const newTeacher = {
      id: Date.now(),
      name: teacherForm.name,
      login: teacherForm.login,
      password: teacherForm.password,
      email: teacherForm.email,
      phone: teacherForm.phone,
      subject: teacherForm.subject,
      hourlyRate: parseInt(teacherForm.hourlyRate) || 2000,
      hoursWorked: 0,
      totalLessons: 0,
      attendance: [],
      syllabus: []
    };
    setTeachers(prev => [...prev, newTeacher]);
    resetTeacherForm();
    setModal(null);
  };

  const addScheduleItem = () => {
    const newItem = {
      id: Date.now(),
      subject: scheduleForm.subject,
      teacherId: scheduleForm.teacherId ? parseInt(scheduleForm.teacherId) : null,
      day: scheduleForm.day,
      time: scheduleForm.time,
      duration: parseInt(scheduleForm.duration) || 90,
      room: scheduleForm.room,
      students: scheduleForm.students,
      isCurator: !scheduleForm.teacherId
    };
    setSchedule(prev => [...prev, newItem]);
    resetScheduleForm();
    setModal(null);
  };

  const updateScheduleItem = () => {
    setSchedule(prev => prev.map(s => s.id === selectedItem.id ? {
      ...s,
      subject: scheduleForm.subject,
      teacherId: scheduleForm.teacherId ? parseInt(scheduleForm.teacherId) : null,
      day: scheduleForm.day,
      time: scheduleForm.time,
      duration: parseInt(scheduleForm.duration) || 90,
      room: scheduleForm.room,
      students: scheduleForm.students
    } : s));
    resetScheduleForm();
    setModal(null);
    setSelectedItem(null);
  };

  const deleteScheduleItem = (id) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const addDocument = () => {
    const newDoc = {
      type: documentForm.type,
      name: documentForm.name || documentTypes[documentForm.type]?.label,
      date: new Date().toISOString().split('T')[0],
      score: documentForm.score || undefined
    };
    
    setStudents(prev => prev.map(s => s.id === selectedItem.id ? {
      ...s,
      documents: [...(s.documents || []), newDoc],
      examResults: documentTypes[documentForm.type]?.isExam ? [
        ...(s.examResults || []),
        { type: documentForm.type, name: documentTypes[documentForm.type]?.label, score: documentForm.score, date: new Date().toISOString().split('T')[0] }
      ] : s.examResults
    } : s));
    
    setSelectedItem(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }));
    
    resetDocumentForm();
    setModal('studentDetail');
  };

  const addSyllabus = () => {
    const newSyllabus = {
      id: Date.now(),
      course: syllabusForm.course,
      weeks: parseInt(syllabusForm.weeks) || 12,
      topics: syllabusForm.topics.split(',').map(t => t.trim()),
      progress: 0
    };
    
    setTeachers(prev => prev.map(t => t.id === currentUser.id ? {
      ...t,
      syllabus: [...(t.syllabus || []), newSyllabus]
    } : t));
    
    setCurrentUser(prev => ({
      ...prev,
      syllabus: [...(prev.syllabus || []), newSyllabus]
    }));
    
    setSyllabusForm({ course: '', weeks: '', topics: '' });
    setModal(null);
  };

  const submitSupport = () => {
    if (!supportMessage.trim()) return;
    const newTicket = {
      id: Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      message: supportMessage,
      priority: 'normal',
      created: new Date().toISOString(),
      deadline: new Date(Date.now() + 48*60*60*1000).toISOString(),
      status: 'open'
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    setSupportMessage('');
    setModal(null);
  };

  const resolveTicket = (id) => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };

  // Reset forms
  const resetStudentForm = () => setStudentForm({ name: '', email: '', phone: '', age: '', grade: '', parentName: '', parentPhone: '', login: '', password: '', deadlineIelts: '', deadlineSat: '', contractEnd: '' });
  const resetTeacherForm = () => setTeacherForm({ name: '', email: '', phone: '', subject: '', hourlyRate: '', login: '', password: '' });
  const resetScheduleForm = () => setScheduleForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] });
  const resetDocumentForm = () => setDocumentForm({ type: '', name: '', score: '' });

  // ========== НАВИГАЦИЯ ==========
  const getNavItems = () => {
    if (currentUser?.role === 'student') {
      return [
        { id: 'dashboard', label: 'Главная', icon: Icons.Dashboard },
        { id: 'schedule', label: 'Расписание', icon: Icons.Calendar },
        { id: 'test', label: 'Профориентация', icon: Icons.Test },
        { id: 'results', label: 'Результаты', icon: Icons.Results },
        { id: 'mockTests', label: 'Пробные тесты', icon: Icons.MockTest },
        { id: 'letters', label: 'Письма', icon: Icons.Letters },
        { id: 'internships', label: 'Стажировки', icon: Icons.Briefcase },
        { id: 'documents', label: 'Документы', icon: Icons.Documents }
      ];
    } else if (currentUser?.role === 'curator') {
      return [
        { id: 'dashboard', label: 'Главная', icon: Icons.Dashboard },
        { id: 'students', label: 'Ученики', icon: Icons.Users },
        { id: 'attendance', label: 'Посещаемость', icon: Icons.Check },
        { id: 'schedule', label: 'Расписание', icon: Icons.Calendar },
        { id: 'mockTests', label: 'Пробные тесты', icon: Icons.MockTest },
        { id: 'teachers', label: 'Преподаватели', icon: Icons.Users },
        { id: 'salary', label: 'Зарплаты', icon: Icons.Money },
        { id: 'support', label: 'Поддержка', icon: Icons.Support },
        { id: 'internships', label: 'Стажировки', icon: Icons.Briefcase }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Главная', icon: Icons.Dashboard },
        { id: 'schedule', label: 'Моё расписание', icon: Icons.Calendar },
        { id: 'students', label: 'Мои ученики', icon: Icons.Users },
        { id: 'syllabus', label: 'Силлабус', icon: Icons.Book }
      ];
    }
  };

  // ========== ЭКРАН ВХОДА ==========
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #0f2a22 100%)' }}>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 border border-[#c9a227]/30 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-[#c9a227]/20 rounded-full"></div>
        </div>
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-[#c9a227]/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center border-2 border-[#c9a227]" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}>
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#1a3a32]">
                <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="3"/>
                <path d="M30 60 Q50 30 70 60" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="35" r="8" fill="currentColor"/>
                <path d="M35 75 L50 85 L65 75" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide">NOBILIS</h1>
            <p className="text-[#c9a227] text-sm tracking-widest mt-1">ACADEMY</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#c9a227]/80 mb-1">Логин</label>
              <input 
                type="text" 
                value={loginForm.login}
                onChange={(e) => { setLoginForm(prev => ({ ...prev, login: e.target.value })); setLoginError(''); }}
                className="w-full p-3 bg-white/10 border border-[#c9a227]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c9a227]"
                placeholder="Введите логин"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm text-[#c9a227]/80 mb-1">Пароль</label>
              <input 
                type="password"
                value={loginForm.password}
                onChange={(e) => { setLoginForm(prev => ({ ...prev, password: e.target.value })); setLoginError(''); }}
                className="w-full p-3 bg-white/10 border border-[#c9a227]/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c9a227]"
                placeholder="Введите пароль"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-semibold transition-all text-[#1a3a32]"
              style={{ background: 'linear-gradient(135deg, #c9a227 0%, #e8c547 100%)' }}
            >
              Войти
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[#c9a227]/20">
            <p className="text-xs text-[#c9a227]/60 text-center mb-3">Демо-доступ:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button onClick={() => setLoginForm({ login: 'curator', password: 'curator2024' })} className="p-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/30 border border-[#c9a227]/30 rounded-lg text-[#c9a227]">Куратор</button>
              <button onClick={() => setLoginForm({ login: 'alexey.p42', password: 'Nobilis2024!' })} className="p-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/30 border border-[#c9a227]/30 rounded-lg text-[#c9a227]">Ученик</button>
              <button onClick={() => setLoginForm({ login: 'smirnova.av', password: 'Teacher2024!' })} className="p-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/30 border border-[#c9a227]/30 rounded-lg text-[#c9a227]">Препод</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== ОСНОВНОЙ КОНТЕНТ ==========
  const renderContent = () => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    // ===== УЧЕНИК =====
    if (currentUser.role === 'student') {
      const student = students.find(s => s.id === currentUser.id) || currentUser;
      const daysWithUs = daysBetween(student.joinDate, new Date());
      const daysLeft = daysBetween(new Date(), student.contractEndDate);
      
      if (currentView === 'dashboard') {
        return (
          <div className="space-y-6">
            {/* Баннер дней */}
            <div className="rounded-2xl p-4 text-center text-white" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' }}>
              {daysWithUs <= 1 ? (
                <span className="text-lg">🎉 <span className="text-[#c9a227]">Первый день</span> с Nobilis Academy!</span>
              ) : (
                <span className="text-lg">📅 <span className="text-[#c9a227]">{daysWithUs} дней</span> вместе • <span className="text-[#c9a227]">{daysLeft} дней</span> до конца программы</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Добро пожаловать, {student.name.split(' ')[0]}! 👋</h2>
                <p className="text-gray-500">Твой путь к успеху</p>
              </div>
              <button onClick={() => setModal('support')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#1a3a32]" style={{ background: '#c9a227' }}>
                <Icons.Support /> Поддержка
              </button>
            </div>
            
            {/* Дедлайны */}
            {Object.values(student.deadlines || {}).some(d => d && daysBetween(new Date(), d) <= 60 && daysBetween(new Date(), d) > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Приближающиеся дедлайны</h3>
                {Object.entries(student.deadlines || {}).map(([key, date]) => {
                  if (!date) return null;
                  const days = daysBetween(new Date(), date);
                  if (days <= 0 || days > 60) return null;
                  return <div key={key} className="text-sm text-red-700">{key.toUpperCase()}: {days} дней ({date})</div>;
                })}
              </div>
            )}
            
            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Посещаемость</div>
                <div className="text-3xl font-bold">{Math.round((student.attendance?.attended / student.attendance?.total) * 100 || 0)}%</div>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Лучший IELTS</div>
                <div className="text-3xl font-bold">{student.examResults?.filter(e => e.type === 'ielts').sort((a, b) => parseFloat(b.score) - parseFloat(a.score))[0]?.score || '—'}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-purple-500 to-purple-700">
                <div className="text-white/70 text-sm mb-1">Профиль</div>
                <div className="text-sm font-bold truncate">{student.testResult || 'Пройдите тест'}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-700">
                <div className="text-white/70 text-sm mb-1">Цель</div>
                <div className="text-sm font-bold truncate">{student.targetUniversities?.[0] || '—'}</div>
              </div>
            </div>
            
            {/* Расписание */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">📚 Ближайшие занятия</h3>
              <div className="space-y-3">
                {schedule.filter(s => s.students?.includes(student.id)).slice(0, 3).map(cls => {
                  const teacher = teachers.find(t => t.id === cls.teacherId);
                  return (
                    <div key={cls.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold" style={{ background: '#1a3a32' }}>
                        {cls.day.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{cls.subject}</div>
                        <div className="text-sm text-gray-500">{teacher?.name || 'Куратор'} • {cls.time}</div>
                      </div>
                      <span className="text-sm text-gray-400">Каб. {cls.room}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'schedule') {
        const mySchedule = schedule.filter(s => s.students?.includes(student.id));
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Моё расписание</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
              <div className="grid grid-cols-6 gap-3 min-w-[700px]">
                {days.map(day => (
                  <div key={day}>
                    <div className="text-center font-semibold text-gray-700 mb-3 pb-2 border-b text-sm">{day}</div>
                    <div className="space-y-2">
                      {mySchedule.filter(s => s.day === day).map(cls => (
                        <div key={cls.id} className="p-3 rounded-xl border" style={{ background: '#f0f4f2', borderColor: '#c9a227' }}>
                          <div className="font-medium text-sm" style={{ color: '#1a3a32' }}>{cls.subject}</div>
                          <div className="text-xs mt-1" style={{ color: '#c9a227' }}>{cls.time}</div>
                          <div className="text-xs text-gray-500 mt-1">Каб. {cls.room}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'test') {
        if (student.testResult) {
          const profile = careerProfiles[student.testResult];
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Результат профориентации</h2>
              <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl" style={{ background: profile?.color + '20' }}>🎯</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: profile?.color }}>{student.testResult}</h3>
                <p className="text-gray-600 max-w-xl mx-auto mb-6">{profile?.description}</p>
                <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold mb-3">💼 Профессии</h4>
                    <div className="flex flex-wrap gap-2">{profile?.careers.map((c, i) => <span key={i} className="px-3 py-1 bg-white rounded-full text-sm border">{c}</span>)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold mb-3">🎓 Университеты</h4>
                    <div className="flex flex-wrap gap-2">{profile?.universities.map((u, i) => <span key={i} className="px-3 py-1 bg-white rounded-full text-sm border">{u}</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Профориентационный тест</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Прогресс</span>
                  <span>{Object.keys(testAnswers).length} / {careerTestQuestions.length}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${(Object.keys(testAnswers).length / careerTestQuestions.length) * 100}%`, background: '#c9a227' }}/>
                </div>
              </div>
              
              <div className="space-y-6">
                {careerTestQuestions.map((q, i) => (
                  <div key={q.id} className="p-5 bg-gray-50 rounded-xl">
                    <div className="font-medium text-gray-800 mb-3">{i + 1}. {q.question}</div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {q.options.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-3 rounded-lg text-left text-sm transition-all ${testAnswers[q.id] === opt ? 'text-white' : 'bg-white border text-gray-700 hover:border-[#c9a227]'}`}
                          style={testAnswers[q.id] === opt ? { background: '#1a3a32' } : {}}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(testAnswers).length === careerTestQuestions.length && (
                <button onClick={handleTestSubmit} className="mt-6 w-full py-4 rounded-xl font-semibold text-[#1a3a32]" style={{ background: '#c9a227' }}>
                  Получить результат 🎯
                </button>
              )}
            </div>
          </div>
        );
      }
      
      if (currentView === 'results') {
        const official = student.examResults?.filter(e => !e.type.includes('mock')) || [];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Результаты экзаменов</h2>
            {official.length > 0 ? (
              <div className="space-y-4">
                {official.map((exam, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' }}>
                        {exam.score}
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-semibold">{exam.name}</div>
                        <div className="text-gray-500">{exam.date}</div>
                      </div>
                    </div>
                    {exam.breakdown && (
                      <div className="mt-4 grid grid-cols-4 gap-3">
                        {Object.entries(exam.breakdown).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-xs text-gray-500 capitalize">{k}</div>
                            <div className="text-lg font-semibold">{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500">Результаты появятся после сдачи экзаменов</p>
              </div>
            )}
          </div>
        );
      }
      
      if (currentView === 'mockTests') {
        const mocks = student.examResults?.filter(e => e.type.includes('mock')) || [];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Пробные тесты</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">📅 Расписание</h3>
              <div className="space-y-3">
                {mockTests.filter(t => t.students?.includes(student.id)).map(test => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-semibold">
                        {test.type === 'ielts' ? 'IE' : 'SAT'}
                      </div>
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-500">{test.date} • {test.time}</div>
                      </div>
                    </div>
                    <span className="text-sm text-purple-600">Каб. {test.room}</span>
                  </div>
                ))}
              </div>
            </div>
            {mocks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-4">📊 История</h3>
                <div className="space-y-3">
                  {mocks.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-sm text-gray-500">{m.date}</div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{m.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      if (currentView === 'letters') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Письма</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-4">💌 Мотивационные</h3>
                {student.letters?.motivation?.length > 0 ? (
                  <div className="space-y-3">
                    {student.letters.motivation.map(l => (
                      <div key={l.id} className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{l.university}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {l.status === 'completed' ? 'Готово' : 'Черновик'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{l.lastEdit}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">Нет писем</p>}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-4">📝 Рекомендательные</h3>
                {student.letters?.recommendation?.length > 0 ? (
                  <div className="space-y-3">
                    {student.letters.recommendation.map(l => (
                      <div key={l.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{l.author}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {l.status === 'completed' ? 'Получено' : 'Запрошено'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{l.subject}</div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500 text-sm">Нет писем</p>}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'internships') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Стажировки</h2>
            {student.internships?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-4">🎯 Мои заявки</h3>
                <div className="space-y-3">
                  {student.internships.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f0f4f2' }}>
                      <div className="flex-1">
                        <div className="font-medium">{i.name}</div>
                        <div className="text-sm text-gray-500">{i.country}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${i.status === 'accepted' ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                        {i.status === 'accepted' ? 'Принята' : 'Подана'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">🌍 Доступные</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {internships.map(i => (
                  <div key={i.id} className="p-4 bg-gray-50 rounded-xl border hover:border-[#c9a227] transition-colors">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{i.name}</div>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1a3a32', color: '#c9a227' }}>{i.country}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{i.type}</div>
                    <div className="text-xs text-gray-400 mb-2">{i.requirements}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-500">Дедлайн: {i.deadline}</span>
                      <button className="text-sm font-medium" style={{ color: '#c9a227' }}>Подать →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'documents') {
        const grouped = {};
        student.documents?.forEach(d => { if (!grouped[d.type]) grouped[d.type] = []; grouped[d.type].push(d); });
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Мои документы</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(grouped).map(([type, docs]) => (
                <div key={type} className="bg-white rounded-2xl p-5 shadow-sm border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{documentTypes[type]?.icon || '📄'}</span>
                    <h3 className="font-semibold">{documentTypes[type]?.label || type}</h3>
                    <span className="ml-auto px-2 py-1 bg-gray-100 rounded-full text-sm">{docs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {docs.map((d, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium truncate">{d.name}</span>
                          {d.score && <span className="ml-2 px-2 py-1 rounded text-xs font-medium" style={{ background: '#1a3a32', color: '#c9a227' }}>{d.score}</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{d.date}</div>
                        {d.type === 'invitation' && (
                          <div className="mt-2 p-2 rounded-lg text-xs" style={{ background: '#c9a227', color: '#1a3a32' }}>
                            {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    // ===== КУРАТОР =====
    if (currentUser.role === 'curator') {
      if (currentView === 'dashboard') {
        const openTickets = supportTickets.filter(t => t.status === 'open').sort((a, b) => (a.priority === 'high' ? -1 : 1));
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Панель куратора</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Учеников</div>
                <div className="text-3xl font-bold">{students.length}</div>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Прошли тест</div>
                <div className="text-3xl font-bold">{students.filter(s => s.testResult).length}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-700">
                <div className="text-white/70 text-sm mb-1">Преподавателей</div>
                <div className="text-3xl font-bold">{teachers.length}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-red-500 to-red-700">
                <div className="text-white/70 text-sm mb-1">Заявок</div>
                <div className="text-3xl font-bold">{openTickets.length}</div>
              </div>
            </div>
            
            {openTickets.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-semibold mb-4">🔔 Заявки (48ч дедлайн)</h3>
                <div className="space-y-3">
                  {openTickets.slice(0, 3).map(ticket => {
                    const hoursLeft = Math.max(0, Math.ceil((new Date(ticket.deadline) - new Date()) / (1000 * 60 * 60)));
                    return (
                      <div key={ticket.id} className={`p-4 rounded-xl border ${ticket.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{ticket.studentName}</span>
                          <span className={`text-sm ${hoursLeft < 12 ? 'text-red-600' : 'text-amber-600'}`}>{hoursLeft}ч</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{ticket.message}</p>
                        <button onClick={() => resolveTicket(ticket.id)} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">Решено</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      if (currentView === 'students') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Ученики</h2>
              <button onClick={() => {
                const login = generateLogin('Новый Ученик');
                setStudentForm(prev => ({ ...prev, login, password: generatePassword() }));
                setModal('addStudent');
              }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Добавить
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">Ученик</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Логин</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Дни</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Профиль</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: '#1a3a32' }}>
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-sm text-gray-500">{s.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><code className="text-sm bg-gray-100 px-2 py-1 rounded">{s.login}</code></td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs" style={{ background: daysBetween(s.joinDate, new Date()) <= 7 ? '#c9a227' : '#1a3a32', color: 'white' }}>
                            {daysBetween(s.joinDate, new Date())} дн
                          </span>
                        </td>
                        <td className="p-4">
                          {s.testResult ? (
                            <span className="text-sm" style={{ color: careerProfiles[s.testResult]?.color }}>{s.testResult.split(' ')[0]}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedItem(s); setModal('studentDetail'); }} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: '#1a3a32' }}><Icons.Eye /></button>
                            <button onClick={() => { setSelectedItem(s); setModal('addDocument'); }} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: '#c9a227' }}><Icons.Plus /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'attendance') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Посещаемость</h2>
            {schedule.map(cls => {
              const teacher = teachers.find(t => t.id === cls.teacherId);
              return (
                <div key={cls.id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{cls.subject}</h3>
                      <p className="text-sm text-gray-500">{cls.day} • {cls.time} • {teacher?.name || 'Куратор'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {students.filter(s => cls.students?.includes(s.id)).map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: '#1a3a32' }}>
                            {s.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">✓ Был</button>
                          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">✗ Не был</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      
      if (currentView === 'schedule') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Расписание</h2>
              <button onClick={() => { resetScheduleForm(); setModal('addSchedule'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Добавить
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Предмет</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Преподаватель</th>
                    <th className="text-left p-4 font-semibold text-gray-700">День</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Время</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Каб.</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Учеников</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map(cls => {
                    const teacher = teachers.find(t => t.id === cls.teacherId);
                    return (
                      <tr key={cls.id} className="border-t hover:bg-gray-50">
                        <td className="p-4 font-medium">{cls.subject}</td>
                        <td className="p-4 text-gray-600">{teacher?.name || 'Куратор'}</td>
                        <td className="p-4 text-gray-600">{cls.day}</td>
                        <td className="p-4 text-gray-600">{cls.time}</td>
                        <td className="p-4 text-gray-600">{cls.room}</td>
                        <td className="p-4 text-gray-600">{cls.students?.length || 0}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => {
                              setSelectedItem(cls);
                              setScheduleForm({
                                subject: cls.subject,
                                teacherId: cls.teacherId || '',
                                day: cls.day,
                                time: cls.time,
                                duration: cls.duration,
                                room: cls.room,
                                students: cls.students || []
                              });
                              setModal('editSchedule');
                            }} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: '#1a3a32' }}><Icons.Edit /></button>
                            <button onClick={() => deleteScheduleItem(cls.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Icons.Trash /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      
      if (currentView === 'mockTests') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Пробные тесты</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Запланировать
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="space-y-3">
                {mockTests.map(test => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-purple-700 font-semibold">
                        {test.type === 'ielts' ? 'IE' : 'SAT'}
                      </div>
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-gray-500">{test.date} • {test.time} • {test.students?.length || 0} учеников</div>
                      </div>
                    </div>
                    <button className="font-medium text-sm" style={{ color: '#1a3a32' }}>Редактировать</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'teachers') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Преподаватели</h2>
              <button onClick={() => {
                const login = generateLogin('Новый Препод');
                setTeacherForm(prev => ({ ...prev, login, password: generatePassword() }));
                setModal('addTeacher');
              }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Добавить
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {teachers.map(t => (
                <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#c9a227' }}>
                      {t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.subject}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500">Логин</div>
                      <code className="font-medium">{t.login}</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-gray-500">Ставка</div>
                      <div className="font-medium">{t.hourlyRate} ₸/час</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (currentView === 'salary') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Зарплаты</h2>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Преподаватель</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Ставка</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Часов</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Уроков</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id} className="border-t">
                      <td className="p-4">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-gray-500">{t.subject}</div>
                      </td>
                      <td className="p-4">{t.hourlyRate.toLocaleString()} ₸</td>
                      <td className="p-4">{t.hoursWorked}</td>
                      <td className="p-4">{t.totalLessons}</td>
                      <td className="p-4">
                        <span className="text-lg font-bold" style={{ color: '#1a3a32' }}>{(t.hourlyRate * t.hoursWorked).toLocaleString()} ₸</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="p-4 font-semibold">Итого:</td>
                    <td className="p-4 text-xl font-bold" style={{ color: '#1a3a32' }}>
                      {teachers.reduce((sum, t) => sum + t.hourlyRate * t.hoursWorked, 0).toLocaleString()} ₸
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      }
      
      if (currentView === 'support') {
        const sorted = [...supportTickets].sort((a, b) => {
          if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
          if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
          return 0;
        });
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Поддержка</h2>
            <div className="space-y-4">
              {sorted.map(t => {
                const hoursLeft = Math.max(0, Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60)));
                const isOverdue = hoursLeft <= 0 && t.status === 'open';
                return (
                  <div key={t.id} className={`bg-white rounded-2xl p-5 shadow-sm border ${t.status === 'resolved' ? 'opacity-60' : isOverdue ? 'border-red-300 bg-red-50' : t.priority === 'high' ? 'border-amber-300' : ''}`}>
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {t.priority === 'high' && t.status === 'open' && <span className="text-red-500">⚠️</span>}
                        <span className="font-semibold">{t.studentName}</span>
                      </div>
                      {t.status === 'open' ? (
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                          {isOverdue ? 'Просрочено!' : `${hoursLeft}ч осталось`}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Решено</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">{t.message}</p>
                    {t.status === 'open' && (
                      <button onClick={() => resolveTicket(t.id)} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">✓ Решено</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      
      if (currentView === 'internships') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Стажировки</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Добавить
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Название</th>
                    <th className="text-left p-4 font-semibold">Страна</th>
                    <th className="text-left p-4 font-semibold">Требования</th>
                    <th className="text-left p-4 font-semibold">Дедлайн</th>
                    <th className="text-left p-4 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map(i => (
                    <tr key={i.id} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{i.name}</td>
                      <td className="p-4">{i.country}</td>
                      <td className="p-4">{i.requirements}</td>
                      <td className="p-4">{i.deadline}</td>
                      <td className="p-4">
                        <button className="text-sm font-medium" style={{ color: '#1a3a32' }}>Назначить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }
    
    // ===== ПРЕПОДАВАТЕЛЬ =====
    if (currentUser.role === 'teacher') {
      const teacher = teachers.find(t => t.id === currentUser.id) || currentUser;
      const myClasses = schedule.filter(s => s.teacherId === currentUser.id);
      const myStudentIds = [...new Set(myClasses.flatMap(c => c.students || []))];
      const myStudents = students.filter(s => myStudentIds.includes(s.id));
      
      if (currentView === 'dashboard') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Добро пожаловать, {currentUser.name.split(' ')[0]}!</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Часов</div>
                <div className="text-3xl font-bold">{teacher.hoursWorked}</div>
              </div>
              <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' }}>
                <div className="text-white/70 text-sm mb-1">Уроков</div>
                <div className="text-3xl font-bold">{teacher.totalLessons}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-blue-500 to-blue-700">
                <div className="text-white/70 text-sm mb-1">Занятий/нед</div>
                <div className="text-3xl font-bold">{myClasses.length}</div>
              </div>
              <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-purple-500 to-purple-700">
                <div className="text-white/70 text-sm mb-1">Учеников</div>
                <div className="text-3xl font-bold">{myStudents.length}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">📚 Сегодняшние занятия</h3>
              {myClasses.filter(c => c.day === 'Среда').length > 0 ? (
                <div className="space-y-3">
                  {myClasses.filter(c => c.day === 'Среда').map(cls => (
                    <div key={cls.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f0f4f2' }}>
                      <div className="flex-1">
                        <div className="font-medium">{cls.subject}</div>
                        <div className="text-sm text-gray-500">{cls.time} • Каб. {cls.room}</div>
                      </div>
                      <span className="text-sm" style={{ color: '#c9a227' }}>{cls.students?.length} учеников</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Сегодня занятий нет</p>
              )}
            </div>
          </div>
        );
      }
      
      if (currentView === 'schedule') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Моё расписание</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border overflow-x-auto">
              <div className="grid grid-cols-6 gap-3 min-w-[700px]">
                {days.map(day => (
                  <div key={day}>
                    <div className="text-center font-semibold text-gray-700 mb-3 pb-2 border-b text-sm">{day}</div>
                    <div className="space-y-2">
                      {myClasses.filter(s => s.day === day).map(cls => (
                        <div key={cls.id} className="p-3 rounded-xl" style={{ background: '#f0f4f2', border: '1px solid #c9a227' }}>
                          <div className="font-medium text-sm" style={{ color: '#1a3a32' }}>{cls.subject}</div>
                          <div className="text-xs mt-1" style={{ color: '#c9a227' }}>{cls.time}</div>
                          <div className="text-xs text-gray-500 mt-1">{cls.students?.length} уч. • Каб. {cls.room}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      if (currentView === 'students') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Мои ученики</h2>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Ученик</th>
                    <th className="text-left p-4 font-semibold">Класс</th>
                    <th className="text-left p-4 font-semibold">Посещаемость</th>
                    <th className="text-left p-4 font-semibold">Результат</th>
                  </tr>
                </thead>
                <tbody>
                  {myStudents.map(s => {
                    const lastExam = s.examResults?.[s.examResults.length - 1];
                    return (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: '#c9a227' }}>
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium">{s.name}</div>
                              <div className="text-sm text-gray-500">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{s.grade}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full" style={{ width: `${(s.attendance?.attended / s.attendance?.total) * 100 || 0}%`, background: '#1a3a32' }}/>
                            </div>
                            <span className="text-sm text-gray-500">{Math.round((s.attendance?.attended / s.attendance?.total) * 100 || 0)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {lastExam ? (
                            <span className="px-2 py-1 rounded text-sm" style={{ background: '#1a3a32', color: '#c9a227' }}>
                              {lastExam.name}: {lastExam.score}
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      
      if (currentView === 'syllabus') {
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Силлабус</h2>
              <button onClick={() => setModal('addSyllabus')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white" style={{ background: '#1a3a32' }}>
                <Icons.Plus /> Добавить курс
              </button>
            </div>
            
            <div className="space-y-4">
              {teacher.syllabus?.map(course => (
                <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{course.course}</h3>
                      <p className="text-sm text-gray-500">{course.weeks} недель</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: '#c9a227' }}>{course.progress}%</div>
                      <div className="text-xs text-gray-500">прогресс</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${course.progress}%`, background: '#c9a227' }}/>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Темы:</div>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.map((t, i) => <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    return null;
  };

  // ========== МОДАЛЬНЫЕ ОКНА ==========
  const renderModal = () => {
    if (!modal) return null;
    
    const closeModal = () => { setModal(null); setSelectedItem(null); };
    
    const ModalWrapper = ({ children, title }) => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
            <h3 className="text-xl font-bold">{title}</h3>
            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><Icons.Close /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
    
    // Добавить ученика
    if (modal === 'addStudent') {
      return (
        <ModalWrapper title="Добавить ученика">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ФИО *</label>
              <input 
                type="text" 
                value={studentForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setStudentForm(prev => ({ ...prev, name, login: generateLogin(name || 'student') }));
                }}
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-[#c9a227]" 
                placeholder="Иванов Иван"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Логин</label>
                <div className="flex gap-2">
                  <input type="text" value={studentForm.login} onChange={e => setStudentForm(prev => ({ ...prev, login: e.target.value }))} className="flex-1 p-3 border rounded-xl font-mono text-sm"/>
                  <button onClick={() => navigator.clipboard.writeText(studentForm.login)} className="p-3 border rounded-xl hover:bg-gray-50"><Icons.Copy /></button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Пароль</label>
                <div className="flex gap-2">
                  <input type="text" value={studentForm.password} onChange={e => setStudentForm(prev => ({ ...prev, password: e.target.value }))} className="flex-1 p-3 border rounded-xl font-mono text-sm"/>
                  <button onClick={() => setStudentForm(prev => ({ ...prev, password: generatePassword() }))} className="p-3 border rounded-xl hover:bg-gray-50"><Icons.Refresh /></button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Возраст</label>
                <input type="number" value={studentForm.age} onChange={e => setStudentForm(prev => ({ ...prev, age: e.target.value }))} className="w-full p-3 border rounded-xl"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Класс</label>
                <input type="text" value={studentForm.grade} onChange={e => setStudentForm(prev => ({ ...prev, grade: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="10 класс"/>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={studentForm.email} onChange={e => setStudentForm(prev => ({ ...prev, email: e.target.value }))} className="w-full p-3 border rounded-xl"/>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Телефон</label>
              <input type="tel" value={studentForm.phone} onChange={e => setStudentForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full p-3 border rounded-xl"/>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ФИО родителя</label>
              <input type="text" value={studentForm.parentName} onChange={e => setStudentForm(prev => ({ ...prev, parentName: e.target.value }))} className="w-full p-3 border rounded-xl"/>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Телефон родителя</label>
              <input type="tel" value={studentForm.parentPhone} onChange={e => setStudentForm(prev => ({ ...prev, parentPhone: e.target.value }))} className="w-full p-3 border rounded-xl"/>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Дедлайны</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">IELTS</label>
                  <input type="date" value={studentForm.deadlineIelts} onChange={e => setStudentForm(prev => ({ ...prev, deadlineIelts: e.target.value }))} className="w-full p-3 border rounded-xl"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">SAT</label>
                  <input type="date" value={studentForm.deadlineSat} onChange={e => setStudentForm(prev => ({ ...prev, deadlineSat: e.target.value }))} className="w-full p-3 border rounded-xl"/>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Срок договора до</label>
              <input type="date" value={studentForm.contractEnd} onChange={e => setStudentForm(prev => ({ ...prev, contractEnd: e.target.value }))} className="w-full p-3 border rounded-xl"/>
            </div>
            
            <div className="rounded-xl p-4 text-sm" style={{ background: '#f0f4f2' }}>
              <p className="font-medium" style={{ color: '#1a3a32' }}>Данные для входа:</p>
              <p className="mt-1">Логин: <code className="px-1 rounded" style={{ background: '#c9a227' }}>{studentForm.login}</code></p>
              <p>Пароль: <code className="px-1 rounded" style={{ background: '#c9a227' }}>{studentForm.password}</code></p>
            </div>
            
            <button onClick={addStudent} disabled={!studentForm.name} className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: '#1a3a32' }}>
              Создать аккаунт
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    // Добавить преподавателя
    if (modal === 'addTeacher') {
      return (
        <ModalWrapper title="Добавить преподавателя">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ФИО *</label>
              <input 
                type="text" 
                value={teacherForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setTeacherForm(prev => ({ ...prev, name, login: generateLogin(name || 'teacher') }));
                }}
                className="w-full p-3 border rounded-xl focus:outline-none focus:border-[#c9a227]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Логин</label>
                <input type="text" value={teacherForm.login} onChange={e => setTeacherForm(prev => ({ ...prev, login: e.target.value }))} className="w-full p-3 border rounded-xl font-mono text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Пароль</label>
                <div className="flex gap-2">
                  <input type="text" value={teacherForm.password} onChange={e => setTeacherForm(prev => ({ ...prev, password: e.target.value }))} className="flex-1 p-3 border rounded-xl font-mono text-sm"/>
                  <button onClick={() => setTeacherForm(prev => ({ ...prev, password: generatePassword() }))} className="p-3 border rounded-xl hover:bg-gray-50"><Icons.Refresh /></button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Предмет</label>
              <input type="text" value={teacherForm.subject} onChange={e => setTeacherForm(prev => ({ ...prev, subject: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="Английский / IELTS"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={teacherForm.email} onChange={e => setTeacherForm(prev => ({ ...prev, email: e.target.value }))} className="w-full p-3 border rounded-xl"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ставка (₸/час)</label>
                <input type="number" value={teacherForm.hourlyRate} onChange={e => setTeacherForm(prev => ({ ...prev, hourlyRate: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="2500"/>
              </div>
            </div>
            
            <button onClick={addTeacher} disabled={!teacherForm.name} className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: '#1a3a32' }}>
              Создать аккаунт
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    // Добавить/редактировать расписание
    if (modal === 'addSchedule' || modal === 'editSchedule') {
      return (
        <ModalWrapper title={modal === 'editSchedule' ? 'Редактировать занятие' : 'Добавить занятие'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Предмет *</label>
              <input type="text" value={scheduleForm.subject} onChange={e => setScheduleForm(prev => ({ ...prev, subject: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="Подготовка к IELTS"/>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Преподаватель</label>
              <select value={scheduleForm.teacherId} onChange={e => setScheduleForm(prev => ({ ...prev, teacherId: e.target.value }))} className="w-full p-3 border rounded-xl">
                <option value="">Куратор</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">День</label>
                <select value={scheduleForm.day} onChange={e => setScheduleForm(prev => ({ ...prev, day: e.target.value }))} className="w-full p-3 border rounded-xl">
                  {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Время</label>
                <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm(prev => ({ ...prev, time: e.target.value }))} className="w-full p-3 border rounded-xl"/>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Длительность (мин)</label>
                <input type="number" value={scheduleForm.duration} onChange={e => setScheduleForm(prev => ({ ...prev, duration: e.target.value }))} className="w-full p-3 border rounded-xl"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Кабинет</label>
                <input type="text" value={scheduleForm.room} onChange={e => setScheduleForm(prev => ({ ...prev, room: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="201"/>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ученики</label>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-xl">
                {students.map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={scheduleForm.students.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setScheduleForm(prev => ({ ...prev, students: [...prev.students, s.id] }));
                        } else {
                          setScheduleForm(prev => ({ ...prev, students: prev.students.filter(id => id !== s.id) }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              onClick={modal === 'editSchedule' ? updateScheduleItem : addScheduleItem} 
              disabled={!scheduleForm.subject} 
              className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50" 
              style={{ background: '#1a3a32' }}
            >
              {modal === 'editSchedule' ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    // Карточка ученика
    if (modal === 'studentDetail' && selectedItem) {
      return (
        <ModalWrapper title="Карточка ученика">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl" style={{ background: '#1a3a32' }}>
                {selectedItem.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-xl font-bold">{selectedItem.name}</div>
                <div className="text-gray-500">{selectedItem.grade} • {selectedItem.age} лет</div>
                <div className="text-sm text-gray-400 mt-1">Логин: <code className="bg-gray-100 px-1 rounded">{selectedItem.login}</code></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="font-medium">{selectedItem.email}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Телефон</div>
                <div className="font-medium">{selectedItem.phone}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Родитель</div>
                <div className="font-medium">{selectedItem.parentName}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">Профиль</div>
                <div className="font-medium" style={{ color: careerProfiles[selectedItem.testResult]?.color }}>{selectedItem.testResult || '—'}</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">Документы</h4>
                <button onClick={() => setModal('addDocument')} className="text-sm font-medium" style={{ color: '#c9a227' }}>+ Прикрепить</button>
              </div>
              <div className="space-y-2">
                {selectedItem.documents?.map((d, i) => (
                  <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{documentTypes[d.type]?.icon || '📄'}</span>
                      <span className="text-sm">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.score && <span className="px-2 py-1 rounded text-xs" style={{ background: '#1a3a32', color: '#c9a227' }}>{d.score}</span>}
                      <span className="text-xs text-gray-400">{d.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalWrapper>
      );
    }
    
    // Добавить документ
    if (modal === 'addDocument' && selectedItem) {
      return (
        <ModalWrapper title="Прикрепить документ">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Тип документа *</label>
              <select value={documentForm.type} onChange={e => setDocumentForm(prev => ({ ...prev, type: e.target.value }))} className="w-full p-3 border rounded-xl">
                <option value="">Выберите тип</option>
                {Object.entries(documentTypes).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            
            {documentTypes[documentForm.type]?.isExam && (
              <div>
                <label className="block text-sm font-medium mb-1">Балл *</label>
                <input type="text" value={documentForm.score} onChange={e => setDocumentForm(prev => ({ ...prev, score: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder={documentForm.type?.includes('ielts') ? '7.0' : '1420'}/>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input type="text" value={documentForm.name} onChange={e => setDocumentForm(prev => ({ ...prev, name: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder={documentTypes[documentForm.type]?.label || 'Название'}/>
            </div>
            
            {documentForm.type === 'invitation' && (
              <div className="rounded-xl p-4 text-center" style={{ background: '#c9a227', color: '#1a3a32' }}>
                <p className="font-medium">{motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}</p>
              </div>
            )}
            
            <button onClick={addDocument} disabled={!documentForm.type} className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: '#1a3a32' }}>
              Прикрепить
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    // Поддержка (для ученика)
    if (modal === 'support') {
      return (
        <ModalWrapper title="Обратиться в поддержку">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Опишите вашу проблему. Куратор ответит в течение 48 часов.</p>
            <textarea 
              value={supportMessage}
              onChange={e => setSupportMessage(e.target.value)}
              className="w-full p-3 border rounded-xl h-32 resize-none"
              placeholder="Опишите вопрос..."
            />
            <button onClick={submitSupport} disabled={!supportMessage.trim()} className="w-full py-3 rounded-xl font-semibold text-[#1a3a32] disabled:opacity-50" style={{ background: '#c9a227' }}>
              Отправить
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    // Добавить силлабус
    if (modal === 'addSyllabus') {
      return (
        <ModalWrapper title="Добавить курс">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название курса *</label>
              <input type="text" value={syllabusForm.course} onChange={e => setSyllabusForm(prev => ({ ...prev, course: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="IELTS Preparation"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Недель</label>
              <input type="number" value={syllabusForm.weeks} onChange={e => setSyllabusForm(prev => ({ ...prev, weeks: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="12"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Темы (через запятую)</label>
              <input type="text" value={syllabusForm.topics} onChange={e => setSyllabusForm(prev => ({ ...prev, topics: e.target.value }))} className="w-full p-3 border rounded-xl" placeholder="Listening, Reading, Writing"/>
            </div>
            <button onClick={addSyllabus} disabled={!syllabusForm.course} className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: '#1a3a32' }}>
              Создать
            </button>
          </div>
        </ModalWrapper>
      );
    }
    
    return null;
  };

  // ========== ГЛАВНЫЙ РЕНДЕР ==========
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Сайдбар */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#c9a227' }}>
              <svg viewBox="0 0 100 100" className="w-6 h-6" style={{ color: '#1a3a32' }}>
                <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="4"/>
                <path d="M30 60 Q50 30 70 60" fill="none" stroke="currentColor" strokeWidth="3"/>
              </svg>
            </div>
            <div>
              <div className="font-serif font-bold" style={{ color: '#1a3a32' }}>NOBILIS</div>
              <div className="text-xs tracking-wider" style={{ color: '#c9a227' }}>ACADEMY</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {getNavItems().map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${currentView === item.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                style={currentView === item.id ? { background: '#1a3a32' } : {}}
              >
                <item.icon />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: '#c9a227' }}>
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-400">{currentUser.role === 'student' ? 'Ученик' : currentUser.role === 'curator' ? 'Куратор' : 'Преподаватель'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl">
            <Icons.Logout />
            <span className="text-sm">Выйти</span>
          </button>
        </div>
      </div>
      
      {/* Контент */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
      
      {/* Модалки */}
      {renderModal()}
    </div>
  );
}
