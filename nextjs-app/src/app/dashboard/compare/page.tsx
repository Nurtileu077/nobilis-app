'use client';

import { motion } from 'framer-motion';
import { Star, DollarSign, Award, TrendingUp, MapPin } from 'lucide-react';

interface OfferData {
  university: string;
  country: string;
  tuition: number;
  scholarship: number;
  ranking: number;
  acceptanceRate: number;
  avgSalary: number;
  roi: number;
  isBestMatch: boolean;
}

const MOCK_OFFERS: OfferData[] = [
  {
    university: 'University of Toronto',
    country: 'Канада',
    tuition: 25000,
    scholarship: 5000,
    ranking: 21,
    acceptanceRate: 43,
    avgSalary: 65000,
    roi: 3.2,
    isBestMatch: false,
  },
  {
    university: 'KIT Karlsruhe',
    country: 'Германия',
    tuition: 1500,
    scholarship: 0,
    ranking: 120,
    acceptanceRate: 50,
    avgSalary: 55000,
    roi: 36.6,
    isBestMatch: true,
  },
  {
    university: 'Korea University',
    country: 'Ю. Корея',
    tuition: 8000,
    scholarship: 8000,
    ranking: 74,
    acceptanceRate: 35,
    avgSalary: 45000,
    roi: 45.0,
    isBestMatch: false,
  },
];

const COLUMNS = [
  { key: 'tuition', label: 'Стоимость/год', format: (v: number) => `$${v.toLocaleString()}`, icon: DollarSign, best: 'min' },
  { key: 'scholarship', label: 'Стипендия/год', format: (v: number) => v > 0 ? `$${v.toLocaleString()}` : '—', icon: Award, best: 'max' },
  { key: 'ranking', label: 'Рейтинг QS', format: (v: number) => `#${v}`, icon: Star, best: 'min' },
  { key: 'acceptanceRate', label: 'Acceptance Rate', format: (v: number) => `${v}%`, icon: TrendingUp, best: 'max' },
  { key: 'avgSalary', label: 'Средняя ЗП после', format: (v: number) => `$${v.toLocaleString()}`, icon: DollarSign, best: 'max' },
  { key: 'roi', label: 'ROI (x)', format: (v: number) => `${v.toFixed(1)}x`, icon: TrendingUp, best: 'max' },
] as const;

function getBestValue(offers: OfferData[], key: string, best: string): number {
  const values = offers.map((o) => (o as any)[key] as number);
  return best === 'min' ? Math.min(...values) : Math.max(...values);
}

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={24} className="text-primary-500" />
        Сравнение офферов
      </h1>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Headers */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `160px repeat(${MOCK_OFFERS.length}, 1fr)` }}>
            <div />
            {MOCK_OFFERS.map((offer) => (
              <motion.div
                key={offer.university}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 text-center relative ${
                  offer.isBestMatch
                    ? 'border-green-400 dark:border-green-500/50 ring-2 ring-green-400/20'
                    : 'border-gray-100 dark:border-slate-700'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {offer.isBestMatch && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                    BEST MATCH
                  </span>
                )}
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{offer.university}</h3>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
                  <MapPin size={12} /> {offer.country}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Rows */}
          {COLUMNS.map((col, i) => {
            const bestVal = getBestValue(MOCK_OFFERS, col.key, col.best);
            return (
              <motion.div
                key={col.key}
                className="grid gap-3 mt-2"
                style={{ gridTemplateColumns: `160px repeat(${MOCK_OFFERS.length}, 1fr)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <col.icon size={14} />
                  {col.label}
                </div>
                {MOCK_OFFERS.map((offer) => {
                  const val = (offer as any)[col.key] as number;
                  const isBest = val === bestVal;
                  return (
                    <div
                      key={offer.university}
                      className={`text-center py-3 rounded-xl text-sm font-medium ${
                        isBest
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {col.format(val)}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
