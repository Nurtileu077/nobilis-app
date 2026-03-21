import React, { useState, useEffect, useRef, useCallback } from 'react';
import I from './Icons';

const NOTIFICATIONS_KEY = 'nobilis_notifications';

const generateNotifications = (data, user) => {
  const notifications = [];
  const now = new Date();

  if (!user || !data) return notifications;

  // Deadline notifications for students
  if (user.role === 'student') {
    const student = data.students?.find(s => s.id === user.id || s.profileId === user.id);
    if (student) {
      // Package expiry warnings
      (student.packages || []).forEach(pkg => {
        if (pkg.endDate) {
          const daysLeft = Math.ceil((new Date(pkg.endDate) - now) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0 && daysLeft <= 14) {
            notifications.push({
              id: `pkg-${pkg.id}`,
              type: 'warning',
              title: 'Пакет истекает',
              message: `Пакет ${(pkg.type || '').toUpperCase()} истекает через ${daysLeft} дн.`,
              time: now.toISOString(),
            });
          }
        }
      });

      // Unread chat messages
      const chatId = `student_${student.id}`;
      const msgs = data.chatMessages?.[chatId] || [];
      const unread = msgs.filter(m => !m.read && m.from !== user.id);
      if (unread.length > 0) {
        notifications.push({
          id: `chat-unread-${chatId}`,
          type: 'info',
          title: 'Новые сообщения',
          message: `${unread.length} непрочитанных сообщений`,
          time: unread[unread.length - 1]?.timestamp || now.toISOString(),
        });
      }
    }
  }

  // Task notifications for curators/directors
  if (['curator', 'director', 'academic_director', 'rop', 'coordinator'].includes(user.role)) {
    const pendingTasks = (data.globalTasks || []).filter(t => !t.done);
    if (pendingTasks.length > 0) {
      notifications.push({
        id: 'tasks-pending',
        type: 'info',
        title: 'Незавершённые задачи',
        message: `${pendingTasks.length} задач ожидают выполнения`,
        time: now.toISOString(),
      });
    }

    // Overdue tasks
    const overdue = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
    if (overdue.length > 0) {
      notifications.push({
        id: 'tasks-overdue',
        type: 'error',
        title: 'Просроченные задачи',
        message: `${overdue.length} задач просрочены`,
        time: now.toISOString(),
      });
    }

    // Support tickets
    const openTickets = (data.supportTickets || []).filter(t => !t.resolved);
    if (openTickets.length > 0) {
      notifications.push({
        id: 'support-open',
        type: 'warning',
        title: 'Открытые тикеты',
        message: `${openTickets.length} тикетов без ответа`,
        time: now.toISOString(),
      });
    }

    // Students with low attendance
    const lowAttendance = (data.students || []).filter(s => {
      const pct = s.attendance ? (s.attendance.attended / (s.attendance.total || 1)) * 100 : 100;
      return pct < 70 && s.attendance?.total > 3;
    });
    if (lowAttendance.length > 0) {
      notifications.push({
        id: 'attendance-low',
        type: 'warning',
        title: 'Низкая посещаемость',
        message: `${lowAttendance.length} студентов с посещаемостью < 70%`,
        time: now.toISOString(),
      });
    }
  }

  return notifications;
};

const typeStyles = {
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

const NotificationBell = ({ data, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null);

  const notifications = generateNotifications(data, user);
  const active = notifications.filter(n => !dismissed.includes(n.id));

  const dismiss = useCallback((id) => {
    setDismissed(prev => {
      const next = [...prev, id];
      try { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const dismissAll = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setDismissed(allIds);
    try { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allIds)); } catch { /* ignore */ }
  }, [notifications]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Уведомления${active.length > 0 ? ` (${active.length})` : ''}`}
      >
        <I.Bell />
        {active.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {active.length > 9 ? '9+' : active.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-50 animate-fadeIn overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Уведомления</h3>
            {active.length > 0 && (
              <button onClick={dismissAll} className="text-xs text-nobilis-gold hover:underline">
                Прочитать все
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {active.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                <I.Bell />
                <p className="mt-2 text-sm">Нет новых уведомлений</p>
              </div>
            ) : (
              active.map(n => (
                <div
                  key={n.id}
                  className="p-3 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3 items-start"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeStyles[n.type] || typeStyles.info}`}>
                    {n.type === 'error' ? '!' : n.type === 'warning' ? '!' : 'i'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 flex-shrink-0"
                    aria-label="Скрыть"
                  >
                    <I.Close />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
