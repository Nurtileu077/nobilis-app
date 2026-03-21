import {
  isValidEmail,
  isValidPhone,
  formatPhone,
  validateForm,
  validateStudentForm,
  sanitizeInput,
  isValidLogin,
  isStrongPassword,
} from '../utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('user+tag@domain.kz')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts valid Kazakhstan phone numbers', () => {
      expect(isValidPhone('+77001234567')).toBe(true);
      expect(isValidPhone('87001234567')).toBe(true);
      expect(isValidPhone('+7 (700) 123-45-67')).toBe(true);
      expect(isValidPhone('8 700 123 45 67')).toBe(true);
    });

    it('rejects invalid phones', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('formatPhone', () => {
    it('formats phone numbers to display format', () => {
      expect(formatPhone('87001234567')).toBe('+7 (700) 123-45-67');
      expect(formatPhone('+77001234567')).toBe('+7 (700) 123-45-67');
    });

    it('returns original for invalid format', () => {
      expect(formatPhone('')).toBe('');
      expect(formatPhone('123')).toBe('123');
    });
  });

  describe('validateForm', () => {
    it('validates required fields', () => {
      const result = validateForm({ name: 'Test', email: '' }, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Обязательное поле');
      expect(result.errors.name).toBeUndefined();
    });

    it('passes when all required fields present', () => {
      const result = validateForm({ name: 'Test', email: 'test@test.com' }, ['name', 'email']);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('validateStudentForm', () => {
    it('requires name', () => {
      const result = validateStudentForm({});
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('validates email format', () => {
      const result = validateStudentForm({ name: 'Test', email: 'invalid' });
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Некорректный email');
    });

    it('validates age range', () => {
      const result = validateStudentForm({ name: 'Test', age: 5 });
      expect(result.valid).toBe(false);
      expect(result.errors.age).toBeDefined();
    });

    it('passes with valid data', () => {
      const result = validateStudentForm({
        name: 'Иванов Иван',
        email: 'ivan@test.com',
        phone: '+77001234567',
        age: 16,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('escapes HTML characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('passes through non-string values', () => {
      expect(sanitizeInput(42)).toBe(42);
      expect(sanitizeInput(null)).toBe(null);
    });
  });

  describe('isValidLogin', () => {
    it('accepts valid logins', () => {
      expect(isValidLogin('nurtileu')).toBe(true);
      expect(isValidLogin('user.name_123')).toBe(true);
    });

    it('rejects invalid logins', () => {
      expect(isValidLogin('')).toBe(false);
      expect(isValidLogin('ab')).toBe(false);
      expect(isValidLogin('user@name')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('accepts strong passwords', () => {
      expect(isStrongPassword('Nobilis2024!')).toBe(true);
      expect(isStrongPassword('Pass1234')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(isStrongPassword('')).toBe(false);
      expect(isStrongPassword('short1')).toBe(false);
      expect(isStrongPassword('nonnumbers')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
    });
  });
});
