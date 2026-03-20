'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Filter, Send, Eye, Star } from 'lucide-react';

interface StudentProfile {
  id: string;
  gpa: number;
  ieltsScore: number;
  country: string;
  interests: string[];
  match: number;
}

const MOCK_STUDENTS: StudentProfile[] = [
  { id: 'S-001', gpa: 3.8, ieltsScore: 7.5, country: 'Казахстан', interests: ['CS', 'AI', 'Math'], match: 95 },
  { id: 'S-002', gpa: 3.5, ieltsScore: 7.0, country: 'Казахстан', interests: ['Business', 'Economics'], match: 88 },
  { id: 'S-003', gpa: 3.9, ieltsScore: 8.0, country: 'Узбекистан', interests: ['Medicine', 'Biology'], match: 92 },
  { id: 'S-004', gpa: 3.2, ieltsScore: 6.5, country: 'Казахстан', interests: ['Engineering', 'Physics'], match: 75 },
  { id: 'S-005', gpa: 3.7, ieltsScore: 7.0, country: 'Кыргызстан', interests: ['Design', 'UX'], match: 82 },
];

export default function ScoutPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Building2 size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nobilis Scout</h1>
          <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
            B2B Portal
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Анонимные профили студентов. Отправьте приглашение, чтобы раскрыть контакты.
        </p>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по GPA, IELTS, интересам..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 flex items-center gap-2 text-sm">
            <Filter size={16} /> Фильтры
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">GPA</th>
                <th className="text-left p-4">IELTS</th>
                <th className="text-left p-4">Страна</th>
                <th className="text-left p-4">Интересы</th>
                <th className="text-left p-4">Match</th>
                <th className="text-right p-4">Действие</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STUDENTS.map((s, i) => (
                <motion.tr
                  key={s.id}
                  className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td className="p-4 text-sm font-mono text-gray-400">{s.id}</td>
                  <td className="p-4">
                    <span className={`text-sm font-semibold ${s.gpa >= 3.5 ? 'text-green-600' : 'text-gray-600'}`}>
                      {s.gpa}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-semibold ${s.ieltsScore >= 7.0 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {s.ieltsScore}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{s.country}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {s.interests.map((int) => (
                        <span key={int} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-gray-500 dark:text-gray-400">
                          {int}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-bold ${
                      s.match >= 90 ? 'text-green-500' : s.match >= 80 ? 'text-blue-500' : 'text-gray-500'
                    }`}>
                      {s.match}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium flex items-center gap-1 ml-auto hover:bg-primary-600">
                      <Send size={12} /> Пригласить
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
