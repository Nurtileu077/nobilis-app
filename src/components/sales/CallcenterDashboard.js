import React, { useState, useMemo } from 'react';
import I from '../common/Icons';

// ─── helpers ────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

const secToMin = (sec) => {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ─── meta maps ───────────────────────────────────────────────────────────────

const RESULT_META = {
  reached:  { label: 'Дозвон',   bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-400'  },
  noanswer: { label: 'Недозвон', bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'bg-gray-400'   },
  busy:     { label: 'Занято',   bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-400' },
  meeting:  { label: 'Встреча',  bg: 'bg-blue-100',   text: 'text-blue-700',   bar: 'bg-blue-400'   },
  rejected: { label: 'Отказ',    bg: 'bg-red-100',    text: 'text-red-700',    bar: 'bg-red-400'    },
};

const PRIORITY_META = {
  high:   { label: 'Высокий', dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border border-red-200',       border: 'border-l-red-400'    },
  medium: { label: 'Средний', dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200', border: 'border-l-yellow-400' },
  low:    { label: 'Низкий',  dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border border-green-200',  border: 'border-l-green-400'  },
};

const STATUS_META = {
  new:        { label: 'Новый',       bg: 'bg-blue-50',   text: 'text-blue-700'   },
  callback:   { label: 'Перезвонить', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  processing: { label: 'В работе',    bg: 'bg-purple-50', text: 'text-purple-700' },
  reached:    { label: 'Дозвонились', bg: 'bg-green-50',  text: 'text-green-700'  },
  noanswer:   { label: 'Не отвечает', bg: 'bg-gray-50',   text: 'text-gray-600'   },
  meeting:    { label: 'Встреча',     bg: 'bg-teal-50',   text: 'text-teal-700'   },
  rejected:   { label: 'Отказ',       bg: 'bg-red-50',    text: 'text-red-700'    },
};

// ─── small atoms ─────────────────────────────────────────────────────────────

const ResultBadge = ({ result }) => {
  const m = RESULT_META[result] || { label: result || '—', bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const m = PRIORITY_META[priority] || { label: priority || '—', dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${m.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status || '—', bg: 'bg-gray-50', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-300">
      <Icon />
    </div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    {subtitle && <p className="text-xs mt-1 text-gray-400">{subtitle}</p>}
  </div>
);

const StatCard = ({ icon: Icon, value, label, color, iconBg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
      <span className={color}><Icon /></span>
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value ?? '—'}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

// ─── HourChart ───────────────────────────────────────────────────────────────

const HourChart = ({ calls }) => {
  const hours = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({ hour: i + 8, count: 0 }));
    (calls || []).forEach((c) => {
      if (!c.time) return;
      const h = new Date(c.time).getHours();
      const idx = h - 8;
      if (idx >= 0 && idx < 12) buckets[idx].count += 1;
    });
    return buckets;
  }, [calls]);

  const maxCount = Math.max(...hours.map((h) => h.count), 1);

  return (
    <div className="flex items-end gap-1 h-20">
      {hours.map(({ hour, count }) => (
        <div key={hour} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full rounded-t bg-nobilis-green/60 hover:bg-nobilis-green transition-colors min-h-[2px]"
            style={{ height: `${(count / maxCount) * 60}px` }}
            title={`${hour}:00 — ${count} зв.`}
          />
          <span className="text-[10px] text-gray-400 leading-none">{hour}</span>
        </div>
      ))}
    </div>
  );
};

// ─── LeadRow ─────────────────────────────────────────────────────────────────

const LeadRow = ({ lead, onCall, onNoAnswer, onCallback, onBookMeeting }) => {
  const [expanded, setExpanded] = useState(false);
  const borderColor = PRIORITY_META[lead.priority]?.border || 'border-l-gray-200';

  return (
    <>
      <tr
        className={`hover:bg-gray-50 cursor-pointer transition-colors ${expanded ? 'bg-nobilis-green/5' : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className={`py-3 pl-3 pr-2 border-l-4 ${borderColor}`}>
          <div className="font-medium text-gray-800 text-sm leading-tight">{lead.name || '—'}</div>
          <div className="text-xs text-gray-400 mt-0.5">{lead.source || ''}</div>
        </td>
        <td className="py-3 px-2">
          <a
            href={`tel:${lead.phone}`}
            className="text-sm text-nobilis-green font-mono hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {lead.phone || '—'}
          </a>
        </td>
        <td className="py-3 px-2 hidden md:table-cell">
          <PriorityBadge priority={lead.priority} />
        </td>
        <td className="py-3 px-2 hidden lg:table-cell">
          <span className="text-xs text-gray-500">{lead.lastContact ? fmtDate(lead.lastContact) : 'Нет'}</span>
        </td>
        <td className="py-3 px-2">
          <StatusBadge status={lead.status} />
        </td>
        <td className="py-3 px-2 text-right">
          <span className={`text-gray-400 inline-block transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <I.ChevronDown />
          </span>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-nobilis-green/5">
          <td colSpan={6} className="px-4 pb-4 pt-2">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Notes & history */}
              <div className="space-y-3">
                {lead.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Заметки</p>
                    <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100">{lead.notes}</p>
                  </div>
                )}
                {lead.history && lead.history.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">История звонков</p>
                    <div className="space-y-1.5">
                      {lead.history.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <span className="text-gray-400"><I.Clock /></span>
                          <span className="text-gray-500 font-mono">{fmtDate(h.date)} {fmtTime(h.date)}</span>
                          <ResultBadge result={h.result} />
                          {h.note && <span className="text-gray-400 truncate">{h.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!lead.notes && (!lead.history || lead.history.length === 0) && (
                  <p className="text-xs text-gray-400 italic py-2">Нет заметок и истории звонков</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 items-start content-start">
                <button
                  onClick={(e) => { e.stopPropagation(); onCall(lead); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-nobilis-green text-white text-xs font-medium rounded-lg hover:bg-nobilis-green/90 transition-colors"
                >
                  <I.Phone />
                  Позвонить
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNoAnswer(lead); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <I.Phone />
                  Недозвон
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCallback(lead); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <I.Clock />
                  Перезвонить
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onBookMeeting(lead); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-nobilis-gold text-white text-xs font-medium rounded-lg hover:bg-[#b8911f] transition-colors"
                >
                  <I.Calendar />
                  Записать на встречу
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

const CallcenterDashboard = ({ user, data, onSetModal, onSetForm, onUpdateData, onAddCall, onUpdLead, onAddMeeting, initialTab }) => {
  const [leadSearch, setLeadSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statsPeriod, setStatsPeriod] = useState('day');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const TODAY = todayStr();

  // ── derived data ─────────────────────────────────────────────────────────

  const myCalls = useMemo(() => {
    if (!data?.calls) return [];
    return data.calls.filter((c) => !user?.id || c.operatorId === user.id);
  }, [data?.calls, user?.id]);

  const todayCalls = useMemo(
    () => myCalls.filter((c) => c.time && c.time.slice(0, 10) === TODAY),
    [myCalls, TODAY]
  );

  const totalToday        = todayCalls.length;
  const successfulToday   = todayCalls.filter((c) => c.result === 'reached' || c.result === 'meeting').length;
  const unsuccessfulToday = todayCalls.filter((c) => c.result === 'noanswer' || c.result === 'busy').length;
  const meetingsToday     = todayCalls.filter((c) => c.result === 'meeting').length;

  const allLeads = useMemo(() => data?.leads || [], [data?.leads]);

  const filteredLeads = useMemo(() => {
    return allLeads
      .filter((l) => {
        const q = leadSearch.toLowerCase();
        if (q && !`${l.name || ''} ${l.phone || ''} ${l.source || ''}`.toLowerCase().includes(q)) return false;
        if (priorityFilter !== 'all' && l.priority !== priorityFilter) return false;
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      });
  }, [allLeads, leadSearch, priorityFilter, statusFilter]);

  const periodCalls = useMemo(() => {
    const now = new Date();
    return myCalls.filter((c) => {
      if (!c.time) return false;
      const d = new Date(c.time);
      if (statsPeriod === 'day')   return c.time.slice(0, 10) === TODAY;
      if (statsPeriod === 'week')  { const ago = new Date(now); ago.setDate(now.getDate() - 7); return d >= ago; }
      if (statsPeriod === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      return false;
    });
  }, [myCalls, statsPeriod, TODAY]);

  const periodSuccessRate = periodCalls.length
    ? Math.round((periodCalls.filter((c) => c.result === 'reached' || c.result === 'meeting').length / periodCalls.length) * 100)
    : 0;
  const periodMeetings = periodCalls.filter((c) => c.result === 'meeting').length;

  // ── action handlers ───────────────────────────────────────────────────────

  const handleCall      = (lead) => { onSetForm({ lead, action: 'call' });      onSetModal('logCall'); };
  const handleNoAnswer  = (lead) => { onSetForm({ lead, action: 'noanswer' });  onSetModal('logCall'); };
  const handleCallback  = (lead) => { onSetForm({ lead, action: 'callback' });  onSetModal('scheduleCallback'); };
  const handleBookMeeting = (lead) => { onSetForm({ lead, action: 'meeting' }); onSetModal('addMeeting'); };

  const closeDropdowns = () => { setShowPriorityMenu(false); setShowStatusMenu(false); };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fadeIn" onClick={closeDropdowns}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-nobilis-green flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'О'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user?.name || 'Оператор колл-центра'}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              На смене ·{' '}
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSetForm({}); onSetModal('addLead'); }}
            className="flex items-center gap-2 px-4 py-2 bg-nobilis-green text-white text-sm font-medium rounded-xl hover:bg-nobilis-green/90 transition-colors shadow-sm"
          >
            <I.Plus />
            Новый лид
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSetForm({}); onSetModal('logCall'); }}
            className="flex items-center gap-2 px-4 py-2 bg-nobilis-gold text-white text-sm font-medium rounded-xl hover:bg-[#b8911f] transition-colors shadow-sm"
          >
            <I.Phone />
            Звонок
          </button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={I.Phone}    value={totalToday}        label="Звонков сегодня"   color="text-nobilis-green"   iconBg="bg-nobilis-green/10" />
        <StatCard icon={I.Check}    value={successfulToday}   label="Дозвонились"       color="text-green-600"   iconBg="bg-green-50"     />
        <StatCard icon={I.Bell}     value={unsuccessfulToday} label="Не дозвонились"    color="text-orange-500"  iconBg="bg-orange-50"    />
        <StatCard icon={I.Calendar} value={meetingsToday}     label="Встреч записано"   color="text-nobilis-gold"   iconBg="bg-yellow-50"    />
      </div>

      {/* ── Daily target banner ─────────────────────────────────────────────── */}
      {user?.dailyTarget && (
        <div className="bg-gradient-to-r from-nobilis-green to-nobilis-green/80 rounded-2xl p-5 flex items-center gap-4 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <I.Target />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Дневная цель: {user.dailyTarget} звонков</p>
            <div className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-nobilis-gold rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalToday / user.dailyTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold">{totalToday}</div>
            <div className="text-xs text-white/60">из {user.dailyTarget}</div>
          </div>
        </div>
      )}

      {/* ── Main layout grid ─────────────────────────────────────────────────── */}
      <div className="grid xl:grid-cols-3 gap-6">

        {/* ── Call List (2/3) ──────────────────────────────────────────────── */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* section header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-2 h-5 rounded bg-nobilis-green inline-block shrink-0" />
              <h2 className="text-lg font-semibold text-gray-800">Список для обзвона</h2>
              <span className="ml-1 bg-nobilis-green/10 text-nobilis-green text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
                {filteredLeads.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <I.Search />
                </span>
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-36 focus:outline-none focus:ring-2 focus:ring-nobilis-green/30 focus:border-nobilis-green/50"
                />
              </div>

              {/* priority filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPriorityMenu((v) => !v); setShowStatusMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <I.Filter />
                  {priorityFilter === 'all' ? 'Приоритет' : PRIORITY_META[priorityFilter]?.label}
                  <I.ChevronDown />
                </button>
                {showPriorityMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[150px] py-1" onClick={(e) => e.stopPropagation()}>
                    {[['all','Все'],['high','Высокий'],['medium','Средний'],['low','Низкий']].map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => { setPriorityFilter(val); setShowPriorityMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${priorityFilter === val ? 'text-nobilis-green font-semibold' : 'text-gray-700'}`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* status filter */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowStatusMenu((v) => !v); setShowPriorityMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <I.Filter />
                  {statusFilter === 'all' ? 'Статус' : (STATUS_META[statusFilter]?.label || statusFilter)}
                  <I.ChevronDown />
                </button>
                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[160px] py-1" onClick={(e) => e.stopPropagation()}>
                    {[
                      ['all','Все'], ['new','Новый'], ['callback','Перезвонить'],
                      ['processing','В работе'], ['noanswer','Не отвечает'],
                      ['meeting','Встреча'], ['rejected','Отказ'],
                    ].map(([val, lbl]) => (
                      <button
                        key={val}
                        onClick={() => { setStatusFilter(val); setShowStatusMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === val ? 'text-nobilis-green font-semibold' : 'text-gray-700'}`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* table or empty */}
          {filteredLeads.length === 0 ? (
            <div className="px-6 pb-6 pt-2 bg-gray-50/40">
              <EmptyState
                icon={I.Users}
                title="Список пуст"
                subtitle={allLeads.length === 0 ? 'Нет лидов для обзвона' : 'Нет лидов по выбранным фильтрам'}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/70">
                    <th className="py-2 pl-4 pr-2 text-left font-medium w-48">Лид</th>
                    <th className="py-2 px-2 text-left font-medium">Телефон</th>
                    <th className="py-2 px-2 text-left font-medium hidden md:table-cell">Приоритет</th>
                    <th className="py-2 px-2 text-left font-medium hidden lg:table-cell">Контакт</th>
                    <th className="py-2 px-2 text-left font-medium">Статус</th>
                    <th className="py-2 px-2 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id || lead.phone}
                      lead={lead}
                      onCall={handleCall}
                      onNoAnswer={handleNoAnswer}
                      onCallback={handleCallback}
                      onBookMeeting={handleBookMeeting}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Call Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-100">
              <span className="w-2 h-5 rounded bg-nobilis-gold inline-block shrink-0" />
              <h2 className="text-base font-semibold text-gray-800">История звонков</h2>
              <span className="ml-auto bg-yellow-50 text-nobilis-gold text-xs font-bold rounded-full px-2 py-0.5">
                {todayCalls.length}
              </span>
            </div>

            {todayCalls.length === 0 ? (
              <div className="px-5 pb-5 pt-2">
                <EmptyState
                  icon={I.Clock}
                  title="Звонков сегодня нет"
                  subtitle="Зарегистрируйте первый звонок"
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {[...todayCalls].reverse().map((call, i) => (
                  <div key={call.id || i} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="text-xs text-gray-400 font-mono min-w-[38px] pt-0.5 shrink-0">
                      {fmtTime(call.time)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {call.leadName || call.lead?.name || '—'}
                      </div>
                      {call.duration != null && (
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <I.Clock />
                          {secToMin(call.duration)}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      <ResultBadge result={call.result} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-100">
              <span className="w-2 h-5 rounded bg-nobilis-green inline-block shrink-0" />
              <h2 className="text-base font-semibold text-gray-800">Статистика</h2>
            </div>

            {/* period toggle */}
            <div className="flex gap-1 px-5 pt-4">
              {[['day','День'],['week','Неделя'],['month','Месяц']].map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setStatsPeriod(val)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statsPeriod === val ? 'bg-nobilis-green text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-nobilis-green">{periodCalls.length}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Звонков</div>
                </div>
                <div className="bg-gray-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-green-600">{periodSuccessRate}%</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Дозвон</div>
                </div>
                <div className="bg-gray-50 rounded-xl py-3">
                  <div className="text-xl font-bold text-nobilis-gold">{periodMeetings}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Встреч</div>
                </div>
              </div>

              {/* hour chart — day only */}
              {statsPeriod === 'day' && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Звонки по часам (8–19)</p>
                  <HourChart calls={todayCalls} />
                </div>
              )}

              {/* success rate bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Конверсия звонков</span>
                  <span className="font-semibold text-green-600">{periodSuccessRate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-nobilis-green to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${periodSuccessRate}%` }}
                  />
                </div>
              </div>

              {/* result breakdown */}
              {periodCalls.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 font-medium">Разбивка результатов</p>
                  {Object.entries(RESULT_META).map(([key, meta]) => {
                    const count = periodCalls.filter((c) => c.result === key).length;
                    if (count === 0) return null;
                    const pct = Math.round((count / periodCalls.length) * 100);
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${meta.bar}`} />
                        <span className="text-gray-600 w-20 shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-500 w-6 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-gray-400 py-3">Нет данных за выбранный период</p>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-nobilis-green/5 border border-nobilis-green/15 rounded-2xl p-5">
            <p className="text-xs font-semibold text-nobilis-green uppercase tracking-wide mb-3">Быстрые действия</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Новый лид',   icon: I.Plus,     modal: 'addLead'          },
                { label: 'Лог звонка',  icon: I.Phone,    modal: 'logCall'           },
                { label: 'Встреча',     icon: I.Calendar, modal: 'addMeeting'        },
                { label: 'Отчёт',       icon: I.Results,  modal: 'callcenterReport'  },
              ].map(({ label, icon: Icon, modal }) => (
                <button
                  key={modal}
                  onClick={() => { onSetForm({}); onSetModal(modal); }}
                  className="flex items-center gap-2 px-3 py-2.5 bg-white border border-nobilis-green/20 rounded-xl text-xs font-medium text-nobilis-green hover:bg-nobilis-green/10 transition-colors"
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>{/* end sidebar */}
      </div>{/* end grid */}
    </div>
  );
};

export default CallcenterDashboard;
