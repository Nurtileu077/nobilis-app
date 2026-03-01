// =============================================
// NOBILIS ACADEMY - CONSTANTS v3
// =============================================

export const STORAGE_KEY = 'nobilis_v3';
export const USER_KEY = 'nobilis_user_v3';

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

export const GALLUP_QUESTIONS = [
  { id: 1, text: "Я предпочитаю работать с данными и цифрами", cat: "analytical" },
  { id: 2, text: "Мне нравится придумывать новые идеи", cat: "creative" },
  { id: 3, text: "Я комфортно руковожу группой людей", cat: "leader" },
  { id: 4, text: "Помощь другим приносит мне удовлетворение", cat: "social" },
  { id: 5, text: "Я люблю разбираться в технологиях", cat: "technical" },
  { id: 6, text: "Я предпочитаю структурированную работу", cat: "organized" },
  { id: 7, text: "Мне интересно исследовать новые темы", cat: "research" },
  { id: 8, text: "Я легко нахожу общий язык с людьми", cat: "social" },
  { id: 9, text: "Мне важен финансовый успех", cat: "finance" },
  { id: 10, text: "Я готов брать ответственность за решения", cat: "leader" },
  { id: 11, text: "Мне нравится работать руками", cat: "technical" },
  { id: 12, text: "Я часто вижу нестандартные решения", cat: "creative" },
  { id: 13, text: "Я предпочитаю глубоко изучить одну тему", cat: "research" },
  { id: 14, text: "Мне комфортно выступать перед аудиторией", cat: "leader" },
  { id: 15, text: "Я обращаю внимание на детали", cat: "analytical" },
  { id: 16, text: "Командная работа мне нравится больше", cat: "social" },
  { id: 17, text: "Я быстро адаптируюсь к новым технологиям", cat: "technical" },
  { id: 18, text: "Мне важно, чтобы работа была полезна обществу", cat: "social" },
  { id: 19, text: "Я умею планировать и организовывать", cat: "organized" },
  { id: 20, text: "Я принимаю решения на основе логики", cat: "analytical" }
];

export const CAREER_PROFILES = {
  "Аналитик-Исследователь": { cats: ["analytical", "research"], color: "#3B82F6", desc: "Сильное аналитическое мышление.", careers: ["Data Scientist", "Учёный", "Аналитик"], unis: ["MIT", "Stanford", "ETH Zurich"], countries: ["США", "Германия"] },
  "Творческий Визионер": { cats: ["creative"], color: "#8B5CF6", desc: "Креативность и воображение.", careers: ["Дизайнер", "Архитектор", "Маркетолог"], unis: ["RISD", "Parsons"], countries: ["Нидерланды", "Италия"] },
  "Лидер-Организатор": { cats: ["leader", "organized"], color: "#F59E0B", desc: "Прирождённый лидер.", careers: ["Менеджер", "Предприниматель", "CEO"], unis: ["Harvard", "INSEAD"], countries: ["США", "ОАЭ"] },
  "Социальный Помощник": { cats: ["social"], color: "#10B981", desc: "Эмпатия и работа с людьми.", careers: ["Психолог", "Врач", "Учитель"], unis: ["Toronto", "Melbourne"], countries: ["Канада", "Австралия"] },
  "Технический Специалист": { cats: ["technical"], color: "#EF4444", desc: "Техническая подкованность.", careers: ["Инженер", "IT-специалист"], unis: ["TU Munich", "KAIST"], countries: ["Германия", "Корея"] }
};

export const DAYS_ORDER = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
export const DAYS_RU = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
export const ANSWER_LABELS = ['Совсем нет','Нет','Скорее нет','Нейтрально','Скорее да','Да','Полностью да'];
