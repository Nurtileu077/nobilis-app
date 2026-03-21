'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import SwipeableCard, { RoommateCardData } from '@/components/roommate/SwipeableCard';

const MOCK_ROOMMATES: RoommateCardData[] = [
  { id: '1', name: 'Дана К.', age: 19, university: 'University of Toronto', city: 'Торонто', bio: 'Учусь на CS, люблю готовить и бегать по утрам. Ищу спокойного соседа.', habits: ['Ранний подъём', 'Спорт', 'Не курит'], budget: 800, photo: '👩‍💻' },
  { id: '2', name: 'Алишер М.', age: 20, university: 'KIT Karlsruhe', city: 'Карлсруэ', bio: 'Мехатроника. Играю на гитаре, люблю K-pop. Соседа любого пола.', habits: ['Сова', 'Музыка', 'Не курит'], budget: 500, photo: '🧑‍🎓' },
  { id: '3', name: 'Мадина С.', age: 18, university: 'Masaryk University', city: 'Брно', bio: 'IT специальность, интроверт, люблю тишину и Netflix.', habits: ['Ранний подъём', 'Тишина', 'Чистюля'], budget: 400, photo: '👩‍🎓' },
];

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
                <h2 className="text-3xl font-black text-white mb-2">{"It's a Match!"}</h2>
                <p className="text-white/60">Теперь вы можете написать друг другу</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
