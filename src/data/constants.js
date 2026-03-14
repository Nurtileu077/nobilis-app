// =============================================
// NOBILIS ACADEMY - CONSTANTS v3
// =============================================

export const STORAGE_KEY = 'nobilis_v7';
export const USER_KEY = 'nobilis_user_v7';

// Package types
export const PACKAGE_TYPES = {
  ielts: { name: 'IELTS', color: '#3B82F6', icon: '\u{1F4D8}', unit: 'занятий' },
  sat: { name: 'SAT', color: '#8B5CF6', icon: '\u{1F4D7}', unit: 'занятий' },
  support: { name: 'Сопровождение', color: '#10B981', icon: '\u{1F3AF}', isStages: true },
};

// Support stages
export const SUPPORT_STAGES = [
  { id: 1, name: 'Профориентация', percent: 10 },
  { id: 2, name: 'Выбор стран и ВУЗов', percent: 25 },
  { id: 3, name: 'Сбор документов', percent: 40 },
  { id: 4, name: 'Мотивационные письма', percent: 55 },
  { id: 5, name: 'Подача заявок', percent: 70 },
  { id: 6, name: 'Ожидание ответов', percent: 80 },
  { id: 7, name: 'Получение приглашений', percent: 90 },
  { id: 8, name: 'Оформление визы', percent: 100 },
];

// Student statuses
export const STUDENT_STATUSES = {
  active: { name: 'Активный', color: '#10b981', bg: '#dcfce7' },
  process: { name: 'В процессе', color: '#f59e0b', bg: '#fef3c7' },
  completed: { name: 'Завершён', color: '#3b82f6', bg: '#dbeafe' },
  refund: { name: 'Возврат', color: '#ef4444', bg: '#fee2e2' },
  graduated_2025: { name: 'Выпускник 2025', color: '#3b82f6', bg: '#dbeafe' },
  graduated_2026: { name: 'Выпускник 2026', color: '#8b5cf6', bg: '#ede9fe' },
  paused: { name: 'Приостановлен', color: '#6b7280', bg: '#f3f4f6' },
};

// Countries database
export const COUNTRIES = [
  { id: 'usa', name: 'США', flag: '\u{1F1FA}\u{1F1F8}', requirements: 'IELTS 7.0+, SAT 1400+', documents: ['Транскрипт', 'Мотивационное', 'Рекомендации', 'SAT'], universities: ['MIT', 'Stanford', 'Harvard', 'Yale', 'Princeton', 'Columbia', 'Berkeley'] },
  { id: 'uk', name: 'Великобритания', flag: '\u{1F1EC}\u{1F1E7}', requirements: 'IELTS 6.5+', documents: ['Транскрипт', 'Мотивационное', 'Рекомендации'], universities: ['Oxford', 'Cambridge', 'Imperial', 'LSE', 'UCL', 'Edinburgh'] },
  { id: 'germany', name: 'Германия', flag: '\u{1F1E9}\u{1F1EA}', requirements: 'IELTS 6.0+, TestDaF', documents: ['Abitur', 'Мотивационное', 'Сертификаты'], universities: ['TU Munich', 'LMU', 'Heidelberg', 'RWTH Aachen', 'Humboldt'] },
  { id: 'netherlands', name: 'Нидерланды', flag: '\u{1F1F3}\u{1F1F1}', requirements: 'IELTS 6.5+', documents: ['Транскрипт', 'Мотивационное'], universities: ['TU Delft', 'Amsterdam', 'Leiden', 'Utrecht', 'Erasmus'] },
  { id: 'canada', name: 'Канада', flag: '\u{1F1E8}\u{1F1E6}', requirements: 'IELTS 6.5+', documents: ['Транскрипт', 'Мотивационное', 'Рекомендации'], universities: ['Toronto', 'McGill', 'UBC', 'Waterloo', 'McMaster'] },
  { id: 'czech', name: 'Чехия', flag: '\u{1F1E8}\u{1F1FF}', requirements: 'IELTS 5.5+, чешский B2', documents: ['Нострификация', 'Мотивационное'], universities: ['Charles University', 'CTU Prague', 'Masaryk'] },
];

