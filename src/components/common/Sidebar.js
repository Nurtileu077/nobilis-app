import React from 'react';
import NobilisLogo from './NobilisLogo';
import I from './Icons';
import { getInitials } from '../../data/utils';

const ROLE_LABELS = {
  student: 'Студент',
  curator: 'Куратор',
  teacher: 'Преподаватель'
};

const Sidebar = ({ user, view, navItems, onNavigate, onLogout }) => (
  <div className="w-64 bg-white border-r flex flex-col shadow-sm">
    <div className="p-5 border-b">
      <div className="flex items-center gap-3">
        <NobilisLogo size={40} />
        <div>
          <div className="font-serif font-bold text-[#1a3a32] text-lg">NOBILIS</div>
          <div className="text-xs tracking-wider text-[#c9a227]">ACADEMY</div>
        </div>
      </div>
    </div>

    <nav className="flex-1 p-3 overflow-y-auto">
      <div className="space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all nav-item ${
              view === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={view === item.id ? { background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' } : {}}
          >
            <item.icon />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>

    <div className="p-4 border-t">
      <div className="flex items-center gap-3 mb-4 px-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}
        >
          {getInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate text-gray-800">{user.name}</div>
          <div className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <I.Logout />
        <span className="text-sm">Выйти</span>
      </button>
    </div>
  </div>
);

export default Sidebar;
