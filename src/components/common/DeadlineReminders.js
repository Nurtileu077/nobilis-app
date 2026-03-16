import React, { useState, useMemo } from 'react';
import { COUNTRIES } from '../../data/constants';

// Deadline category definitions
const DEADLINE_CATEGORIES = {
  // Document submissions
  transcript: { label: 'Транскрипт', category: 'documents', icon: '\uD83D\uDCDA' },
  motivation_letter: { label: 'Мотивационное письмо', category: 'documents', icon: '\uD83D\uDC8C' },
  recommendation_letter: { label: 'Рекомендательное письмо', category: 'documents', icon: '\uD83D\uDCDD' },
  documents_submission: { label: 'Подача документов', category: 'documents', icon: '\uD83D\uDCC4' },
  passport: { label: 'Паспорт', category: 'documents', icon: '\uD83D\uDEC2' },
  nostrification: { label: 'Нострификация', category: 'documents', icon: '\uD83D\uDCCB' },

  // University applications
  uni_application: { label: 'Подача в ВУЗ', category: 'university', icon: '\uD83C\uDFEB' },
  uni_early_deadline: { label: 'Ранний дедлайн ВУЗа', category: 'university', icon: '\u26A1' },
  uni_regular_deadline: { label: 'Основной дедлайн ВУЗа', category: 'university', icon: '\uD83C\uDFAF' },
  portfolio: { label: 'Портфолио', category: 'university', icon: '\uD83D\uDCC2' },

  // Test dates
  ielts_exam: { label: 'IELTS экзамен', category: 'tests', icon: '\uD83D\uDCD8' },
  sat_exam: { label: 'SAT экзамен', category: 'tests', icon: '\uD83D\uDCD7' },
  toefl_exam: { label: 'TOEFL экзамен', category: 'tests', icon: '\uD83D\uDCCB' },
  testdaf: { label: 'TestDaF', category: 'tests', icon: '\uD83C\uDDE9\uD83C\uDDEA' },

  // Visa deadlines
  visa_application: { label: 'Подача на визу', category: 'visa', icon: '\uD83D\uDEC2' },
  visa_interview: { label: 'Собеседование на визу', category: 'visa', icon: '\uD83D\uDDE3\uFE0F' },
  visa_documents: { label: 'Документы на визу', category: 'visa', icon: '\uD83D\uDCC3' },
};

const CATEGORY_LABELS = {
  documents: 'Документы',
  university: 'Университеты',
  tests: 'IELTS / SAT / Тесты',
  visa: 'Виза',
};

const CATEGORY_ICONS = {
  documents: '\uD83D\uDCC4',
  university: '\uD83C\uDFEB',
  tests: '\uD83D\uDCDD',
  visa: '\uD83D\uDEC2',
};

function getDaysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateString);
  deadline.setHours(0, 0, 0, 0);
  const diff = deadline - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCountdown(days) {
  const absDays = Math.abs(days);

  if (days < 0) {
    if (absDays === 1) return 'просрочено на 1 день';
    if (absDays >= 2 && absDays <= 4) return `просрочено на ${absDays} дня`;
    return `просрочено на ${absDays} дней`;
  }
  if (days === 0) return 'сегодня!';
  if (days === 1) return 'через 1 день';
  if (days >= 2 && days <= 4) return `через ${days} дня`;
  if (days < 7) return `через ${days} дней`;
  if (days < 14) return 'через 1 неделю';
  if (days < 21) return 'через 2 недели';
  if (days < 28) return 'через 3 недели';
  if (days < 60) return 'через 1 месяц';
  const months = Math.floor(days / 30);
  if (months >= 2 && months <= 4) return `через ${months} месяца`;
  return `через ${months} месяцев`;
}

function getUrgencyLevel(days) {
  if (days < 0) return 'overdue';
  if (days < 7) return 'urgent';
  if (days < 30) return 'soon';
  return 'ok';
}

