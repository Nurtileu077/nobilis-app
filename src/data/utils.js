// =============================================
// NOBILIS ACADEMY - UTILITIES
// =============================================

const TRANSLIT_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';

export const generatePassword = (len = 12) =>
  Array.from({ length: len }, () =>
    PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]
  ).join('');

export const transliterate = (str) =>
  str.split('').map(c => TRANSLIT_MAP[c] || c).join('').replace(/[ьъ]/g, '');

export const generateLogin = (name) => {
  const parts = (name || 'user').toLowerCase().split(' ');
  return transliterate(parts[0]) + '.' + transliterate(parts[1] || '').slice(0, 3) + Math.floor(Math.random() * 100);
};

export const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '';

export const daysBetween = (d1, d2) =>
  Math.ceil((new Date(d2) - new Date(d1)) / 86400000);

export const calculateTestResult = (testAnswers, gallupQuestions, careerProfiles) => {
  const scores = {};
  Object.entries(testAnswers).forEach(([q, v]) => {
    const cat = gallupQuestions.find(x => x.id === +q)?.cat;
    if (cat) scores[cat] = (scores[cat] || 0) + v;
  });
  let best = null;
  let bestScore = 0;
  Object.entries(careerProfiles).forEach(([name, profile]) => {
    const sc = profile.cats.reduce((s, c) => s + (scores[c] || 0), 0);
    if (sc > bestScore) {
      bestScore = sc;
      best = name;
    }
  });
  return { profile: best, scores };
};

export const getInitials = (name) =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('');

export const getAttendancePercent = (attendance) =>
  attendance?.total > 0 ? Math.round(attendance.attended / attendance.total * 100) : 0;
