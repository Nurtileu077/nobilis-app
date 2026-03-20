'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Filter } from 'lucide-react';

type Status = 'GATHERING_DOCS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER_RECEIVED' | 'ACCEPTED' | 'REJECTED';

interface Application {
  id: string;
  university: string;
  program: string;
  country: string;
  status: Status;
  deadline: string;
  scholarship?: number;
}

const MOCK_APPS: Application[] = [
  { id: '1', university: 'University of Toronto', program: 'Computer Science BSc', country: 'Канада', status: 'UNDER_REVIEW', deadline: '2025-03-15', scholarship: 5000 },
  { id: '2', university: 'KIT Karlsruhe', program: 'Mechanical Engineering', country: 'Германия', status: 'GATHERING_DOCS', deadline: '2025-04-01' },
  { id: '3', university: 'Korea University', program: 'Business Administration', country: 'Ю. Корея', status: 'SUBMITTED', deadline: '2025-02-28', scholarship: 8000 },
  { id: '4', university: 'Masaryk University', program: 'Information Technology', country: 'Чехия', status: 'OFFER_RECEIVED', deadline: '2025-01-31', scholarship: 0 },
  { id: '5', university: 'University of Arizona', program: 'Data Science', country: 'США', status: 'INTERVIEW', deadline: '2025-03-20', scholarship: 12000 },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; step: number }> = {
  GATHERING_DOCS: { label: 'Сбор документов', color: 'bg-yellow-500', step: 1 },
  SUBMITTED: { label: 'Отправлено', color: 'bg-blue-500', step: 2 },
  UNDER_REVIEW: { label: 'На рассмотрении', color: 'bg-purple-500', step: 3 },
  INTERVIEW: { label: 'Интервью', color: 'bg-indigo-500', step: 4 },
  OFFER_RECEIVED: { label: 'Оффер получен', color: 'bg-green-500', step: 5 },
  ACCEPTED: { label: 'Принято', color: 'bg-emerald-500', step: 6 },
  REJECTED: { label: 'Отказ', color: 'bg-red-500', step: 0 },
};

const STEPS = ['Документы', 'Отправлено', 'Рассмотрение', 'Интервью', 'Оффер', 'Принято'];

function ProgressBar({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  if (status === 'REJECTED') return <span className="text-xs text-red-500">Отказ</span>;

  return (
    <div className="flex gap-1 mt-2">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i < config.step ? config.color : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');

  const apps = filter === 'ALL' ? MOCK_APPS : MOCK_APPS.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Мои заявки</h1>
        <button className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium flex items-center gap-2 hover:bg-primary-600 transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {/* Anti-panic banner */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-500/20">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 Университеты обычно отвечают через 3-8 недель после подачи. Это нормально — не волнуйся!
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setFilter('ALL')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filter === 'ALL' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
          }`}
        >
          Все ({MOCK_APPS.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => {
          const count = MOCK_APPS.filter((a) => a.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key as Status)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === key ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
              }`}
            >
              {val.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Application cards */}
      <div className="space-y-3">
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{app.university}</h3>
                <p className="text-sm text-gray-500">{app.program}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {app.country} · Дедлайн: {new Date(app.deadline).toLocaleDateString('ru-RU')}
                </p>
                {app.scholarship ? (
                  <p className="text-xs text-green-500 mt-1">💰 Стипендия: ${app.scholarship?.toLocaleString()}/год</p>
                ) : null}
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium text-white ${STATUS_CONFIG[app.status].color}`}
                >
                  {STATUS_CONFIG[app.status].label}
                </span>
              </div>
            </div>
            <ProgressBar status={app.status} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
