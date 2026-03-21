'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  value: string | number;
  label: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, iconColor, value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Icon size={20} className={`${iconColor} mb-2`} />
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </motion.div>
  );
}
