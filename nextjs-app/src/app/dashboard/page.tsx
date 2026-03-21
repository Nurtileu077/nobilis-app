'use client';

import {
  FileText, FolderOpen, BookOpen, Coins, Flame,
  CheckCircle, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import DeadlineAlert from '@/components/dashboard/DeadlineAlert';

// Mock data — will be replaced with real API calls
const MOCK_STATS = {
  applications: 4,
  documentsUploaded: 7,
  documentsTotal: 12,
  pendingTasks: 3,
  nextDeadline: '2025-03-15',
  streak: 12,
  coins: 450,
  xp: 2300,
  level: 5,
};

const MOCK_APPLICATIONS = [
  { id: '1', university: 'University of Toronto', status: 'UNDER_REVIEW', deadline: '2025-03-15' },
  { id: '2', university: 'KIT Karlsruhe', status: 'GATHERING_DOCS', deadline: '2025-04-01' },
  { id: '3', university: 'Korea University', status: 'SUBMITTED', deadline: '2025-02-28' },
];

const MOCK_TASKS = [
  { id: '1', title: 'Загрузить транскрипт', done: false, dueDate: '2025-03-10' },
  { id: '2', title: 'Написать эссе для UofT', done: false, dueDate: '2025-03-12' },
  { id: '3', title: 'Сдать IELTS Mock Test', done: true, dueDate: '2025-03-05' },
];

const statusColors: Record<string, string> = {
  GATHERING_DOCS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  OFFER_RECEIVED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

const statusLabels: Record<string, string> = {
  GATHERING_DOCS: 'Сбор документов',
  SUBMITTED: 'Отправлено',
  UNDER_REVIEW: 'На рассмотрении',
  INTERVIEW: 'Интервью',
  OFFER_RECEIVED: 'Оффер',
  ACCEPTED: 'Принято',
  REJECTED: 'Отказ',
};

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const stats = MOCK_STATS;
  const nearestDeadline = daysUntil(stats.nextDeadline);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Привет! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Вот что происходит с твоими заявками
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} iconColor="text-primary-500" value={stats.applications} label="Заявки" />
        <StatCard icon={FolderOpen} iconColor="text-green-500" value={`${stats.documentsUploaded}/${stats.documentsTotal}`} label="Документы" delay={0.05} />
        <StatCard icon={Flame} iconColor="text-orange-500" value={stats.streak} label="Streak дней" delay={0.1} />
        <StatCard icon={Coins} iconColor="text-nobilis-gold" value={stats.coins} label="Nobilis Coins" delay={0.15} />
      </div>

      {/* Deadline alert */}
      <DeadlineAlert daysLeft={nearestDeadline} university="University of Toronto" date={stats.nextDeadline} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Мои заявки</h2>
            <Link href="/dashboard/applications" className="text-xs text-primary-500 hover:underline">
              Все →
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_APPLICATIONS.map((app) => (
              <div key={app.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{app.university}</p>
                  <p className="text-xs text-gray-400">
                    Дедлайн: {new Date(app.deadline).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[app.status] || ''}`}>
                  {statusLabels[app.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Задачи от ментора</h2>
            <span className="text-xs text-gray-400">
              {MOCK_TASKS.filter((t) => !t.done).length} осталось
            </span>
          </div>
          <div className="space-y-3">
            {MOCK_TASKS.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    task.done
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {task.done && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/prep', icon: BookOpen, label: 'Начать тренировку', color: 'text-blue-500' },
          { href: '/dashboard/essays', icon: TrendingUp, label: 'Написать эссе', color: 'text-purple-500' },
          { href: '/dashboard/documents', icon: FolderOpen, label: 'Загрузить документ', color: 'text-green-500' },
          { href: '/rewards', icon: Coins, label: 'Магазин наград', color: 'text-nobilis-gold' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4
                       hover:shadow-md transition-all text-center"
          >
            <action.icon size={24} className={`${action.color} mx-auto mb-2`} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