export const DOCUMENT_TYPES = {
  contract: { icon: '\u{1F4C4}', label: 'Договор', color: '#64748b' },
  receipt: { icon: '\u{1F9FE}', label: 'Чек об оплате', color: '#64748b' },
  ielts_cert: { icon: '\u{1F4CA}', label: 'IELTS сертификат', isExam: true, color: '#3B82F6' },
  sat_cert: { icon: '\u{1F4C8}', label: 'SAT сертификат', isExam: true, color: '#8B5CF6' },
  toefl: { icon: '\u{1F4CB}', label: 'TOEFL сертификат', isExam: true, color: '#06b6d4' },
  ielts: { icon: '\u{1F4CA}', label: 'IELTS сертификат', isExam: true, color: '#3B82F6' },
  sat: { icon: '\u{1F4C8}', label: 'SAT сертификат', isExam: true, color: '#8B5CF6' },
  invitation: { icon: '\u2709\uFE0F', label: 'Приглашение из ВУЗа', color: '#22c55e' },
  motivation: { icon: '\u{1F48C}', label: 'Мотивационное письмо', color: '#ec4899' },
  recommendation: { icon: '\u{1F4DD}', label: 'Рекомендательное письмо', color: '#f59e0b' },
  certificate: { icon: '\u{1F3C6}', label: 'Сертификат/Диплом', color: '#c9a227' },
  passport: { icon: '\u{1F6C2}', label: 'Паспорт/ID', color: '#6366f1' },
  transcript: { icon: '\u{1F4DA}', label: 'Транскрипт оценок', color: '#10b981' },
  photo: { icon: '\u{1F4F7}', label: 'Фото 3x4', color: '#06b6d4' },
  mock_ielts: { icon: '\u{1F4DD}', label: 'Пробный IELTS', isExam: true, color: '#3B82F6' },
  mock_sat: { icon: '\u{1F4DD}', label: 'Пробный SAT', isExam: true, color: '#8B5CF6' },
  other: { icon: '\u{1F4CE}', label: 'Другое', color: '#9ca3af' },
};

