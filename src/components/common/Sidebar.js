import React, { useEffect, useRef, memo } from 'react';
import NobilisLogo from './NobilisLogo';
import I from './Icons';
import ThemeToggle from './ThemeToggle';
import { getInitials } from '../../data/utils';

const ROLE_LABELS = {
  student: 'Студент',
  curator: 'Куратор',
  teacher: 'Преподаватель'
};

const Sidebar = memo(({ user, view, navItems, onNavigate, onLogout, isOpen, onToggle, onAvatarClick, taskCount }) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onToggle) onToggle();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} aria-hidden="true" />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r flex flex-col shadow-sm transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        role="navigation"
        aria-label="Главное меню"
      >
        <div className="p-5 border-b">
          <div className="flex items-center gap-3 pl-2">
            <NobilisLogo size={64} />
            <div>
              <div className="font-serif font-bold text-nobilis-green text-lg">NOBILIS</div>
              <div className="text-xs tracking-wider text-nobilis-gold">ACADEMY</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto" aria-label="Навигация">
          <div className="space-y-1" role="list">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); if (onToggle) onToggle(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all nav-item ${
                  view === item.id ? 'text-white shadow-md bg-gradient-nobilis' : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-current={view === item.id ? 'page' : undefined}
                role="listitem"
              >
                <item.icon aria-hidden="true" />
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {item.id === 'tasks' && taskCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center ${
                      view === item.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}
                    aria-label={`${taskCount} задач`}
                  >
                    {taskCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer overflow-hidden hover:ring-2 hover:ring-nobilis-gold transition-all ${!user.avatar ? 'bg-gradient-gold' : ''}`}
              onClick={onAvatarClick}
              aria-label={`Профиль ${user.name}`}
            >
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user.name)}
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
              aria-label="Выйти из аккаунта"
            >
              <I.Logout aria-hidden="true" />
              <span className="text-sm">Выйти</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
