'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, FileText, Clock, CheckCircle, AlertTriangle,
  Download, Coins, DollarSign,
} from 'lucide-react';

interface Invoice {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidAt?: string;
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', description: 'Менторство — Март 2025', amount: 29900, currency: 'KZT', status: 'PENDING', dueDate: '2025-03-15' },
  { id: '2', description: 'Консультация — Февраль', amount: 15000, currency: 'KZT', status: 'PAID', dueDate: '2025-02-15', paidAt: '2025-02-14' },
  { id: '3', description: 'Менторство — Февраль 2025', amount: 29900, currency: 'KZT', status: 'PAID', dueDate: '2025-02-01', paidAt: '2025-01-30' },
  { id: '4', description: 'Подготовка документов', amount: 50000, currency: 'KZT', status: 'OVERDUE', dueDate: '2025-01-15' },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Ожидает', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10', icon: Clock },
  PAID: { label: 'Оплачено', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10', icon: CheckCircle },
  OVERDUE: { label: 'Просрочен', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10', icon: AlertTriangle },
};

function formatMoney(amount: number, currency: string) {
  if (currency === 'KZT') return `${amount.toLocaleString()} ₸`;
  if (currency === 'USD') return `$${(amount / 100).toFixed(2)}`;
  return `${amount} ${currency}`;
}

export default function PaymentsPage() {
  const [useCoins, setUseCoins] = useState(false);
  const coinsBalance = 450;
  const coinDiscount = Math.min(coinsBalance * 10, 4500); // 1 coin = 10 KZT

  const pendingInvoice = MOCK_INVOICES.find((i) => i.status === 'PENDING');
  const totalPaid = MOCK_INVOICES.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={24} className="text-primary-500" />
          Финансы
        </h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <DollarSign size={18} className="text-green-500 mb-1" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">{formatMoney(totalPaid, 'KZT')}</div>
            <div className="text-xs text-gray-400">Всего оплачено</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
            <Coins size={18} className="text-nobilis-gold mb-1" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">{coinsBalance}</div>
            <div className="text-xs text-gray-400">Nobilis Coins</div>
          </div>
        </div>

        {/* Pending payment */}
        {pendingInvoice && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-primary-200 dark:border-primary-500/30 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{pendingInvoice.description}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {useCoins
                ? formatMoney(pendingInvoice.amount - coinDiscount, 'KZT')
                : formatMoney(pendingInvoice.amount, 'KZT')}
            </p>
            {useCoins && (
              <p className="text-xs text-green-500 mt-1">
                Скидка {formatMoney(coinDiscount, 'KZT')} ({coinsBalance} coins)
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Оплатить до {new Date(pendingInvoice.dueDate).toLocaleDateString('ru-RU')}
            </p>

            {/* Coin discount checkbox */}
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={useCoins}
                onChange={(e) => setUseCoins(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-nobilis-gold focus:ring-nobilis-gold"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Coins size={14} className="text-nobilis-gold" />
                Использовать {coinsBalance} Nobilis Coins (-{formatMoney(coinDiscount, 'KZT')})
              </span>
            </label>

            <button className="w-full mt-4 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold flex items-center justify-center gap-2">
              Оплатить
            </button>

            <p className="text-center text-[10px] text-gray-400 mt-2">
              Apple Pay · Google Pay · Kaspi · Visa/MC
            </p>
          </div>
        )}

        {/* Invoice list */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            История платежей
          </h3>
          <div className="space-y-2">
            {MOCK_INVOICES.map((inv, i) => {
              const config = STATUS_CONFIG[inv.status];
              const Icon = config.icon;
              return (
                <motion.div
                  key={inv.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Icon size={18} className={config.color.split(' ')[0]} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.description}</p>
                    <p className="text-xs text-gray-400">
                      {inv.paidAt
                        ? `Оплачено ${new Date(inv.paidAt).toLocaleDateString('ru-RU')}`
                        : `До ${new Date(inv.dueDate).toLocaleDateString('ru-RU')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatMoney(inv.amount, inv.currency)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
