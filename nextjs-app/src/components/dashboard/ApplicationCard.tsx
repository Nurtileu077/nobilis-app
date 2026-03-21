'use client';

import { motion } from 'framer-motion';

export type ApplicationStatus = 'GATHERING_DOCS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER_RECEIVED' | 'ACCEPTED' | 'REJECTED';

export interface ApplicationData {
  id: string;
  university: string;
  program: string;
  country: string;
  status: ApplicationStatus;
  deadline: string;
  scholarship?: number;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; step: number }> = {
  GATHERING_DOCS: { label: 'Сбор документов', color: 'bg-yellow-500', step: 1 },
  SUBMITTED: { label: 'Отправлено', color: 'bg-blue-500', step: 2 },
  UNDER_REVIEW: { label: 'На рассмотрении', color: 'bg-purple-500', step: 3 },
  INTERVIEW: { label: 'Интервью', color: 'bg-indigo-500', step: 4 },
  OFFER_RECEIVED: { label: 'Оффер получен', color: 'bg-green-500', step: 5 },
  ACCEPTED: { label: 'Принято', color: 'bg-emerald-500', step: 6 },
  REJECTED: { label: 'Отказ', color: 'bg-red-500', step: 0 },
};

const STEPS = ['Документы', 'Отправлено', 'Рассмотрение', 'Интервью', 'Оффер', 'Принято'];

function ProgressBar({ status }: { status: ApplicationStatus }) {
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

interface ApplicationCardProps {
  app: ApplicationData;
  index?: number;
}

export default function ApplicationCard({ app, index = 0 }: ApplicationCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{app.university}</h3>
          <p className="text-sm text-gray-500">{app.program}</p>
          <p className="text-xs text-gray-400 mt-1">
            {app.country} · Дедлайн: {new Date(app.deadline).toLocaleDateString('ru-RU')}
          </p>
          {app.scholarship ? (
            <p className="text-xs text-green-500 mt-1">Стипендия: ${app.scholarship?.toLocaleString()}/год</p>
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
  );
}
