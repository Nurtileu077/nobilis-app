import { transliterate, generateLogin, generatePassword, formatDate, daysBetween, calculateTestResult, getInitials } from '../data/utils';
import { getAttendancePercent } from '../data/utils';
import { GALLUP_QUESTIONS, CAREER_PROFILES } from '../data/constants';

describe('Utility Functions', () => {
  describe('transliterate', () => {
    it('converts Cyrillic to Latin characters', () => {
      expect(transliterate('привет')).toBe('privet');
      expect(transliterate('мир')).toBe('mir');
    });

    it('handles ь and ъ (soft/hard sign)', () => {
      expect(transliterate('мальчик')).toBe('malchik');
      expect(transliterate('объект')).toBe('obekt');
    });

    it('handles special characters correctly', () => {
      expect(transliterate('жёлтый')).toBe('zheltyy');
      expect(transliterate('чашка')).toBe('chashka');
      expect(transliterate('щука')).toBe('schuka');
    });

    it('passes through non-Cyrillic characters', () => {
      expect(transliterate('test123')).toBe('test123');
      expect(transliterate('hello world')).toBe('hello world');
    });
  });

  describe('generatePassword', () => {
    it('generates a password of default length 12', () => {
      const password = generatePassword();
      expect(password).toHaveLength(12);
    });

    it('generates a password of specified length', () => {
      expect(generatePassword(8)).toHaveLength(8);
      expect(generatePassword(20)).toHaveLength(20);
    });

    it('generates different passwords each time', () => {
      const p1 = generatePassword();
      const p2 = generatePassword();
      expect(p1).not.toBe(p2);
    });
  });

  describe('generateLogin', () => {
    it('generates login from Russian name', () => {
      const login = generateLogin('Петров Алексей');
      expect(login).toMatch(/^petrov\.ale\d+$/);
    });

    it('handles single-word name', () => {
      const login = generateLogin('Мария');
      expect(login).toMatch(/^mariya\.\d+$/);
    });

    it('defaults to "user" for empty input', () => {
      const login = generateLogin('');
      expect(login).toMatch(/^user\.\d+$/);
    });
  });

  describe('formatDate', () => {
    it('formats a valid date string', () => {
      const result = formatDate('2024-12-25');
      expect(result).toMatch(/25\.12\.2024/);
    });

    it('returns empty string for falsy input', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('daysBetween', () => {
    it('calculates days between two dates', () => {
      expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9);
    });

    it('returns negative for reversed dates', () => {
      expect(daysBetween('2024-01-10', '2024-01-01')).toBe(-9);
    });

    it('returns 0 for same date', () => {
      expect(daysBetween('2024-01-01', '2024-01-01')).toBe(0);
    });
  });

  describe('getInitials', () => {
    it('returns first two initials', () => {
      expect(getInitials('Петров Алексей')).toBe('ПА');
    });

    it('handles single name', () => {
      expect(getInitials('Мария')).toBe('М');
    });

    it('handles three-word name', () => {
      expect(getInitials('Иванов Иван Иванович')).toBe('ИИ');
    });
  });

  describe('getAttendancePercent', () => {
    it('calculates correct percentage', () => {
      expect(getAttendancePercent({ total: 24, attended: 22 })).toBe(92);
      expect(getAttendancePercent({ total: 30, attended: 29 })).toBe(97);
    });

    it('returns 0 for zero total', () => {
      expect(getAttendancePercent({ total: 0, attended: 0 })).toBe(0);
    });

    it('returns 0 for null/undefined', () => {
      expect(getAttendancePercent(null)).toBe(0);
      expect(getAttendancePercent(undefined)).toBe(0);
    });
  });

  describe('calculateTestResult', () => {
    it('returns an analytical profile for analytical answers', () => {
      const answers = {};
      GALLUP_QUESTIONS.forEach(q => {
        answers[q.id] = q.cat === 'analytical' || q.cat === 'research' ? 7 : 1;
      });
      const result = calculateTestResult(answers, GALLUP_QUESTIONS, CAREER_PROFILES);
      expect(result.profile).toBe('Аналитик-Исследователь');
      expect(result.scores).toBeDefined();
    });

    it('returns creative profile for creative answers', () => {
      const answers = {};
      GALLUP_QUESTIONS.forEach(q => {
        answers[q.id] = q.cat === 'creative' ? 7 : 1;
      });
      const result = calculateTestResult(answers, GALLUP_QUESTIONS, CAREER_PROFILES);
      expect(result.profile).toBe('Творческий Визионер');
    });

    it('returns social profile for social answers', () => {
      const answers = {};
      GALLUP_QUESTIONS.forEach(q => {
        answers[q.id] = q.cat === 'social' ? 7 : 1;
      });
      const result = calculateTestResult(answers, GALLUP_QUESTIONS, CAREER_PROFILES);
      expect(result.profile).toBe('Социальный Помощник');
    });

    it('handles empty answers', () => {
      const result = calculateTestResult({}, GALLUP_QUESTIONS, CAREER_PROFILES);
      expect(result.profile).toBeNull();
    });
  });
});
