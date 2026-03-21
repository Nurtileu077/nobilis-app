// =============================================
// NOBILIS ACADEMY - AUDIT LOGGING
// =============================================

const AUDIT_KEY = 'nobilis_audit_log';
const MAX_ENTRIES = 500;

/**
 * Log an action to the audit trail
 * @param {string} action - action type (e.g., 'login', 'student.create', 'schedule.update')
 * @param {Object} user - user performing the action { id, name, role }
 * @param {Object} details - additional details about the action
 */
export function logAction(action, user, details = {}) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    timestamp: new Date().toISOString(),
    action,
    userId: user?.id || 'unknown',
    userName: user?.name || 'Система',
    userRole: user?.role || 'system',
    details,
  };

  // Store locally
  try {
    const existing = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable
  }

  // Console log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${action}`, { user: user?.name, ...details });
  }

  return entry;
}

/**
 * Get audit log entries
 * @param {Object} filters - { action, userId, startDate, endDate, limit }
 * @returns {Object[]} - filtered log entries
 */
export function getAuditLog(filters = {}) {
  try {
    let entries = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');

    if (filters.action) {
      entries = entries.filter(e => e.action.startsWith(filters.action));
    }
    if (filters.userId) {
      entries = entries.filter(e => e.userId === filters.userId);
    }
    if (filters.startDate) {
      entries = entries.filter(e => new Date(e.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      entries = entries.filter(e => new Date(e.timestamp) <= new Date(filters.endDate));
    }

    return entries.slice(0, filters.limit || 100);
  } catch {
    return [];
  }
}

/**
 * Clear audit log
 */
export function clearAuditLog() {
  try { localStorage.removeItem(AUDIT_KEY); } catch { /* ignore */ }
}

// Predefined action types
export const ACTIONS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  STUDENT_CREATE: 'student.create',
  STUDENT_UPDATE: 'student.update',
  STUDENT_DELETE: 'student.delete',
  TEACHER_CREATE: 'teacher.create',
  TEACHER_UPDATE: 'teacher.update',
  SCHEDULE_CREATE: 'schedule.create',
  SCHEDULE_UPDATE: 'schedule.update',
  SCHEDULE_DELETE: 'schedule.delete',
  TASK_CREATE: 'task.create',
  TASK_COMPLETE: 'task.complete',
  LEAD_CREATE: 'lead.create',
  LEAD_UPDATE: 'lead.update',
  PAYMENT_ADD: 'payment.add',
  DOCUMENT_UPLOAD: 'document.upload',
  SETTINGS_CHANGE: 'settings.change',
};
