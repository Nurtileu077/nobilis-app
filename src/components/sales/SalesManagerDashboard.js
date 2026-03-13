import React, { useState, useMemo, useEffect } from 'react';
import I from '../common/Icons';

// ─── helpers ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const todayISO = today();
const nowMonth = todayISO.slice(0, 7);

const PIPELINE_STAGES = [
  { id: 'new',         label: 'Новый',       color: '#6b7280', bg: '#f3f4f6' },
  { id: 'contact',     label: 'Контакт',     color: '#3b82f6', bg: '#dbeafe' },
  { id: 'meeting',     label: 'Встреча',     color: '#8b5cf6', bg: '#ede9fe' },
  { id: 'negotiation', label: 'Переговоры',  color: '#f59e0b', bg: '#fef3c7' },
  { id: 'closed',      label: 'Закрыт',      color: '#10b981', bg: '#dcfce7' },
];

const STAGE_MAP = Object.fromEntries(PIPELINE_STAGES.map(s => [s.id, s]));

const CALL_RESULTS = {
  success:  { label: 'Успешный',   color: '#10b981', bg: '#dcfce7' },
  no_answer:{ label: 'Не ответил', color: '#ef4444', bg: '#fee2e2' },
  callback: { label: 'Перезвонить',color: '#f59e0b', bg: '#fef3c7' },
};

const MEETING_STATUSES = {
  planned:   { label: 'Запланирована', color: '#3b82f6', bg: '#dbeafe' },
  done:      { label: 'Проведена',     color: '#10b981', bg: '#dcfce7' },
  cancelled: { label: 'Отменена',      color: '#ef4444', bg: '#fee2e2' },
};

// Commission tiers from SALES_DATA spec
const COMMISSION_TIERS = [
  { min: 0,       max: 500000,   rate: 0.03, label: '3%' },
  { min: 500000,  max: 1000000,  rate: 0.05, label: '5%' },
  { min: 1000000, max: Infinity, rate: 0.07, label: '7%' },
];

const getCommission = (revenue) => {
  const tier = COMMISSION_TIERS.slice().reverse().find(t => revenue >= t.min);
  return tier ? { amount: Math.round(revenue * tier.rate), rate: tier.label } : { amount: 0, rate: '3%' };
};

const formatMoney = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(n);

// KPI targets (static defaults if not in data)
const DEFAULT_KPI = {
  leadsTarget:    30,
  meetingsTarget: 15,
  closedTarget:   5,
  revenueTarget:  2000000,
};

// ─── sub-components ─────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, text, sub }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 bg-gray-50 rounded-xl">
    <span className="opacity-40 mb-3"><Icon /></span>
    <p className="text-sm font-medium">{text}</p>
    {sub && <p className="text-xs mt-1 text-gray-300">{sub}</p>}
  </div>
);

const StageChip = ({ stageId }) => {
  const s = STAGE_MAP[stageId] || PIPELINE_STAGES[0];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
};

const CallResultChip = ({ result }) => {
  const r = CALL_RESULTS[result] || CALL_RESULTS.no_answer;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: r.color, background: r.bg }}
    >
      {r.label}
    </span>
  );
};

const MeetingStatusChip = ({ status }) => {
  const s = MEETING_STATUSES[status] || MEETING_STATUSES.planned;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
};