// Holland RIASEC Career Orientation Test (42 questions, 7 per type)
export const HOLLAND_QUESTIONS = [
  // R — Реалистический
  { id: 1, text: "Мне нравится работать руками — собирать, чинить, мастерить", cat: "R" },
  { id: 2, text: "Я предпочитаю физическую активность офисной работе", cat: "R" },
  { id: 3, text: "Мне интересно разбираться в механизмах и инструментах", cat: "R" },
  { id: 4, text: "Я люблю работать на открытом воздухе", cat: "R" },
  { id: 5, text: "Мне нравится видеть конкретный результат своего труда", cat: "R" },
  { id: 6, text: "Я хорошо ориентируюсь в технических чертежах и схемах", cat: "R" },
  { id: 7, text: "Мне комфортнее работать с вещами, чем с людьми", cat: "R" },
  // I — Исследовательский
  { id: 8, text: "Мне нравится анализировать данные и искать закономерности", cat: "I" },
  { id: 9, text: "Я люблю решать сложные задачи и головоломки", cat: "I" },
  { id: 10, text: "Мне интересно читать научные статьи и исследования", cat: "I" },
  { id: 11, text: "Я предпочитаю разбираться в причинах явлений", cat: "I" },
  { id: 12, text: "Мне нравится проводить эксперименты и наблюдения", cat: "I" },
  { id: 13, text: "Я часто задаю вопрос «почему?» и ищу глубинные ответы", cat: "I" },
  { id: 14, text: "Мне важно логически обосновывать свои решения", cat: "I" },
  // A — Артистический
  { id: 15, text: "Мне нравится выражать себя через творчество", cat: "A" },
  { id: 16, text: "Я часто вижу нестандартные решения проблем", cat: "A" },
  { id: 17, text: "Мне комфортно в свободной, неформальной обстановке", cat: "A" },
  { id: 18, text: "Я люблю музыку, рисование, писательство или дизайн", cat: "A" },
  { id: 19, text: "Мне важна эстетика и красота в окружающем мире", cat: "A" },
  { id: 20, text: "Я предпочитаю работу без жёстких правил и рамок", cat: "A" },
  { id: 21, text: "Мне нравится придумывать новые идеи и концепции", cat: "A" },
  // S — Социальный
  { id: 22, text: "Помощь другим приносит мне удовлетворение", cat: "S" },
  { id: 23, text: "Я легко нахожу общий язык с разными людьми", cat: "S" },
  { id: 24, text: "Мне нравится обучать и объяснять сложные вещи", cat: "S" },
  { id: 25, text: "Я хорошо чувствую настроение и эмоции других", cat: "S" },
  { id: 26, text: "Командная работа мне нравится больше индивидуальной", cat: "S" },
  { id: 27, text: "Мне важно, чтобы работа приносила пользу обществу", cat: "S" },
  { id: 28, text: "Я умею разрешать конфликты и находить компромиссы", cat: "S" },
  // E — Предприимчивый
  { id: 29, text: "Я комфортно руковожу группой людей", cat: "E" },
  { id: 30, text: "Мне нравится убеждать и вести переговоры", cat: "E" },
  { id: 31, text: "Я готов брать ответственность за важные решения", cat: "E" },
  { id: 32, text: "Мне важен финансовый успех и карьерный рост", cat: "E" },
  { id: 33, text: "Мне комфортно выступать перед аудиторией", cat: "E" },
  { id: 34, text: "Я умею мотивировать и вдохновлять людей", cat: "E" },
  { id: 35, text: "Мне нравится запускать новые проекты и бизнесы", cat: "E" },
  // C — Конвенциональный
  { id: 36, text: "Я предпочитаю чёткую структуру и порядок в работе", cat: "C" },
  { id: 37, text: "Мне нравится работать с документами, таблицами и базами данных", cat: "C" },
  { id: 38, text: "Я внимателен к деталям и редко допускаю ошибки", cat: "C" },
  { id: 39, text: "Мне комфортно следовать установленным правилам", cat: "C" },
  { id: 40, text: "Я умею хорошо планировать и организовывать", cat: "C" },
  { id: 41, text: "Мне нравится систематизировать информацию", cat: "C" },
  { id: 42, text: "Я предпочитаю предсказуемую и стабильную работу", cat: "C" },
];

