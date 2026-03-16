import React, { useMemo } from 'react';
import { PACKAGE_TYPES, SUPPORT_STAGES } from '../../data/constants';
import { formatDate, daysBetween, getAttendancePercent, getPackageProgress } from '../../data/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const IELTS_COLOR = '#3B82F6';
const SAT_COLOR = '#8B5CF6';

/** Group exam results by type family (ielts / sat) including mocks, sorted by date */
function groupExamsByType(examResults) {
  const ielts = [];
  const sat = [];
  (examResults || []).forEach(e => {
    if (e.type === 'ielts' || e.type === 'mock_ielts') ielts.push(e);
    if (e.type === 'sat' || e.type === 'mock_sat') sat.push(e);
  });
  ielts.sort((a, b) => new Date(a.date) - new Date(b.date));
  sat.sort((a, b) => new Date(a.date) - new Date(b.date));
  return { ielts, sat };
}

/** Map an array of {score, date} into SVG points within a viewBox */
function toPoints(data, minScore, maxScore, padding, width, height) {
  if (!data.length) return [];
  const scoreRange = maxScore - minScore || 1;
  const dates = data.map(d => new Date(d.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate || 1;

  return data.map(d => {
    const x = data.length === 1
      ? width / 2
      : padding + ((new Date(d.date).getTime() - minDate) / dateRange) * (width - padding * 2);
    const y = height - padding - ((d.score - minScore) / scoreRange) * (height - padding * 2);
    return { x, y, score: d.score, date: d.date, type: d.type };
  });
}

function pointsToPolyline(pts) {
  return pts.map(p => `${p.x},${p.y}`).join(' ');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** SVG line chart for IELTS & SAT score progression */
function ScoreChart({ examResults }) {
  const { ielts, sat } = useMemo(() => groupExamsByType(examResults), [examResults]);

  const allScores = [...ielts, ...sat];
  if (allScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg className="w-16 h-16 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 13l4-4 4 4 4-8 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 20h18" />
        </svg>
        <span className="text-sm">Нет данных по экзаменам</span>
      </div>
    );
  }

  const W = 400;
  const H = 200;
  const PAD = 30;

  // Compute global min/max so both series share the same Y axis
  const scores = allScores.map(e => e.score);
  const minScore = Math.min(...scores) - 0.5;
  const maxScore = Math.max(...scores) + 0.5;

  const ieltsPoints = toPoints(ielts, minScore, maxScore, PAD, W, H);
  const satPoints = toPoints(sat, minScore, maxScore, PAD, W, H);

  // Y-axis labels (4-5 ticks)
  const ticks = 5;
  const yLabels = Array.from({ length: ticks }, (_, i) => {
    const val = minScore + ((maxScore - minScore) / (ticks - 1)) * i;
    const y = H - PAD - ((val - minScore) / (maxScore - minScore || 1)) * (H - PAD * 2);
    return { val: Math.round(val * 10) / 10, y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[320px]" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yLabels.map((t, i) => (
          <g key={i}>
            <line x1={PAD} y1={t.y} x2={W - PAD} y2={t.y} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={PAD - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{t.val}</text>
          </g>
        ))}

        {/* IELTS line */}
        {ieltsPoints.length > 1 && (
          <polyline points={pointsToPolyline(ieltsPoints)} fill="none" stroke={IELTS_COLOR} strokeWidth="2" strokeLinejoin="round" />
        )}
        {ieltsPoints.map((p, i) => (
          <g key={`i-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill={IELTS_COLOR} stroke="white" strokeWidth="1.5" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="7" fill={IELTS_COLOR} fontWeight="600">{p.score}</text>
          </g>
        ))}

        {/* SAT line */}
        {satPoints.length > 1 && (
          <polyline points={pointsToPolyline(satPoints)} fill="none" stroke={SAT_COLOR} strokeWidth="2" strokeLinejoin="round" />
        )}
        {satPoints.map((p, i) => (
          <g key={`s-${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill={SAT_COLOR} stroke="white" strokeWidth="1.5" />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="7" fill={SAT_COLOR} fontWeight="600">{p.score}</text>
          </g>
        ))}

        {/* Bottom date labels – show first & last date */}
        {allScores.length > 0 && (() => {
          const sorted = [...allScores].sort((a, b) => new Date(a.date) - new Date(b.date));
          const first = sorted[0];
          const last = sorted[sorted.length - 1];
          return (
            <>
              <text x={PAD} y={H - 8} fontSize="7" fill="#9ca3af">{formatDate(first.date)}</text>
              {sorted.length > 1 && (
                <text x={W - PAD} y={H - 8} textAnchor="end" fontSize="7" fill="#9ca3af">{formatDate(last.date)}</text>
              )}
            </>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
        {ielts.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: IELTS_COLOR }} />
            IELTS
          </span>
        )}
        {sat.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: SAT_COLOR }} />
            SAT
          </span>
        )}
      </div>
    </div>
  );
}

/** Attendance progress ring */
function AttendanceRing({ attendance }) {
  const percent = getAttendancePercent(attendance);
  const total = attendance?.total || 0;
  const attended = attendance?.attended || 0;
  const missed = total - attended;

  const R = 54;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

  const color = percent >= 80 ? '#10B981' : percent >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{percent}%</span>
          <span className="text-[10px] text-gray-400">посещаемость</span>
        </div>
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>Всего: {total}</span>
        <span className="text-emerald-600">Был: {attended}</span>
        <span className="text-red-500">Пропустил: {missed}</span>
      </div>
    </div>
  );
}

/** Package progress bar */
function PackageProgressBar({ pkg }) {
  const typeInfo = PACKAGE_TYPES[pkg.type] || {};
  const prog = getPackageProgress(pkg, SUPPORT_STAGES);
  const total = pkg.totalLessons || 0;
  const completed = pkg.completedLessons || 0;
  const missed = pkg.missedLessons || 0;
  const isSupport = pkg.type === 'support';

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: typeInfo.color || '#6b7280' }}
          >
            {typeInfo.name || pkg.type}
          </span>
          {pkg.frozen && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Заморожен</span>
          )}
        </div>
        <span className="text-sm font-semibold" style={{ color: typeInfo.color }}>
          {prog.percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${prog.percent}%`, backgroundColor: typeInfo.color }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-xs text-gray-500">
        {isSupport ? (
          <span>Этап: {prog.text}</span>
        ) : (
          <>
            <span>Пройдено: {completed}/{total}</span>
            {missed > 0 && <span className="text-red-500">Пропущено: {missed}</span>}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StudentAnalytics({ student }) {
  const attendance = student.attendance || {};
  const packages = student.packages || [];
  const examResults = student.examResults || [];

  // Build deadlines sorted by proximity
  const deadlines = useMemo(() => {
    return Object.entries(student.deadlines || {})
      .map(([key, dateStr]) => ({
        key,
        date: dateStr,
        daysLeft: daysBetween(new Date(), dateStr),
      }))
      .filter(d => d.daysLeft > 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [student.deadlines]);

  // Study time summary
  const studySummary = useMemo(() => {
    let totalLessons = 0;
    let completed = 0;
    let missed = 0;
    packages.forEach(p => {
      if (p.type !== 'support') {
        totalLessons += p.totalLessons || 0;
        completed += p.completedLessons || 0;
        missed += p.missedLessons || 0;
      }
    });
    return { totalLessons, completed, missed, remaining: totalLessons - completed - missed };
  }, [packages]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">Аналитика прогресса</h1>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-3xl font-bold text-nobilis-green">{studySummary.completed}</div>
          <div className="text-sm text-gray-500">Завершено занятий</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-3xl font-bold text-nobilis-gold">{examResults.length}</div>
          <div className="text-sm text-gray-500">Результатов экзаменов</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-3xl font-bold text-blue-600">{studySummary.remaining}</div>
          <div className="text-sm text-gray-500">Осталось занятий</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-3xl font-bold text-red-500">{studySummary.missed}</div>
          <div className="text-sm text-gray-500">Пропущено</div>
        </div>
      </div>

      {/* Score progression chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Динамика баллов</h3>
        <ScoreChart examResults={examResults} />
      </div>

      {/* Attendance + Study time row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance ring */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Посещаемость</h3>
          <AttendanceRing attendance={attendance} />
        </div>

        {/* Study time summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Сводка занятий</h3>
          <div className="space-y-4">
            {/* Completed */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Завершено</span>
                <span className="font-medium text-emerald-600">{studySummary.completed} из {studySummary.totalLessons}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${studySummary.totalLessons ? (studySummary.completed / studySummary.totalLessons * 100) : 0}%` }}
                />
              </div>
            </div>
            {/* Missed */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Пропущено</span>
                <span className="font-medium text-red-500">{studySummary.missed}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${studySummary.totalLessons ? (studySummary.missed / studySummary.totalLessons * 100) : 0}%` }}
                />
              </div>
            </div>
            {/* Remaining */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Осталось</span>
                <span className="font-medium text-blue-600">{studySummary.remaining}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${studySummary.totalLessons ? (studySummary.remaining / studySummary.totalLessons * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package progress */}
      {packages.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Прогресс по пакетам</h3>
          <div className="space-y-3">
            {packages.map(pkg => (
              <PackageProgressBar key={pkg.id || pkg.type} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming deadlines */}
      {deadlines.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Ближайшие дедлайны</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deadlines.map(d => {
              const urgent = d.daysLeft <= 14;
              const warning = d.daysLeft <= 30;
              return (
                <div
                  key={d.key}
                  className={`rounded-xl p-4 border ${
                    urgent
                      ? 'bg-red-50 border-red-200'
                      : warning
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-800">{d.key.toUpperCase()}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(d.date)}</div>
                  <div className={`text-sm font-semibold mt-2 ${
                    urgent ? 'text-red-600' : warning ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {d.daysLeft} {d.daysLeft === 1 ? 'день' : d.daysLeft < 5 ? 'дня' : 'дней'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
