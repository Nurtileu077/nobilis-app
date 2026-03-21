'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, LucideIcon } from 'lucide-react';

export interface InvoiceData {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt?: string;
}

const STATUS_CONFIG: Record<InvoiceData['status'], { label: string; color: string; icon: LucideIcon }> = {
  PENDING: { label: 'Ожидает', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10', icon: Clock },
  PAID: { label: 'Оплачено', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10', icon: CheckCircle },
  OVERDUE: { label: 'Просрочен', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10', icon: AlertTriangle },
};

export function formatMoney(amount: number, currency: string) {
  if (currency === 'KZT') return `${amount.toLocaleString()} ₸`;
  if (currency === 'USD') return `$${(amount / 100).toFixed(2)}`;
  return `${amount} ${currency}`;
}

interface InvoiceCardProps {
  invoice: InvoiceData;
  index?: number;
}

export default function InvoiceCard({ invoice, index = 0 }: InvoiceCardProps) {
  const config = STATUS_CONFIG[invoice.status];
  const Icon = config.icon;

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Icon size={18} className={config.color.split(' ')[0]} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{invoice.description}</p>
        <p className="text-xs text-gray-400">
          {invoice.paidAt
            ? `Оплачено ${new Date(invoice.paidAt).toLocaleDateString('ru-RU')}`
            : `До ${new Date(invoice.dueDate).toLocaleDateString('ru-RU')}`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {formatMoney(invoice.amount, invoice.currency)}
        </p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.color}`}>
          {config.label}
        </span>
      </div>
    </motion.div>
  );
}
