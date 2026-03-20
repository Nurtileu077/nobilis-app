'use client';

import { motion } from 'framer-motion';
import { Star, DollarSign, Award } from 'lucide-react';

interface UniversityCardProps {
  name: string;
  country: string;
  ranking?: number;
  tuition: string;
  match: number; // 0-100
  scholarship: boolean;
  delay?: number;
}

export default function UniversityCard({
  name,
  country,
  ranking,
  tuition,
  match,
  scholarship,
  delay = 0,
}: UniversityCardProps) {
  return (
    <motion.div
      className="glass-card p-4 flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Match badge */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
          match >= 80
            ? 'bg-green-500/20 text-green-400'
            : match >= 60
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-orange-500/20 text-orange-400'
        }`}
      >
        {match}%
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white truncate">{name}</h4>
        <p className="text-sm text-white/50">{country}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
          {ranking && (
            <span className="flex items-center gap-1">
              <Star size={12} /> #{ranking}
            </span>
          )}
          <span className="flex items-center gap-1">
            <DollarSign size={12} /> {tuition}
          </span>
          {scholarship && (
            <span className="flex items-center gap-1 text-nobilis-gold">
              <Award size={12} /> Стипендия
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
