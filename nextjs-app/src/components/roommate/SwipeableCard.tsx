'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { MapPin } from 'lucide-react';

export interface RoommateCardData {
  id: string;
  name: string;
  age: number;
  university: string;
  city: string;
  bio: string;
  habits: string[];
  budget: number;
  photo: string;
}

interface SwipeableCardProps {
  card: RoommateCardData;
  onSwipe: (dir: 'left' | 'right') => void;
}

export default function SwipeableCard({ card, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      exit={{ x: 300, opacity: 0 }}
    >
      <div className="h-full bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-lg">
        {/* Photo area */}
        <div className="h-[45%] bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-500/20 dark:to-purple-500/20 flex items-center justify-center relative">
          <span className="text-[80px]">{card.photo}</span>

          <motion.div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg border-2 border-green-400 text-green-400 font-black text-lg" style={{ opacity: likeOpacity }}>
            LIKE
          </motion.div>
          <motion.div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg border-2 border-red-400 text-red-400 font-black text-lg" style={{ opacity: nopeOpacity }}>
            NOPE
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {card.name}, {card.age}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {card.university} · {card.city}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{card.bio}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {card.habits.map((h) => (
              <span key={h} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300">
                {h}
              </span>
            ))}
          </div>

          <p className="text-sm text-gray-400 mt-3">Бюджет: ${card.budget}/мес</p>
        </div>
      </div>
    </motion.div>
  );
}
