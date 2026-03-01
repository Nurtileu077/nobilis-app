import { DOCUMENT_TYPES, GALLUP_QUESTIONS, CAREER_PROFILES, DAYS_ORDER, DAYS_RU, ANSWER_LABELS, STORAGE_KEY } from '../data/constants';

describe('Constants', () => {
  describe('STORAGE_KEY', () => {
    it('has the correct storage key', () => {
      expect(STORAGE_KEY).toBe('nobilis_v2');
    });
  });

  describe('DOCUMENT_TYPES', () => {
    it('has all required document types', () => {
      const expectedTypes = ['contract', 'receipt', 'ielts', 'sat', 'toefl', 'invitation', 'motivation', 'recommendation', 'certificate', 'passport', 'transcript', 'mock_ielts', 'mock_sat'];
      expectedTypes.forEach(type => {
        expect(DOCUMENT_TYPES[type]).toBeDefined();
        expect(DOCUMENT_TYPES[type].icon).toBeDefined();
        expect(DOCUMENT_TYPES[type].label).toBeDefined();
      });
    });

    it('marks exam types correctly', () => {
      expect(DOCUMENT_TYPES.ielts.isExam).toBe(true);
      expect(DOCUMENT_TYPES.sat.isExam).toBe(true);
      expect(DOCUMENT_TYPES.toefl.isExam).toBe(true);
      expect(DOCUMENT_TYPES.mock_ielts.isExam).toBe(true);
      expect(DOCUMENT_TYPES.contract.isExam).toBeUndefined();
    });
  });

  describe('GALLUP_QUESTIONS', () => {
    it('has exactly 20 questions', () => {
      expect(GALLUP_QUESTIONS).toHaveLength(20);
    });

    it('each question has id, text, and cat', () => {
      GALLUP_QUESTIONS.forEach(q => {
        expect(q.id).toBeDefined();
        expect(typeof q.text).toBe('string');
        expect(typeof q.cat).toBe('string');
      });
    });

    it('has unique question IDs', () => {
      const ids = GALLUP_QUESTIONS.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('IDs are sequential from 1 to 20', () => {
      GALLUP_QUESTIONS.forEach((q, i) => {
        expect(q.id).toBe(i + 1);
      });
    });
  });

  describe('CAREER_PROFILES', () => {
    it('has exactly 5 profiles', () => {
      expect(Object.keys(CAREER_PROFILES)).toHaveLength(5);
    });

    it('each profile has required fields', () => {
      Object.values(CAREER_PROFILES).forEach(p => {
        expect(p.cats).toBeDefined();
        expect(Array.isArray(p.cats)).toBe(true);
        expect(p.color).toBeDefined();
        expect(p.desc).toBeDefined();
        expect(p.careers).toBeDefined();
        expect(p.unis).toBeDefined();
        expect(p.countries).toBeDefined();
      });
    });
  });

  describe('DAYS_ORDER', () => {
    it('has 7 days starting from Monday', () => {
      expect(DAYS_ORDER).toHaveLength(7);
      expect(DAYS_ORDER[0]).toBe('Понедельник');
      expect(DAYS_ORDER[6]).toBe('Воскресенье');
    });
  });

  describe('DAYS_RU', () => {
    it('has 7 days starting from Sunday (JS convention)', () => {
      expect(DAYS_RU).toHaveLength(7);
      expect(DAYS_RU[0]).toBe('Воскресенье');
      expect(DAYS_RU[1]).toBe('Понедельник');
    });
  });

  describe('ANSWER_LABELS', () => {
    it('has 7 labels for Likert scale', () => {
      expect(ANSWER_LABELS).toHaveLength(7);
      expect(ANSWER_LABELS[0]).toBe('Совсем нет');
      expect(ANSWER_LABELS[6]).toBe('Полностью да');
    });
  });
});
