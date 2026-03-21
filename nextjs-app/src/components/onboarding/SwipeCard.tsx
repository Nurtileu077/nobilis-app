'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { Country } from '@/lib/countries';

interface SwipeCardProps {
  country: Country;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export default function SwipeCard({ country, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Like/Nope indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className={`absolute w-full ${isTop ? 'z-10 cursor-grab active:cursor-grabbing' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* Country emoji as large background */}
        <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-20 select-none">
          {country.emoji}
        </div>

        {/* Like indicator */}
        <motion.div
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-4 border-green-400
                     text-green-400 font-black text-2xl rotate-[-15deg]"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>

        {/* Nope indicator */}
        <motion.div
          className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-4 border-red-400
                     text-red-400 font-black text-2xl rotate-[15deg]"
          style={{ opacity: nopeOpacity }}
        >
          NOPE
        </motion.div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{country.flag}</span>
            <h3 className="text-3xl font-bold">{country.name}</h3>
          </div>
          <p className="text-white/80 mb-3">{country.description}</p>
          <div className="flex gap-4 text-sm">
            <div className="glass-card px-3 py-1.5">
              <span className="text-white/60">Вузов: </span>
              <span className="font-semibold">{country.universities}+</span>
            </div>
            <div className="glass-card px-3 py-1.5">
              <span className="text-white/60">Стоимость: </span>
              <span className="font-semibold">{country.avgTuition}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
