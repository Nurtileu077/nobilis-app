'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileText, AlertTriangle, CheckCircle, Clock,
  Shield, Eye, Download,
} from 'lucide-react';

type DocStatus = 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'WARNING' | 'EXPIRED';
type DocType = 'PASSPORT' | 'IELTS' | 'SAT' | 'TRANSCRIPT' | 'ESSAY' | 'RECOMMENDATION' | 'FINANCIAL';

interface DocSlot {
  type: DocType;
  label: string;
  description: string;
  status: DocStatus;
  fileName?: string;
  expiryDate?: string;
}

const MOCK_DOCS: DocSlot[] = [
  { type: 'PASSPORT', label: 'Паспорт', description: 'Загранпаспорт (сканы всех страниц)', status: 'VERIFIED', fileName: 'passport_scan.pdf' },
  { type: 'IELTS', label: 'IELTS сертификат', description: 'Результаты теста IELTS', status: 'WARNING', fileName: 'ielts_cert.pdf', expiryDate: '2025-06-15' },
  { type: 'TRANSCRIPT', label: 'Транскрипт', description: 'Академическая выписка оценок', status: 'UPLOADED', fileName: 'transcript_2024.pdf' },
  { type: 'ESSAY', label: 'Personal Statement', description: 'Мотивационное письмо', status: 'PENDING' },
  { type: 'RECOMMENDATION', label: 'Рекомендательное письмо', description: 'Письмо от преподавателя', status: 'PENDING' },
  { type: 'FINANCIAL', label: 'Финансовая справка', description: 'Справка о доходах / спонсорское письмо', status: 'PENDING' },
];

const STATUS_CONFIG: Record<DocStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  PENDING: { icon: Clock, color: 'text-gray-400', label: 'Не загружен' },
  UPLOADED: { icon: FileText, color: 'text-blue-500', label: 'Загружен' },
  VERIFIED: { icon: CheckCircle, color: 'text-green-500', label: 'Проверен' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Внимание' },
  EXPIRED: { icon: AlertTriangle, color: 'text-red-500', label: 'Истёк' },
};

export default function DocumentsPage() {
  const uploaded = MOCK_DOCS.filter((d) => d.status !== 'PENDING').length;
  const total = MOCK_DOCS.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-primary-500" />
            Сейф документов
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {uploaded} из {total} документов загружено
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Готовность</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round((uploaded / total) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(uploaded / total) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Document slots */}
      <div className="space-y-3">
        {MOCK_DOCS.map((doc, i) => {
          const config = STATUS_CONFIG[doc.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={doc.type}
              className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 transition-all ${
                doc.status === 'WARNING'
                  ? 'border-yellow-300 dark:border-yellow-500/30'
                  : doc.status === 'EXPIRED'
                  ? 'border-red-300 dark:border-red-500/30'
                  : 'border-gray-100 dark:border-slate-700'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  doc.status === 'PENDING' ? 'bg-gray-100 dark:bg-slate-700' : 'bg-primary-50 dark:bg-primary-500/10'
                }`}>
                  <StatusIcon size={20} className={config.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{doc.label}</h3>
                    <span className={`text-xs ${config.color}`}>{config.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.description}</p>

                  {doc.fileName && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded">
                        {doc.fileName}
                      </span>
                      <button className="text-gray-400 hover:text-primary-500">
                        <Eye size={14} />
                      </button>
                      <button className="text-gray-400 hover:text-primary-500">
                        <Download size={14} />
                      </button>
                    </div>
                  )}

                  {doc.status === 'WARNING' && doc.expiryDate && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Истекает {new Date(doc.expiryDate).toLocaleDateString('ru-RU')} — обнови документ
                    </p>
                  )}
                </div>

                {doc.status === 'PENDING' && (
                  <button className="shrink-0 px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-primary-600 transition-colors">
                    <Upload size={14} /> Загрузить
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
