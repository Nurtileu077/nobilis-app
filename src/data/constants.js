// =============================================
// NOBILIS ACADEMY - CONSTANTS
// =============================================

export const STORAGE_KEY = 'nobilis_v2';

export const DOCUMENT_TYPES = {
  contract: { icon: '\u{1F4C4}', label: 'Договор' },
  receipt: { icon: '\u{1F9FE}', label: 'Чек об оплате' },
  ielts: { icon: '\u{1F4CA}', label: 'IELTS сертификат', isExam: true },
  sat: { icon: '\u{1F4C8}', label: 'SAT сертификат', isExam: true },
  toefl: { icon: '\u{1F4CB}', label: 'TOEFL сертификат', isExam: true },
  invitation: { icon: '\u2709\uFE0F', label: 'Приглашение из университета' },
  motivation: { icon: '\u{1F48C}', label: 'Мотивационное письмо' },
  recommendation: { icon: '\u{1F4DD}', label: 'Рекомендательное письмо' },
  certificate: { icon: '\u{1F3C6}', label: 'Сертификат/Диплом' },
  passport: { icon: '\u{1F6C2}', label: 'Паспорт/ID' },
  transcript: { icon: '\u{1F4DA}', label: 'Транскрипт оценок' },
  mock_ielts: { icon: '\u{1F4DD}', label: 'Пробный IELTS', isExam: true },
  mock_sat: { icon: '\u{1F4DD}', label: 'Пробный SAT', isExam: true },
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
