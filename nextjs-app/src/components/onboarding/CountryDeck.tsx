'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { COUNTRIES } from '@/lib/countries';
import { X, Heart } from 'lucide-react';

interface CountryDeckProps {
  onComplete: (selectedCountries: string[]) => void;
}

export default function CountryDeck({ onComplete }: CountryDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const country = COUNTRIES[currentIndex];

      if (direction === 'right') {
        setSelectedCountries((prev) => [...prev, country.id]);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      // Если выбрали 3 страны или закончились карточки — переходим
      const newSelected = direction === 'right'
        ? [...selectedCountries, country.id]
        : selectedCountries;

      if (newSelected.length >= 3 || nextIndex >= COUNTRIES.length) {
        setTimeout(() => onComplete(newSelected), 300);
      }
    },
    [currentIndex, selectedCountries, onComplete]
  );

  const remaining = COUNTRIES.length - currentIndex;
  const progress = selectedCountries.length;

  return (
    <div className="flex flex-col items-center">
      {/* Progress */}
      <div className="mb-6 text-center">
        <p className="text-white/60 text-sm mb-2">
          Выбери минимум 3 страны, которые тебе интересны
        </p>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < progress
                  ? 'bg-green-400 scale-110'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-white/40 mt-1">
          {progress}/3 выбрано · {remaining} осталось
        </p>
      </div>

      {/* Card stack */}
      <div className="relative w-[320px] h-[420px] mx-auto">
        <AnimatePresence>
          {COUNTRIES.slice(currentIndex, currentIndex + 2)
            .reverse()
            .map((country, i, arr) => (
              <SwipeCard
                key={country.id}
                country={country}
                onSwipe={handleSwipe}
                isTop={i === arr.length - 1}
              />
            ))}
        </AnimatePresence>

        {currentIndex >= COUNTRIES.length && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-center">
            <div>
              <p className="text-xl mb-2">Карточки закончились!</p>
              <p className="text-sm">Выбрано стран: {selectedCountries.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual buttons */}
      <div className="flex gap-6 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          disabled={currentIndex >= COUNTRIES.length}
          className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center
                     border-2 border-red-400/50 text-red-400 hover:bg-red-400/20
                     transition-all active:scale-90 disabled:opacity-30"
        >
          <X size={28} />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          disabled={currentIndex >= COUNTRIES.length}
          className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center
                     border-2 border-green-400/50 text-green-400 hover:bg-green-400/20
                     transition-all active:scale-90 disabled:opacity-30"
        >
          <Heart size={28} />
        </button>
      </div>
    </div>
  );
}
