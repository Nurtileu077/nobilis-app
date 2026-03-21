'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, MessageSquare, CheckSquare, Plus, Search,
  ChevronRight, Clock, AlertCircle,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'at_risk' | 'on_track';
  applications: number;
  pendingTasks: number;
  lastMessage: string;
  unreadMessages: number;
}

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Алия Нурланова', avatar: '👩', status: 'on_track', applications: 4, pendingTasks: 1, lastMessage: 'Загрузила транскрипт!', unreadMessages: 2 },
  { id: '2', name: 'Дамир Касымов', avatar: '👨', status: 'at_risk', applications: 3, pendingTasks: 4, lastMessage: 'Когда дедлайн?', unreadMessages: 5 },
  { id: '3', name: 'Айгерим Бекова', avatar: '👩', status: 'active', applications: 5, pendingTasks: 2, lastMessage: 'Спасибо за ревью!', unreadMessages: 0 },
  { id: '4', name: 'Арман Жумабеков', avatar: '👨', status: 'on_track', applications: 2, pendingTasks: 0, lastMessage: 'Получил оффер от KIT!', unreadMessages: 1 },
];

const STATUS_CONFIG = {
  active: { label: 'Активен', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  at_risk: { label: 'Внимание', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  on_track: { label: 'На пути', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
};

export default function MentorPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'at_risk' | 'on_track'>('all');

  const filtered = MOCK_STUDENTS.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalTasks = MOCK_STUDENTS.reduce((acc, s) => acc + s.pendingTasks, 0);
  const atRisk = MOCK_STUDENTS.filter((s) => s.status === 'at_risk').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentor CRM</h1>
          <button className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Задача
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
            <Users size={20} className="text-primary-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{MOCK_STUDENTS.length}</div>
            <div className="text-xs text-gray-400">Студентов</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
            <CheckSquare size={20} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{totalTasks}</div>
            <div className="text-xs text-gray-400">Задач ожидает</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center">
            <AlertCircle size={20} className="text-red-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">{atRisk}</div>
            <div className="text-xs text-gray-400">Требуют внимания</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск студента..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'at_risk', 'active', 'on_track'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                filter === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
              }`}
            >
              {f === 'all' ? 'Все' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                  {student.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[student.status].color}`}>
                      {STATUS_CONFIG[student.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {student.applications} заявок · {student.pendingTasks} задач
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/mentor/chat/${student.id}`}
                    className="relative p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-primary-50 hover:text-primary-500"
                  >
                    <MessageSquare size={18} />
                    {student.unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {student.unreadMessages}
                      </span>
                    )}
                  </Link>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} />
                Последнее: &ldquo;{student.lastMessage}&rdquo;
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
