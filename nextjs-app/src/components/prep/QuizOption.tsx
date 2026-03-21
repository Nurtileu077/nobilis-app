'use client';

import { CheckCircle, X } from 'lucide-react';

interface QuizOptionProps {
  option: string;
  index: number;
  selected: number | null;
  correctAnswer: number;
  showResult: boolean;
  onSelect: (index: number) => void;
}

export default function QuizOption({ option, index, selected, correctAnswer, showResult, onSelect }: QuizOptionProps) {
  let style = 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200';
  if (showResult) {
    if (index === correctAnswer) {
      style = 'bg-green-50 dark:bg-green-500/10 border-green-400 text-green-700 dark:text-green-400';
    } else if (index === selected && index !== correctAnswer) {
      style = 'bg-red-50 dark:bg-red-500/10 border-red-400 text-red-700 dark:text-red-400';
    }
  } else if (selected === index) {
    style = 'bg-primary-50 dark:bg-primary-500/10 border-primary-400 text-primary-700';
  }

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={showResult}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${style}`}
    >
      <div className="flex items-center gap-3">
        <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="text-sm">{option}</span>
        {showResult && index === correctAnswer && (
          <CheckCircle size={18} className="ml-auto text-green-500" />
        )}
        {showResult && index === selected && index !== correctAnswer && (
          <X size={18} className="ml-auto text-red-500" />
        )}
      </div>
    </button>
  );
}
