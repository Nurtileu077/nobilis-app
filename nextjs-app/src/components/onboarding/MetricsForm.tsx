'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface MetricsFormProps {
  onSubmit: (data: {
    gpa: number;
    englishLevel: string;
    ieltsScore: number;
    budget: number;
  }) => void;
}

const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const BUDGET_OPTIONS = [
  { label: 'до $5,000', value: 5000 },
  { label: '$5,000 - $15,000', value: 15000 },
  { label: '$15,000 - $30,000', value: 30000 },
  { label: '$30,000 - $50,000', value: 50000 },
  { label: '$50,000+', value: 60000 },
];

export default function MetricsForm({ onSubmit }: MetricsFormProps) {
  const [gpa, setGpa] = useState(3.0);
  const [englishLevel, setEnglishLevel] = useState('B1');
  const [ieltsScore, setIeltsScore] = useState(6.0);
  const [budget, setBudget] = useState(15000);

  const handleSubmit = () => {
    onSubmit({ gpa, englishLevel, ieltsScore, budget });
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* GPA Slider */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Твой GPA (средний балл)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.1"
            value={gpa}
            onChange={(e) => setGpa(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       accent-nobilis-gold"
          />
          <span className="text-2xl font-bold text-nobilis-gold min-w-[60px] text-right">
            {gpa.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>1.0</span>
          <span>4.0</span>
        </div>
      </div>

      {/* English Level */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-3">
          Уровень английского
        </label>
        <div className="grid grid-cols-6 gap-2">
          {ENGLISH_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setEnglishLevel(level)}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                englishLevel === level
                  ? 'bg-nobilis-gold text-nobilis-navy scale-105'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* IELTS Score */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          IELTS балл (если сдавал)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="4.0"
            max="9.0"
            step="0.5"
            value={ieltsScore}
            onChange={(e) => setIeltsScore(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                       accent-primary-400"
          />
          <span className="text-2xl font-bold text-primary-400 min-w-[50px] text-right">
            {ieltsScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-3">
          Бюджет на обучение (в год)
        </label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudget(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                budget === opt.value
                  ? 'bg-primary-500 text-white scale-105'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        onClick={handleSubmit}
        className="w-full py-4 rounded-2xl bg-nobilis-gold text-nobilis-navy font-bold text-lg
                   flex items-center justify-center gap-2 glow-gold
                   hover:scale-[1.02] active:scale-95 transition-all"
        whileTap={{ scale: 0.95 }}
      >
        Рассчитать мои шансы
        <ChevronRight size={20} />
      </motion.button>
    </motion.div>
  );
}