export const HOLLAND_PROFILES = {
  R: { name: "Реалистический", emoji: "\u{1F527}", color: "#EF4444", desc: "Вы практик — предпочитаете работать руками, с техникой и инструментами. Цените конкретный результат.", careers: ["Инженер-механик", "Архитектор", "Хирург", "Пилот", "Агроном"], faculties: ["Инженерия", "Архитектура", "Сельское хозяйство", "Строительство"], unis: ["TU Munich", "Politecnico di Milano", "ETH Zurich"], countries: ["Германия", "Италия", "Австрия"] },
  I: { name: "Исследовательский", emoji: "\u{1F52C}", color: "#3B82F6", desc: "Вы исследователь — любите анализировать, экспериментировать и искать истину. Логика и наука — ваша сила.", careers: ["Data Scientist", "Учёный-исследователь", "Аналитик", "Биолог", "Фармацевт"], faculties: ["Естественные науки", "Математика", "IT", "Медицина"], unis: ["MIT", "Stanford", "Heidelberg", "Peking University"], countries: ["США", "Германия", "Китай"] },
  A: { name: "Артистический", emoji: "\u{1F3A8}", color: "#8B5CF6", desc: "Вы творец — выражаете себя через искусство, дизайн и нестандартные решения. Свобода и креативность важны.", careers: ["UX/UI Дизайнер", "Режиссёр", "Маркетолог", "Архитектор", "Журналист"], faculties: ["Дизайн", "Искусство", "Медиа", "Архитектура"], unis: ["Parsons", "Politecnico di Milano", "Sorbonne"], countries: ["Италия", "Франция", "Нидерланды"] },
  S: { name: "Социальный", emoji: "\u{1F91D}", color: "#10B981", desc: "Вы помощник — умеете слушать, обучать и поддерживать. Работа с людьми — ваше призвание.", careers: ["Психолог", "Врач", "Учитель", "HR-менеджер", "Социальный работник"], faculties: ["Психология", "Медицина", "Педагогика", "Социология"], unis: ["Toronto", "McGill", "Semmelweis"], countries: ["Канада", "Венгрия", "Малайзия"] },
  E: { name: "Предприимчивый", emoji: "\u{1F680}", color: "#F59E0B", desc: "Вы лидер — любите управлять, убеждать и строить. Амбиции и энергия двигают вас вперёд.", careers: ["Предприниматель", "Менеджер", "Юрист", "Финансист", "Консультант"], faculties: ["Бизнес", "Менеджмент", "Финансы", "Право"], unis: ["Harvard", "HEC Paris", "Bocconi"], countries: ["США", "Франция", "ОАЭ"] },
  C: { name: "Конвенциональный", emoji: "\u{1F4CA}", color: "#06B6D4", desc: "Вы организатор — цените порядок, точность и системность. Стабильность и структура — ваш фундамент.", careers: ["Бухгалтер", "Аудитор", "Логист", "Банкир", "Администратор"], faculties: ["Экономика", "Бухгалтерский учёт", "Логистика", "Банковское дело"], unis: ["WU Wien", "Corvinus", "Mannheim"], countries: ["Австрия", "Венгрия", "Германия"] },
};

export const DAYS_ORDER = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
export const DAYS_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
export const ANSWER_LABELS = ['Совсем не про меня','Скорее нет','Нейтрально','Скорее да','Полностью про меня'];

// =============================================
// ROLES & HIERARCHY
// =============================================
export const ROLES = {
  director:          { name: 'Директор',              icon: 'D', department: 'management', level: 0 },
  academic_director: { name: 'Академический директор', icon: 'A', department: 'academic',   level: 1 },
  rop:               { name: 'РОП',                    icon: 'R', department: 'sales',      level: 1 },
  curator:           { name: 'Куратор',                icon: 'C', department: 'academic',   level: 2 },
  teacher:           { name: 'Преподаватель',          icon: 'T', department: 'academic',   level: 2 },
  coordinator:       { name: 'Координатор',            icon: 'K', department: 'academic',   level: 2 },
  sales_manager:     { name: 'Менеджер по продажам',   icon: 'M', department: 'sales',      level: 2 },
  callcenter:        { name: 'Колл-центр',             icon: 'P', department: 'sales',      level: 2 },
  office_manager:    { name: 'Офис-менеджер',          icon: 'O', department: 'operations', level: 2 },
  accountant:        { name: 'Бухгалтер',              icon: 'B', department: 'operations', level: 2 },
  student:           { name: 'Студент',                icon: 'S', department: 'student',    level: 3 },
};

// Who manages whom
export const ROLE_HIERARCHY = {
  director:          ['academic_director', 'rop', 'curator', 'teacher', 'coordinator', 'sales_manager', 'callcenter', 'office_manager', 'accountant'],
  academic_director: ['curator', 'teacher', 'coordinator'],
  rop:               ['sales_manager', 'callcenter'],
  curator:           [],
  teacher:           [],
  coordinator:       [],
  sales_manager:     [],
  callcenter:        [],
  office_manager:    [],
  accountant:        [],
};

// Department labels
export const DEPARTMENTS = {
  management: 'Руководство',
  academic:   'Академический отдел',
  sales:      'Отдел продаж',
  operations: 'Операционный отдел',
  student:    'Студенты',
};
