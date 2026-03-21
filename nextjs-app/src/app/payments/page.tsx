'use client';

import { useState } from 'react';
import { CreditCard, Coins, DollarSign } from 'lucide-react';
import InvoiceCard, { InvoiceData, formatMoney } from '@/components/payments/InvoiceCard';

const MOCK_INVOICES: InvoiceData[] = [
  { id: '1', description: 'Менторство — Март 2025', amount: 29900, currency: 'KZT', status: 'PENDING', dueDate: '2025-03-15' },
  { id: '2', description: 'Консультация — Февраль', amount: 15000, currency: 'KZT', status: 'PAID', dueDate: '2025-02-15', paidAt: '2025-02-14' },
  { id: '3', description: 'Менторство — Февраль 2025', amount: 29900, currency: 'KZT', status: 'PAID', dueDate: '2025-02-01', paidAt: '2025-01-30' },
  { id: '4', description: 'Подготовка документов', amount: 50000, currency: 'KZT', status: 'OVERDUE', dueDate: '2025-01-15' },
];

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
            {MOCK_INVOICES.map((inv, i) => (
              <InvoiceCard key={inv.id} invoice={inv} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
