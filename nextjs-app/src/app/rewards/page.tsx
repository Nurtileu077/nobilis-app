'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gift, Clock, CheckCircle, Sparkles, ShoppingCart } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: 'discount' | 'feature' | 'merch';
  available: boolean;
}

const MOCK_REWARDS: Reward[] = [
  { id: '1', name: 'Скидка 10% на менторство', description: 'Применяется к следующему платежу', cost: 500, icon: '💰', category: 'discount', available: true },
  { id: '2', name: 'AI эссе ревью (1 шт)', description: 'Детальный анализ твоего эссе от AI', cost: 200, icon: '📝', category: 'feature', available: true },
  { id: '3', name: 'Доп. жизнь в Prep', description: '+1 жизнь для квизов', cost: 50, icon: '❤️', category: 'feature', available: true },
  { id: '4', name: 'Nobilis стикерпак', description: 'Эксклюзивные стикеры для Telegram', cost: 100, icon: '🎨', category: 'merch', available: true },
  { id: '5', name: 'Скидка 20% на консультацию', description: 'На следующую видео-консультацию', cost: 1000, icon: '🎯', category: 'discount', available: true },
  { id: '6', name: 'Премиум тема приложения', description: 'Эксклюзивная золотая тема', cost: 300, icon: '✨', category: 'feature', available: true },
];

const MOCK_HISTORY = [
  { id: '1', action: 'EARN' as const, amount: 50, reason: 'Ежедневный челлендж', date: '2025-03-08' },
  { id: '2', action: 'EARN' as const, amount: 25, reason: 'Квиз Reading', date: '2025-03-07' },
  { id: '3', action: 'SPEND' as const, amount: 50, reason: 'Доп. жизнь', date: '2025-03-06' },
  { id: '4', action: 'EARN' as const, amount: 100, reason: 'Streak бонус (7 дней)', date: '2025-03-05' },
];

export default function RewardsPage() {
  const [tab, setTab] = useState<'shop' | 'history'>('shop');
  const balance = 450;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-nobilis-gold/90 to-yellow-500 rounded-2xl p-6 text-nobilis-navy">
          <div className="flex items-center gap-2 mb-1">
            <Coins size={20} />
            <span className="text-sm font-medium opacity-80">Nobilis Coins</span>
          </div>
          <div className="text-4xl font-black">{balance}</div>
          <p className="text-sm opacity-60 mt-1">Зарабатывай монеты через квизы и streak</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setTab('shop')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'shop' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <ShoppingCart size={14} className="inline mr-1" /> Магазин
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'history' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <Clock size={14} className="inline mr-1" /> История
          </button>
        </div>

        {tab === 'shop' ? (
          <div className="grid grid-cols-2 gap-3">
            {MOCK_REWARDS.map((reward, i) => (
              <motion.div
                key={reward.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="text-3xl mb-2">{reward.icon}</div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{reward.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{reward.description}</p>
                <button
                  disabled={balance < reward.cost}
                  className={`w-full mt-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    balance >= reward.cost
                      ? 'bg-nobilis-gold text-nobilis-navy hover:brightness-110 active:scale-95'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Coins size={12} /> {reward.cost}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_HISTORY.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.action === 'EARN' ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'
                }`}>
                  {item.action === 'EARN' ? (
                    <Sparkles size={14} className="text-green-500" />
                  ) : (
                    <ShoppingCart size={14} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{item.reason}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <span className={`text-sm font-bold ${
                  item.action === 'EARN' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {item.action === 'EARN' ? '+' : '-'}{item.amount}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
