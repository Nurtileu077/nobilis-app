'use client';

import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TripwireBannerProps {
  onBook: () => void;
}

export default function TripwireBanner({ onBook }: TripwireBannerProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      className="w-full max-w-md mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="glass-card p-4 border-nobilis-gold/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-nobilis-gold/20 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-nobilis-gold" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm">
              Бесплатная консультация с ментором
            </h4>
            <p className="text-xs text-white/50 mt-1">
              Разберём твой профиль и составим стратегию поступления за 30 минут
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Clock size={14} className="text-red-400" />
              <span className="text-xs text-red-400 font-medium">
                Осталось {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-white/30">· 3 слота сегодня</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBook}
          className="w-full mt-3 py-2.5 rounded-xl bg-nobilis-gold text-nobilis-navy
                     font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Забронировать слот
        </button>
      </div>
    </motion.div>
  );
}
