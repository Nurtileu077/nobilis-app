'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ChanceSpeedometerProps {
  chance: number; // 0-100
}

export default function ChanceSpeedometer({ chance }: ChanceSpeedometerProps) {
  const [displayChance, setDisplayChance] = useState(0);

  useEffect(() => {
    // Animate counter
    const duration = 2000;
    const steps = 60;
    const increment = chance / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= chance) {
        setDisplayChance(chance);
        clearInterval(interval);
      } else {
        setDisplayChance(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [chance]);

  const getColor = (value: number) => {
    if (value >= 80) return '#22c55e'; // green
    if (value >= 60) return '#eab308'; // yellow
    if (value >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const color = getColor(chance);

  // SVG arc parameters
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // half-circle
  const progress = (displayChance / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[200px] h-[120px]">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <span className="text-4xl font-black" style={{ color }}>
              {displayChance}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-white/60 text-sm mt-2">
        {chance >= 80
          ? 'Отличные шансы!'
          : chance >= 60
          ? 'Хорошие шансы'
          : chance >= 40
          ? 'Средние шансы'
          : 'Есть над чем работать'}
      </p>
    </div>
  );
}
