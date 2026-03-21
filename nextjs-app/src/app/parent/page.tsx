'use client';

import { motion } from 'framer-motion';
import { Eye, FileText, Bell, TrendingUp, Calendar, Shield } from 'lucide-react';

export default function ParentPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Eye size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Панель родителя</h1>
        </div>

        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-500/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            🔒 Вы видите данные вашего ребёнка в режиме &ldquo;только просмотр&rdquo;
          </p>
        </div>

        {/* Student info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-2xl">
              👩
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Алия Нурланова</h2>
              <p className="text-sm text-gray-500">GPA: 3.6 · IELTS: 7.0</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <FileText size={18} className="text-primary-500 mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">4</div>
            <div className="text-xs text-gray-400">Подано заявок</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <Shield size={18} className="text-green-500 mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">7/12</div>
            <div className="text-xs text-gray-400">Документов</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <TrendingUp size={18} className="text-purple-500 mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">1</div>
            <div className="text-xs text-gray-400">Оффер получен</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <Calendar size={18} className="text-orange-500 mb-1" />
            <div className="text-xl font-bold text-gray-900 dark:text-white">7 дн</div>
            <div className="text-xs text-gray-400">До дедлайна</div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Bell size={14} className="inline mr-1" /> Уведомления
          </h3>
          {[
            { text: 'Masaryk University — оффер получен!', type: 'success', date: '2 дня назад' },
            { text: 'Дедлайн University of Toronto через 7 дней', type: 'warning', date: '5 часов назад' },
            { text: 'IELTS сертификат истекает через 3 месяца', type: 'info', date: '1 день назад' },
          ].map((alert, i) => (
            <motion.div
              key={i}
              className={`rounded-xl p-3 border ${
                alert.type === 'success'
                  ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                  : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-sm text-gray-800 dark:text-gray-200">{alert.text}</p>
              <p className="text-xs text-gray-400 mt-1">{alert.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