const URGENCY_STYLES = {
  overdue: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    ring: 'ring-red-500/20',
  },
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-600',
    dot: 'bg-red-500',
    ring: 'ring-red-500/20',
  },
  soon: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
  },
  ok: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
  },
};

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ChevronIcon({ className, open }) {
  return (
    <svg className={`${className} transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function DeadlineCard({ item, onMarkDone }) {
  const urgency = getUrgencyLevel(item.daysUntil);
  const styles = URGENCY_STYLES[urgency];
  const catMeta = DEADLINE_CATEGORIES[item.deadlineKey] || { label: item.deadlineKey, icon: '\uD83D\uDCC5' };
  const country = COUNTRIES.find(c => (item.student.selectedCountries || []).includes(c.id));

  return (
    <div className={`animate-fadeIn rounded-2xl border shadow-sm p-4 ${styles.bg} ${styles.border} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg">{catMeta.icon}</span>
            <span className="font-semibold text-gray-900 text-sm truncate">{catMeta.label}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {formatCountdown(item.daysUntil)}
            </span>
          </div>

          <p className="text-sm text-gray-600 truncate">
            {item.student.name}
            {country && <span className="ml-1.5">{country.flag} {country.name}</span>}
          </p>

          {item.student.targetUniversities && item.student.targetUniversities.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {item.student.targetUniversities.join(', ')}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-1">
            {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => onMarkDone(item.student, item.deadlineKey)}
          className="shrink-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
          title="Отметить выполненным"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DeadlineReminders({ students, onUpdateDeadline }) {
  const [filter, setFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({ overdue: true, urgent: true, soon: true, ok: false });

  // Build flat list of all deadlines across all students
  const allDeadlines = useMemo(() => {
    if (!students || students.length === 0) return [];

    const items = [];
    students.forEach(student => {
      if (!student.deadlines) return;
      Object.entries(student.deadlines).forEach(([key, dateString]) => {
        if (!dateString) return;
        const daysUntil = getDaysUntil(dateString);
        const catMeta = DEADLINE_CATEGORIES[key];
        const category = catMeta ? catMeta.category : 'documents';

        items.push({
          student,
          deadlineKey: key,
          date: dateString,
          daysUntil,
          category,
        });
      });
    });

    // Sort: overdue first (most overdue at top), then by soonest upcoming
    items.sort((a, b) => a.daysUntil - b.daysUntil);
    return items;
  }, [students]);

  // Apply category filter
  const filteredDeadlines = useMemo(() => {
    if (filter === 'all') return allDeadlines;
    return allDeadlines.filter(d => d.category === filter);
  }, [allDeadlines, filter]);

  // Group by urgency
  const grouped = useMemo(() => {
    const groups = { overdue: [], urgent: [], soon: [], ok: [] };
    filteredDeadlines.forEach(d => {
      const level = getUrgencyLevel(d.daysUntil);
      groups[level].push(d);
    });
    return groups;
  }, [filteredDeadlines]);

  const toggleCategory = (key) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkDone = (student, deadlineKey) => {
    if (onUpdateDeadline) {
      onUpdateDeadline(student, deadlineKey, null);
    }
  };

  const counts = {
    overdue: grouped.overdue.length,
    urgent: grouped.urgent.length,
    soon: grouped.soon.length,
    ok: grouped.ok.length,
    total: filteredDeadlines.length,
  };

  const SECTIONS = [
    { key: 'overdue', label: 'Просрочено', styles: URGENCY_STYLES.overdue },
    { key: 'urgent', label: 'Срочно (< 7 дней)', styles: URGENCY_STYLES.urgent },
    { key: 'soon', label: 'Скоро (< 30 дней)', styles: URGENCY_STYLES.soon },
    { key: 'ok', label: 'В порядке', styles: URGENCY_STYLES.ok },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="rounded-2xl border shadow-sm bg-white p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Дедлайны и напоминания</h2>
              <p className="text-sm text-gray-500">{counts.total} активных дедлайнов</p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {counts.overdue > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {counts.overdue} просрочено
              </span>
            )}
            {counts.urgent > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                {counts.urgent} срочных
              </span>
            )}
            {counts.soon > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                {counts.soon} скоро
              </span>
            )}
            {counts.ok > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {counts.ok} в порядке
              </span>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Все' },
            { key: 'documents', label: CATEGORY_LABELS.documents, icon: CATEGORY_ICONS.documents },
            { key: 'university', label: CATEGORY_LABELS.university, icon: CATEGORY_ICONS.university },
            { key: 'tests', label: CATEGORY_LABELS.tests, icon: CATEGORY_ICONS.tests },
            { key: 'visa', label: CATEGORY_LABELS.visa, icon: CATEGORY_ICONS.visa },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {counts.total === 0 && (
        <div className="rounded-2xl border shadow-sm bg-white p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <BellIcon className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Нет активных дедлайнов</p>
          <p className="text-sm text-gray-400 mt-1">Дедлайны студентов появятся здесь</p>
        </div>
      )}

      {/* Deadline sections */}
      <div className="space-y-3">
        {SECTIONS.map(section => {
          const items = grouped[section.key];
          if (items.length === 0) return null;
          const isOpen = expandedCategories[section.key];

          return (
            <div key={section.key} className="rounded-2xl border shadow-sm bg-white overflow-hidden">
              <button
                onClick={() => toggleCategory(section.key)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${section.styles.dot} ${section.key === 'overdue' ? 'animate-pulse' : ''}`} />
                  <span className="font-semibold text-sm text-gray-900">{section.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${section.styles.badge}`}>
                    {items.length}
                  </span>
                </div>
                <ChevronIcon className="w-4 h-4 text-gray-400" open={isOpen} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {items.map((item, idx) => (
                    <DeadlineCard
                      key={`${item.student.name}-${item.deadlineKey}-${idx}`}
                      item={item}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
