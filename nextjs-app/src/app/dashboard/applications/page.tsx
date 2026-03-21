'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import ApplicationCard, { ApplicationData, ApplicationStatus, STATUS_CONFIG } from '@/components/dashboard/ApplicationCard';

const MOCK_APPS: ApplicationData[] = [
  { id: '1', university: 'University of Toronto', program: 'Computer Science BSc', country: 'Канада', status: 'UNDER_REVIEW', deadline: '2025-03-15', scholarship: 5000 },
  { id: '2', university: 'KIT Karlsruhe', program: 'Mechanical Engineering', country: 'Германия', status: 'GATHERING_DOCS', deadline: '2025-04-01' },
  { id: '3', university: 'Korea University', program: 'Business Administration', country: 'Ю. Корея', status: 'SUBMITTED', deadline: '2025-02-28', scholarship: 8000 },
  { id: '4', university: 'Masaryk University', program: 'Information Technology', country: 'Чехия', status: 'OFFER_RECEIVED', deadline: '2025-01-31', scholarship: 0 },
  { id: '5', university: 'University of Arizona', program: 'Data Science', country: 'США', status: 'INTERVIEW', deadline: '2025-03-20', scholarship: 12000 },
];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

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
          Университеты обычно отвечают через 3-8 недель после подачи. Это нормально — не волнуйся!
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
        {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, { label: string }][]).map(([key, val]) => {
          const count = MOCK_APPS.filter((a) => a.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
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
          <ApplicationCard key={app.id} app={app} index={i} />
        ))}
      </div>
    </div>
  );
}
