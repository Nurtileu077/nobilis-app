'use client';

import { AlertTriangle } from 'lucide-react';

interface DeadlineAlertProps {
  daysLeft: number;
  university: string;
  date: string;
}

export default function DeadlineAlert({ daysLeft, university, date }: DeadlineAlertProps) {
  if (daysLeft > 14) return null;

  return (
    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
      <AlertTriangle size={20} className="text-red-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-red-800 dark:text-red-400">
          Ближайший дедлайн через {daysLeft} дней
        </p>
        <p className="text-xs text-red-600/60 dark:text-red-400/60">
          {university} — {date}
        </p>
      </div>
    </div>
  );
}
