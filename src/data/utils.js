// =============================================
// NOBILIS ACADEMY - UTILITIES v3
// =============================================

const TRANSLIT_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  // Kazakh letters
  'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u',
  'і': 'i', 'һ': 'h'
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

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU') : '';

export const formatDateTime = (d) => d ? new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const daysBetween = (d1, d2) =>
  Math.ceil((new Date(d2) - new Date(d1)) / 86400000);

export const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : 0;

export const calculateTestResult = (testAnswers, questions, profiles) => {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  Object.entries(testAnswers).forEach(([qId, value]) => {
    const q = questions.find(x => x.id === +qId);
    if (q) scores[q.cat] = (scores[q.cat] || 0) + value;
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primaryType = sorted[0][0];
  const secondaryType = sorted[1][0];
  const riasecCode = sorted.slice(0, 3).map(x => x[0]).join('');
  const primary = profiles[primaryType] || {};
  const secondary = profiles[secondaryType] || {};
  const combinedCareers = [...new Set([...(primary.careers || []), ...(secondary.careers || [])])].slice(0, 5);
  return {
    profile: primaryType,
    profileName: primary.name || primaryType,
    riasecCode,
    scores,
    sorted,
    primaryType,
    secondaryType,
    careers: combinedCareers,
  };
};

export const getInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).slice(0, 2).join('') : '?';

export const getAttendancePercent = (attendance) =>
  attendance?.total > 0 ? Math.round(attendance.attended / attendance.total * 100) : 0;

// Package progress calculation
export const getPackageProgress = (pkg, stages) => {
  if (!pkg) return { percent: 0, text: '' };
  const pkgType = pkg.type;
  if (pkgType === 'support') {
    const stage = stages?.find(s => s.id === pkg.currentStage) || stages?.[0];
    return { percent: stage?.percent || 0, text: stage?.name || '', isStages: true };
  }
  const total = pkg.totalLessons || 1;
  const done = pkg.completedLessons || 0;
  const missed = pkg.missedLessons || 0;
  const remaining = total - done - missed;
  const pct = Math.round((done / total) * 100);
  return { percent: pct, text: `\u2713${done} \u2717${missed} \u23F3${remaining}`, done, missed, remaining, total };
};
