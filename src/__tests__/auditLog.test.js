import { logAction, getAuditLog, clearAuditLog, ACTIONS } from '../utils/auditLog';

// Use real localStorage (jsdom provides it)

describe('Audit Log', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('logAction', () => {
    it('creates an audit log entry', () => {
      const user = { id: 'usr1', name: 'Test User', role: 'director' };
      const entry = logAction(ACTIONS.LOGIN, user, { method: 'supabase' });

      expect(entry).toMatchObject({
        action: 'auth.login',
        userId: 'usr1',
        userName: 'Test User',
        userRole: 'director',
        details: { method: 'supabase' },
      });
      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
    });

    it('stores entries in localStorage', () => {
      const user = { id: 'usr1', name: 'Test', role: 'curator' };
      logAction(ACTIONS.STUDENT_CREATE, user, { studentName: 'Иван' });

      const stored = JSON.parse(localStorage.getItem('nobilis_audit_log'));
      expect(stored).toHaveLength(1);
      expect(stored[0].action).toBe('student.create');
    });

    it('handles null user gracefully', () => {
      const entry = logAction('test.action', null);
      expect(entry.userId).toBe('unknown');
      expect(entry.userName).toBe('Система');
    });
  });

  describe('getAuditLog', () => {
    it('returns empty array when no logs exist', () => {
      const logs = getAuditLog();
      expect(logs).toEqual([]);
    });

    it('filters by action prefix', () => {
      const user = { id: 'u1', name: 'Admin', role: 'director' };
      logAction(ACTIONS.LOGIN, user);
      logAction(ACTIONS.STUDENT_CREATE, user);
      logAction(ACTIONS.STUDENT_UPDATE, user);

      const studentLogs = getAuditLog({ action: 'student' });
      expect(studentLogs).toHaveLength(2);
    });

    it('respects limit', () => {
      const user = { id: 'u1', name: 'Test', role: 'curator' };
      for (let i = 0; i < 10; i++) {
        logAction('test.action', user);
      }

      const limited = getAuditLog({ limit: 3 });
      expect(limited).toHaveLength(3);
    });
  });

  describe('clearAuditLog', () => {
    it('clears all log entries', () => {
      logAction('test', { id: '1', name: 'T', role: 'a' });
      clearAuditLog();
      expect(localStorage.getItem('nobilis_audit_log')).toBeNull();
    });
  });

  describe('ACTIONS', () => {
    it('has expected action types', () => {
      expect(ACTIONS.LOGIN).toBe('auth.login');
      expect(ACTIONS.LOGOUT).toBe('auth.logout');
      expect(ACTIONS.STUDENT_CREATE).toBe('student.create');
      expect(ACTIONS.TASK_CREATE).toBe('task.create');
    });
  });
});
