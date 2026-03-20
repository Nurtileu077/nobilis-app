'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, MapPin, BookOpen, Coffee, Moon, Music } from 'lucide-react';

interface RoommateCard {
  id: string;
  name: string;
  age: number;
  university: string;
  city: string;
  bio: string;
  habits: string[];
  budget: number;
  photo: string; // emoji placeholder
}

const MOCK_ROOMMATES: RoommateCard[] = [
  { id: '1', name: 'Дана К.', age: 19, university: 'University of Toronto', city: 'Торонто', bio: 'Учусь на CS, люблю готовить и бегать по утрам. Ищу спокойного соседа.', habits: ['Ранний подъём', 'Спорт', 'Не курит'], budget: 800, photo: '👩‍💻' },
  { id: '2', name: 'Алишер М.', age: 20, university: 'KIT Karlsruhe', city: 'Карлсруэ', bio: 'Мехатроника. Играю на гитаре, люблю K-pop. Соседа любого пола.', habits: ['Сова', 'Музыка', 'Не курит'], budget: 500, photo: '🧑‍🎓' },
  { id: '3', name: 'Мадина С.', age: 18, university: 'Masaryk University', city: 'Брно', bio: 'IT специальность, интроверт, люблю тишину и Netflix.', habits: ['Ранний подъём', 'Тишина', 'Чистюля'], budget: 400, photo: '👩‍🎓' },
];

const HABIT_ICONS: Record<string, typeof Coffee> = {
  'Ранний подъём': Coffee,
  'Сова': Moon,
  'Спорт': Heart,
  'Музыка': Music,
  'Тишина': BookOpen,
};

function SwipeableCard({
  card,
  onSwipe,
}: {
  card: RoommateCard;
  onSwipe: (dir: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
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

export default function RoommatePage() {
  const [index, setIndex] = useState(0);
  const [matched, setMatched] = useState(false);

  const handleSwipe = useCallback(
    (dir: 'left' | 'right') => {
      if (dir === 'right') {
        // Check for match (mock: 50% chance)
        if (Math.random() > 0.5) {
          setMatched(true);
          setTimeout(() => setMatched(false), 2500);
        }
      }
      setIndex((i) => i + 1);
    },
    []
  );

  const current = MOCK_ROOMMATES[index];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Roommate Finder
        </h1>

        <div className="relative h-[500px]">
          <AnimatePresence>
            {current ? (
              <SwipeableCard key={current.id} card={current} onSwipe={handleSwipe} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <p className="text-4xl mb-4">🏠</p>
                  <p className="text-gray-500">Карточки закончились!</p>
                  <button
                    onClick={() => setIndex(0)}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm"
                  >
                    Начать заново
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {current && (
          <div className="flex justify-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-red-300 text-red-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <X size={24} />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-green-300 text-green-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Heart size={24} />
            </button>
          </div>
        )}

        {/* Match animation */}
        <AnimatePresence>
          {matched && (
            <motion.div
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <p className="text-6xl mb-4">🎉</p>
                <h2 className="text-3xl font-black text-white mb-2">It&apos;s a Match!</h2>
                <p className="text-white/60">Теперь вы можете написать друг другу</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