const ProgressBar = ({ value, max, color = '#1a3a32', showPercent = true }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showPercent && (
        <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>
      )}
    </div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const SalesManagerDashboard = ({ user, data, onSetModal, onSetForm, onSetView, onUpdateData, onAddLead, onUpdLead, onAddLeadNote, onAddMeeting, onUpdMeeting, onAddCall, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'leads');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [expandedLead, setExpandedLead] = useState(null);
  const [searchLeads, setSearchLeads] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [meetingFilter, setMeetingFilter] = useState('upcoming');

  const uid = user?.id;

  // ── derived data ────────────────────────────────────────────────────────

  const myLeads = useMemo(() => {
    if (!Array.isArray(data?.leads)) return [];
    return data.leads.filter(l => l.managerId === uid || l.assignedTo === uid);
  }, [data?.leads, uid]);

  const myMeetings = useMemo(() => {
    if (!Array.isArray(data?.meetings)) return [];
    return data.meetings.filter(m => m.managerId === uid || m.assignedTo === uid);
  }, [data?.meetings, uid]);

  const myCalls = useMemo(() => {
    if (!Array.isArray(data?.calls)) return [];
    return data.calls.filter(c => c.managerId === uid || c.assignedTo === uid);
  }, [data?.calls, uid]);

  // Stats
  const meetingsToday = useMemo(
    () => myMeetings.filter(m => (m.date || '').startsWith(todayISO)).length,
    [myMeetings]
  );

  const closedThisMonth = useMemo(
    () => myLeads.filter(l => l.stage === 'closed' && (l.closedAt || l.updatedAt || '').startsWith(nowMonth)).length,
    [myLeads]
  );

  const conversionRate = useMemo(() => {
    if (!myLeads.length) return 0;
    const closed = myLeads.filter(l => l.stage === 'closed').length;
    return Math.round((closed / myLeads.length) * 100);
  }, [myLeads]);

  // Revenue this month (from closed leads)
  const revenueThisMonth = useMemo(() => {
    return myLeads
      .filter(l => l.stage === 'closed' && (l.closedAt || l.updatedAt || '').startsWith(nowMonth))
      .reduce((sum, l) => sum + (Number(l.amount) || Number(l.dealAmount) || 0), 0);
  }, [myLeads]);

  // Calls today
  const callsToday = useMemo(
    () => myCalls.filter(c => (c.date || '').startsWith(todayISO)),
    [myCalls]
  );

  // Filtered leads
  const filteredLeads = useMemo(() => {
    let res = myLeads;
    if (filterStage !== 'all') res = res.filter(l => l.stage === filterStage);
    if (searchLeads.trim()) {
      const q = searchLeads.toLowerCase();
      res = res.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.email || '').toLowerCase().includes(q)
      );
    }
    return res;
  }, [myLeads, filterStage, searchLeads]);

  // Meetings split
  const todayMeetings = useMemo(
    () => myMeetings.filter(m => (m.date || '').startsWith(todayISO)),
    [myMeetings]
  );
  const upcomingMeetings = useMemo(
    () => myMeetings.filter(m => (m.date || '') > todayISO).sort((a, b) => (a.date > b.date ? 1 : -1)),
    [myMeetings]
  );
  const pastMeetings = useMemo(
    () => myMeetings.filter(m => (m.date || '') < todayISO).sort((a, b) => (a.date > b.date ? -1 : 1)),
    [myMeetings]
  );

  const displayedMeetings = meetingFilter === 'today'
    ? todayMeetings
    : meetingFilter === 'upcoming'
    ? upcomingMeetings
    : pastMeetings;

  // KPI data
  const kpi = data?.kpi?.[uid] || DEFAULT_KPI;
  const commission = getCommission(revenueThisMonth);

  // ── handlers ────────────────────────────────────────────────────────────

  const openAddLead    = () => { onSetForm?.({}); onSetModal?.('addLead'); };
  const openAddMeeting = () => { onSetForm?.({}); onSetModal?.('addMeeting'); };
  const openAddCall    = () => { onSetModal?.('addCall'); };

  const handleLeadClick = (id) =>
    setExpandedLead(prev => (prev === id ? null : id));

  const handleStatusChange = (lead, newStage) => {
    if (!onUpdateData) return;
    onUpdateData('leads', lead.id, { ...lead, stage: newStage, updatedAt: todayISO });
  };

  // ── tabs config ─────────────────────────────────────────────────────────

  const tabs = [
    { id: 'leads',    label: 'Мои лиды',  icon: I.Users },
    { id: 'meetings', label: 'Встречи',   icon: I.Calendar },
    { id: 'calls',    label: 'Звонки',    icon: I.Phone },
    { id: 'kpi',      label: 'Мой KPI',  icon: I.Target },
  ];

  // ── render helpers ───────────────────────────────────────────────────────

  const renderLeadCard = (lead) => {
    const isOpen = expandedLead === lead.id;
    return (
      <div
        key={lead.id}
        className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-200"
      >
        {/* lead row */}
        <button
          onClick={() => handleLeadClick(lead.id)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[#1a3a32]/10 flex items-center justify-center text-[#1a3a32] font-bold text-sm flex-shrink-0">
            {(lead.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{lead.name || 'Без имени'}</p>
            <p className="text-xs text-gray-400 truncate">{lead.phone || lead.email || '—'}</p>
          </div>
          <StageChip stageId={lead.stage || 'new'} />
          <span className={`ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <I.ChevronDown />
          </span>
        </button>

        {/* expanded details */}
        {isOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lead.email && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-gray-700">{lead.email}</p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Телефон</p>
                  <p className="text-gray-700">{lead.phone}</p>
                </div>
              )}
              {lead.source && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Источник</p>
                  <p className="text-gray-700">{lead.source}</p>
                </div>
              )}
              {lead.amount && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Сумма сделки</p>
                  <p className="font-semibold text-[#1a3a32]">{formatMoney(lead.amount)}</p>
                </div>
              )}
              {lead.createdAt && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Добавлен</p>
                  <p className="text-gray-700">{fmtDate(lead.createdAt)}</p>
                </div>
              )}
              {lead.note && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Заметка</p>
                  <p className="text-gray-700 text-xs bg-white rounded-lg p-2 border border-gray-100">{lead.note}</p>
                </div>
              )}
            </div>

            {/* pipeline progress */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Изменить статус</p>
              <div className="flex flex-wrap gap-1.5">
                {PIPELINE_STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(lead, s.id)}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all font-medium"
                    style={{
                      background: lead.stage === s.id ? s.bg : 'white',
                      color: s.color,
                      borderColor: s.color + '40',
                      fontWeight: lead.stage === s.id ? 700 : 400,
                      boxShadow: lead.stage === s.id ? `0 0 0 1.5px ${s.color}` : 'none',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* quick actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { onSetForm?.({ leadId: lead.id, leadName: lead.name }); onSetModal?.('addMeeting'); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1a3a32] text-white hover:bg-[#1a3a32]/90 transition-colors"
              >
                <I.Calendar /> Встреча
              </button>
              <button
                onClick={() => { onSetForm?.({ leadId: lead.id, leadName: lead.name }); onSetModal?.('addNote'); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#c9a227]/10 text-[#c9a227] hover:bg-[#c9a227]/20 transition-colors border border-[#c9a227]/30"
              >
                <I.Edit /> Заметка
              </button>
              <button
                onClick={() => { onSetForm?.({ leadId: lead.id }); onSetModal?.('addCall'); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <I.Phone /> Звонок
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMeetingCard = (m) => (
    <div key={m.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#c9a227]/10 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold text-[#c9a227] leading-none">
          {m.date ? new Date(m.date).getDate() : '—'}
        </span>
        <span className="text-[10px] text-[#c9a227] leading-none">
          {m.date ? new Date(m.date).toLocaleString('ru-RU', { month: 'short' }) : ''}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{m.title || m.leadName || 'Встреча'}</p>
        <p className="text-xs text-gray-400 truncate">
          {m.date && fmtTime(m.date + (m.time ? 'T' + m.time : ''))}
          {m.location && ` · ${m.location}`}
        </p>
        {m.note && <p className="text-xs text-gray-500 mt-0.5 truncate">{m.note}</p>}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <MeetingStatusChip status={m.status || 'planned'} />
        {m.outcome && (
          <span className="text-xs text-gray-400 truncate max-w-[80px]">{m.outcome}</span>
        )}
      </div>
    </div>
  );

  const renderCallRow = (c) => (
    <div key={c.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: CALL_RESULTS[c.result]?.bg || '#f3f4f6',
          color: CALL_RESULTS[c.result]?.color || '#6b7280',
        }}
      >
        <I.Phone />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{c.leadName || c.name || '—'}</p>
        <p className="text-xs text-gray-400">
          {fmtDate(c.date)}
          {c.duration ? ` · ${c.duration}` : ''}
        </p>
      </div>
      <CallResultChip result={c.result || 'no_answer'} />
    </div>
  );

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1a3a32] to-[#1a3a32]/80 rounded-2xl px-6 py-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#c9a227] flex items-center justify-center text-white font-bold text-xl shadow-md">
              {(user?.name || 'М').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{user?.name || 'Менеджер по продажам'}</h1>
              <p className="text-sm text-white/70 mt-0.5">Менеджер по продажам · Личная панель</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm text-white/60">Сегодня</p>
            <p className="text-base font-semibold text-[#c9a227]">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-2 mb-2 text-[#1a3a32]"><I.Users /></div>
          <div className="text-3xl font-bold text-[#1a3a32]">{myLeads.length}</div>
          <div className="text-xs text-gray-500 mt-1">Моих лидов</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-2 mb-2 text-[#c9a227]"><I.Calendar /></div>
          <div className="text-3xl font-bold text-[#c9a227]">{meetingsToday}</div>
          <div className="text-xs text-gray-500 mt-1">Встреч сегодня</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-2 mb-2 text-green-600"><I.Check /></div>
          <div className="text-3xl font-bold text-green-600">{closedThisMonth}</div>
          <div className="text-xs text-gray-500 mt-1">Закрыто в этом месяце</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-2 mb-2 text-blue-600"><I.Results /></div>
          <div className="text-3xl font-bold text-blue-600">{conversionRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Конверсия</div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  active
                    ? 'border-[#1a3a32] text-[#1a3a32] bg-[#1a3a32]/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ─ MY LEADS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'leads' && (
          <div className="p-5 space-y-4">
            {/* pipeline summary */}
            <div className="grid grid-cols-5 gap-2">
              {PIPELINE_STAGES.map(s => {
                const cnt = myLeads.filter(l => (l.stage || 'new') === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => setFilterStage(prev => prev === s.id ? 'all' : s.id)}
                    className="flex flex-col items-center p-2.5 rounded-xl border transition-all text-center"
                    style={{
                      background: filterStage === s.id ? s.bg : 'white',
                      borderColor: filterStage === s.id ? s.color + '50' : '#f3f4f6',
                      boxShadow: filterStage === s.id ? `0 0 0 1.5px ${s.color}40` : 'none',
                    }}
                  >
                    <span className="text-xl font-bold" style={{ color: s.color }}>{cnt}</span>
                    <span className="text-[10px] leading-tight mt-0.5" style={{ color: s.color }}>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* toolbar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <I.Search />
                </span>
                <input
                  type="text"
                  value={searchLeads}
                  onChange={e => setSearchLeads(e.target.value)}
                  placeholder="Поиск по имени, телефону..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20"
                />
              </div>
              <button
                onClick={openAddLead}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1a3a32] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a32]/90 transition-colors"
              >
                <I.Plus /> Лид
              </button>
            </div>

            {/* lead list */}
            {filteredLeads.length === 0 ? (
              <EmptyState icon={I.Users} text="Нет лидов" sub="Добавьте первый лид или смените фильтр" />
            ) : (
              <div className="space-y-2">
                {filteredLeads.map(renderLeadCard)}
              </div>
            )}
          </div>
        )}

        {/* ─ MEETINGS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'meetings' && (
          <div className="p-5 space-y-4">
            {/* today banner */}
            {todayMeetings.length > 0 && (
              <div className="bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#c9a227] mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <I.Clock /> Сегодня · {todayMeetings.length} встреч
                </p>
                <div className="space-y-2">
                  {todayMeetings.map(renderMeetingCard)}
                </div>
              </div>
            )}

            {/* filter bar */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'upcoming', label: `Предстоящие (${upcomingMeetings.length})` },
                { id: 'today',    label: `Сегодня (${todayMeetings.length})` },
                { id: 'past',     label: `Прошедшие (${pastMeetings.length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setMeetingFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    meetingFilter === f.id
                      ? 'bg-[#1a3a32] text-white border-[#1a3a32]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={openAddMeeting}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-[#c9a227] text-white text-xs font-medium rounded-full hover:bg-[#c9a227]/90 transition-colors"
              >
                <I.Plus /> Встреча
              </button>
            </div>

            {displayedMeetings.length === 0 ? (
              <EmptyState icon={I.Calendar} text="Нет встреч" sub="В этом разделе ничего нет" />
            ) : (
              <div className="space-y-2">
                {displayedMeetings.map(renderMeetingCard)}
              </div>
            )}
          </div>
        )}

        {/* ─ CALLS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'calls' && (
          <div className="p-5 space-y-4">
            {/* call stats today */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-[#1a3a32]">{callsToday.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Звонков сегодня</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {callsToday.filter(c => c.result === 'success').length}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Успешных</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {callsToday.filter(c => c.result !== 'success').length}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Неуспешных</div>
              </div>
            </div>

            {/* action bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Журнал звонков
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Всего: {myCalls.length}
                </span>
              </p>
              <button
                onClick={openAddCall}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1a3a32] text-white text-sm font-medium rounded-xl hover:bg-[#1a3a32]/90 transition-colors"
              >
                <I.Plus /> Звонок
              </button>
            </div>

            {/* calls list */}
            {myCalls.length === 0 ? (
              <EmptyState icon={I.Phone} text="Нет записей о звонках" sub="Зафиксируйте первый звонок" />
            ) : (
              <div className="divide-y divide-gray-50">
                {[...myCalls]
                  .sort((a, b) => ((b.date || '') > (a.date || '') ? 1 : -1))
                  .map(renderCallRow)}
              </div>
            )}
          </div>
        )}

        {/* ─ KPI TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'kpi' && (
          <div className="p-5 space-y-5">
            {/* headline */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-800">Мои KPI</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a3a32]/5 border border-[#1a3a32]/10">
                <I.Flag />
                <span className="text-xs font-semibold text-[#1a3a32]">Активный месяц</span>
              </div>
            </div>

            {/* kpi metrics */}
            <div className="space-y-4">
              {[
                {
                  label: 'Лидов',
                  actual: myLeads.length,
                  target: kpi.leadsTarget,
                  color: '#1a3a32',
                  icon: I.Users,
                },
                {
                  label: 'Встреч проведено',
                  actual: myMeetings.filter(m => m.status === 'done').length,
                  target: kpi.meetingsTarget,
                  color: '#c9a227',
                  icon: I.Calendar,
                },
                {
                  label: 'Закрытых сделок',
                  actual: closedThisMonth,
                  target: kpi.closedTarget,
                  color: '#10b981',
                  icon: I.Check,
                },
              ].map((m, i) => {
                const pct = m.target > 0 ? Math.min(100, Math.round((m.actual / m.target) * 100)) : 0;
                const Icon = m.icon;
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: m.color }}><Icon /></span>
                        <span className="text-sm font-semibold text-gray-700">{m.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold" style={{ color: m.color }}>{m.actual}</span>
                        <span className="text-xs text-gray-400"> / {m.target}</span>
                      </div>
                    </div>
                    <ProgressBar value={m.actual} max={m.target} color={m.color} />
                    <p className="text-xs text-gray-400 mt-1.5">
                      {pct >= 100
                        ? 'Цель достигнута!'
                        : `Осталось: ${m.target - m.actual} ${m.label.toLowerCase()}`}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* revenue & commission block */}
            <div className="bg-gradient-to-br from-[#1a3a32] to-[#1a3a32]/80 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <I.Money />
                <span className="font-bold text-base">Выручка и комиссия</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-white/60 mb-0.5">Выручка в этом месяце</p>
                  <p className="text-xl font-bold text-[#c9a227]">
                    {revenueThisMonth > 0 ? formatMoney(revenueThisMonth) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-0.5">Моя комиссия</p>
                  <p className="text-xl font-bold text-[#c9a227]">
                    {revenueThisMonth > 0 ? formatMoney(commission.amount) : '—'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-white/60 mb-2">Цель по выручке</p>
                <ProgressBar value={revenueThisMonth} max={kpi.revenueTarget} color="#c9a227" />
              </div>

              {/* commission tiers legend */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/60 mb-2">Тарифы комиссии</p>
                <div className="flex gap-3 flex-wrap">
                  {COMMISSION_TIERS.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: revenueThisMonth >= t.min && (i === COMMISSION_TIERS.length - 1 || revenueThisMonth < COMMISSION_TIERS[i + 1]?.min)
                          ? 'rgba(201,162,39,0.25)'
                          : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <span className="text-[#c9a227] font-bold text-sm">{t.label}</span>
                      <span className="text-xs text-white/50">
                        {t.max === Infinity
                          ? `от ${(t.min / 1000).toFixed(0)}k`
                          : `${(t.min / 1000).toFixed(0)}k–${(t.max / 1000).toFixed(0)}k`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* conversion rate card */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <I.Results />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Конверсия</p>
                  <p className="text-xs text-gray-400">Лиды → Закрытые сделки</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{conversionRate}%</p>
                <p className="text-xs text-gray-400">{myLeads.filter(l => l.stage === 'closed').length} / {myLeads.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagerDashboard;
