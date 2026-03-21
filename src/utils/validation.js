// =============================================
// NOBILIS ACADEMY - INPUT VALIDATION
// =============================================

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone (Kazakhstan format: +7 or 8, 10 digits)
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+7|8)?[0-9]{10}$/.test(cleaned);
}

/**
 * Format phone to display format: +7 (XXX) XXX-XX-XX
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d]/g, '');
  const digits = cleaned.startsWith('8') ? '7' + cleaned.slice(1) : cleaned.startsWith('7') ? cleaned : '7' + cleaned;
  if (digits.length !== 11) return phone;
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}

/**
 * Validate required fields in a form object
 * @param {Object} form - form data
 * @param {string[]} required - array of required field names
 * @returns {{ valid: boolean, errors: Object }} - validation result
 */
export function validateForm(form, required) {
  const errors = {};
  required.forEach(field => {
    const value = form[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      errors[field] = 'Обязательное поле';
    }
  });
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate student form
 */
export function validateStudentForm(form) {
  const { valid, errors } = validateForm(form, ['name']);

  if (form.email && !isValidEmail(form.email)) {
    errors.email = 'Некорректный email';
  }
  if (form.phone && !isValidPhone(form.phone)) {
    errors.phone = 'Некорректный телефон';
  }
  if (form.age && (isNaN(form.age) || form.age < 10 || form.age > 50)) {
    errors.age = 'Возраст: 10-50 лет';
  }
  if (form.graduationYear && (isNaN(form.graduationYear) || form.graduationYear < 2024 || form.graduationYear > 2035)) {
    errors.graduationYear = 'Год: 2024-2035';
  }

  return { valid: valid && Object.keys(errors).length === 0, errors };
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate login format (alphanumeric, dots, underscores, 3-30 chars)
 */
export function isValidLogin(login) {
  if (!login) return false;
  return /^[a-zA-Z0-9._]{3,30}$/.test(login);
}

/**
 * Validate password strength (min 8 chars, at least 1 letter + 1 number)
 */
export function isStrongPassword(password) {
  if (!password || password.length < 8) return false;
  return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}
