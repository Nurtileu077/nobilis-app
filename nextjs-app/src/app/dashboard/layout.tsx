'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home, FileText, FolderOpen, PenTool, GitCompare,
  BookOpen, Award, Users, CreditCard, Menu, X,
  Moon, Sun, Bell, Coins,
} from 'lucide-react';
import { useTheme } from '@/store/theme';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/dashboard/applications', label: 'Заявки', icon: FileText },
  { href: '/dashboard/documents', label: 'Документы', icon: FolderOpen },
  { href: '/dashboard/essays', label: 'Эссе', icon: PenTool },
  { href: '/dashboard/compare', label: 'Сравнение', icon: GitCompare },
  { href: '/prep', label: 'Подготовка', icon: BookOpen },
  { href: '/rewards', label: 'Награды', icon: Award },
  { href: '/roommate', label: 'Roommate', icon: Users },
  { href: '/payments', label: 'Финансы', icon: CreditCard },
];

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/dashboard/applications', label: 'Заявки', icon: FileText },
  { href: '/prep', label: 'Prep', icon: BookOpen },
  { href: '/rewards', label: 'Coins', icon: Coins },
  { href: '/payments', label: 'Ещё', icon: Menu },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, toggleSidebar, coins, streak } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 glass border-b border-gray-200 dark:border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-lg">
            <span className="text-nobilis-gold">Nobilis</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-nobilis-gold flex items-center gap-1">
              <Coins size={14} /> {coins}
            </span>
            <button className="p-2 text-gray-600 dark:text-gray-300">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 z-50 transform
                    transition-transform duration-300 lg:translate-x-0 border-r border-gray-200 dark:border-slate-700
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-nobilis-gold">Nobilis</span>
            <span className="text-gray-600 dark:text-gray-400"> Academy</span>
          </h1>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="px-2 mt-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sidebarOpen && toggleSidebar()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle & streak */}
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>🔥</span>
            <span>{streak} дней подряд</span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-gray-200 dark:border-slate-700/50 z-30">
        <div className="flex items-center justify-around py-2">
          {BOTTOM_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
