// =============================================
// NOBILIS ACADEMY - SUPABASE CONFIG
// =============================================
// Файл: src/lib/supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// СОТРУДНИКИ — Supabase Auth Accounts
// =============================================
// Для инициализации в Supabase Dashboard:
// 1. Перейдите в Authentication → Users
// 2. Создайте пользователей с email/password ниже
// 3. Добавьте в .env:  REACT_APP_SUPABASE_URL и REACT_APP_SUPABASE_ANON_KEY

export const STAFF_SUPABASE = [
  {
    id: 'dir1',
    name: 'Нуртилеу',
    role: 'director',
    email: 'nurtileu@nobilis.kz',
    login: 'nurtileu',
    password: 'Nobilis2024!',
    phone: '+7 700 100-00-00',
  },
  {
    id: 'ad1',
    name: 'Салтанат',
    role: 'academic_director',
    email: 'saltanat@nobilis.kz',
    login: 'saltanat',
    password: 'Nobilis2024@',
    phone: '+7 700 200-00-00',
  },
  {
    id: 'rop1',
    name: 'Мадияр',
    role: 'rop',
    email: 'madiyar@nobilis.kz',
    login: 'madiyar',
    password: 'Nobilis2024#',
    phone: '+7 700 300-00-00',
  },
];

// Supabase login helper
export const supabaseLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  // Map supabase user to app staff
  const staff = STAFF_SUPABASE.find(s => s.email === data.user.email);
  if (!staff) return { user: null, error: 'Пользователь не найден в системе' };
  return { user: { role: staff.role, id: staff.id, name: staff.name }, error: null };
};

export const supabaseLogout = async () => {
  await supabase.auth.signOut();
};

// =============================================
// ТИПЫ ДОКУМЕНТОВ
// =============================================
export const documentTypes = {
  contract: { icon: '📄', label: 'Договор' },
  receipt: { icon: '🧾', label: 'Чек об оплате' },
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

// =============================================
// ПРОФОРИЕНТАЦИОННЫЙ ТЕСТ
// =============================================
export const careerTestQuestions = [
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

export const careerProfiles = {
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
    description: "Вы креативная личность с богатым воображением. Ваша сила в генерации идей.",
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

// =============================================
// УТИЛИТЫ
// =============================================
export const generatePassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generateLogin = (name) => {
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

export const daysBetween = (date1, date2) => {
  return Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU');
};

export const motivationalQuotes = [
  "🎉 Поздравляем! Твоя мечта становится реальностью!",
  "🌟 Ты сделал это! Впереди — невероятные возможности!",
  "🚀 Новая глава твоей жизни начинается сейчас!",
  "💪 Твой труд окупился! Гордимся тобой!",
  "🎓 Добро пожаловать в мир больших возможностей!"
];
