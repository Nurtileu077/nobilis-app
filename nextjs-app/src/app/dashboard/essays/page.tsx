'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Mic, Sparkles, Wand2, Plus, FileText } from 'lucide-react';

interface Essay {
  id: string;
  title: string;
  university: string;
  wordCount: number;
  status: 'DRAFT' | 'AI_GENERATED' | 'HUMANIZED' | 'FINAL';
  updatedAt: string;
}

const MOCK_ESSAYS: Essay[] = [
  { id: '1', title: 'Why UofT?', university: 'University of Toronto', wordCount: 450, status: 'HUMANIZED', updatedAt: '2025-03-08' },
  { id: '2', title: 'Personal Statement', university: 'KIT Karlsruhe', wordCount: 0, status: 'DRAFT', updatedAt: '2025-03-05' },
  { id: '3', title: 'Letter of Motivation', university: 'Korea University', wordCount: 320, status: 'AI_GENERATED', updatedAt: '2025-03-07' },
];

const STATUS_CONFIG = {
  DRAFT: { label: 'Черновик', color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  AI_GENERATED: { label: 'AI текст', color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  HUMANIZED: { label: 'Очеловечен', color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  FINAL: { label: 'Финал', color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
};

export default function EssaysPage() {
  const [selectedEssay, setSelectedEssay] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PenTool size={24} className="text-purple-500" />
          Эссе-редактор
        </h1>
        <button className="px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-medium flex items-center gap-2 hover:bg-purple-600">
          <Plus size={16} /> Новое эссе
        </button>
      </div>

      {!selectedEssay ? (
        /* Essay list */
        <div className="space-y-3">
          {MOCK_ESSAYS.map((essay, i) => (
            <motion.button
              key={essay.id}
              onClick={() => setSelectedEssay(essay.id)}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 text-left hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{essay.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{essay.university}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {essay.wordCount} слов · Обновлено {new Date(essay.updatedAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_CONFIG[essay.status].color}`}>
                  {STATUS_CONFIG[essay.status].label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        /* Essay editor */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-slate-700">
            <button
              onClick={() => setSelectedEssay(null)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mr-2"
            >
              ← Назад
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
              }`}
              title="Голосовой ввод (Whisper)"
            >
              <Mic size={18} />
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1.5"
              title="Сгенерировать AI текст"
            >
              <Sparkles size={14} /> AI Генерация
            </button>
            <button
              className="px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1.5"
              title="Очеловечить текст"
            >
              <Wand2 size={14} /> Очеловечить
            </button>
          </div>

          {/* Editor area */}
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Начни писать своё эссе здесь... или нажми на микрофон для голосового ввода"
            className="w-full h-[400px] p-4 bg-transparent text-gray-800 dark:text-gray-200 resize-none focus:outline-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400">
            <span>{editorContent.split(/\s+/).filter(Boolean).length} слов</span>
            <span>Автосохранение включено</span>
          </div>
        </div>
      )}
    </div>
  );
}
