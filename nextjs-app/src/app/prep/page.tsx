'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Headphones, PenTool, Mic, Calculator,
  Flame, Heart, Star, Lock, ChevronRight, Zap,
} from 'lucide-react';

interface SkillNode {
  id: string;
  skill: string;
  icon: typeof BookOpen;
  color: string;
  progress: number;
  level: number;
  unlocked: boolean;
  quizCount: number;
}

const SKILLS: SkillNode[] = [
  { id: 'reading', skill: 'Reading', icon: BookOpen, color: 'bg-blue-500', progress: 72, level: 4, unlocked: true, quizCount: 15 },
  { id: 'listening', skill: 'Listening', icon: Headphones, color: 'bg-purple-500', progress: 45, level: 2, unlocked: true, quizCount: 12 },
  { id: 'writing', skill: 'Writing', icon: PenTool, color: 'bg-green-500', progress: 30, level: 2, unlocked: true, quizCount: 10 },
  { id: 'speaking', skill: 'Speaking', icon: Mic, color: 'bg-orange-500', progress: 15, level: 1, unlocked: true, quizCount: 8 },
  { id: 'math', skill: 'Math (SAT)', icon: Calculator, color: 'bg-red-500', progress: 0, level: 0, unlocked: false, quizCount: 20 },
];

const MOCK_PROGRESS = {
  streak: 12,
  lives: 4,
  xp: 2350,
  level: 5,
  nextLevelXp: 3000,
  todayQuizzes: 2,
  totalQuizzes: 47,
};

export default function PrepPage() {
  const p = MOCK_PROGRESS;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header stats */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nobilis.Prep</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={18} />
              <span className="text-sm font-bold">{p.streak}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  size={16}
                  className={i < p.lives ? 'text-red-500 fill-red-500' : 'text-gray-300 dark:text-gray-600'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-nobilis-gold" />
              <span className="font-semibold text-gray-900 dark:text-white">Уровень {p.level}</span>
            </div>
            <span className="text-sm text-gray-400">{p.xp} / {p.nextLevelXp} XP</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-nobilis-gold to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(p.xp / p.nextLevelXp) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Сегодня пройдено: {p.todayQuizzes} квизов · Всего: {p.totalQuizzes}
          </p>
        </div>

        {/* Skill Tree */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Дерево навыков
          </h2>
          <div className="space-y-3">
            {SKILLS.map((skill, i) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {skill.unlocked ? (
                  <Link
                    href={`/prep/quiz/${skill.id}`}
                    className="block bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${skill.color} flex items-center justify-center text-white`}>
                        <skill.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{skill.skill}</h3>
                          <span className="text-xs text-gray-400">Lvl {skill.level}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                          <div
                            className={`h-full ${skill.color} rounded-full transition-all`}
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{skill.quizCount} вопросов · {skill.progress}%</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  </Link>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                        <Lock size={24} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-500">{skill.skill}</h3>
                        <p className="text-xs text-gray-400">Достигни уровня 3, чтобы открыть</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily challenge */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <Zap size={24} />
            <div>
              <h3 className="font-semibold">Ежедневный челлендж</h3>
              <p className="text-sm text-white/70">Пройди 3 квиза и получи 50 Nobilis Coins</p>
            </div>
            <span className="ml-auto text-sm font-bold">{p.todayQuizzes}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
