import React, { useState, useMemo } from 'react';
import I from '../common/Icons';

// ─── helpers ────────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const fmtMoney = (n) =>
  n == null ? '—' : Number(n).toLocaleString('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 });

// ─── status config ───────────────────────────────────────────────────────────

const LEAD_STATUSES = {
  new:          { label: 'Новый',        color: 'bg-blue-100 text-blue-700' },
  contacted:    { label: 'Связались',    color: 'bg-yellow-100 text-yellow-700' },
  meeting:      { label: 'Встреча',      color: 'bg-purple-100 text-purple-700' },
  negotiation:  { label: 'Переговоры',   color: 'bg-orange-100 text-orange-700' },
  closed_won:   { label: 'Закрыт ✓',    color: 'bg-green-100 text-green-700' },
  closed_lost:  { label: 'Потерян',      color: 'bg-red-100 text-red-700' },
};

const MEETING_TYPES = {
  online:  { label: 'Онлайн',  color: 'bg-blue-100 text-blue-700' },
  offline: { label: 'Офлайн',  color: 'bg-gray-100 text-gray-700' },
};

const MEETING_STATUSES = {
  scheduled:  { label: 'Запланирована', color: 'bg-yellow-100 text-yellow-700' },
  completed:  { label: 'Проведена',     color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменена',      color: 'bg-red-100 text-red-700' },
};

// ─── sub-components ──────────────────────────────────────────────────────────

const Badge = ({ cfg, value }) => {
  const c = cfg?.[value];
  if (!c) return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">{value || '—'}</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
};

const StatCard = ({ icon, value, label, color }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
    <div className={`flex items-center gap-2 mb-1 ${color}`}>{icon}</div>
    <div className={`text-3xl font-bold ${color}`}>{value ?? '—'}</div>
    <div className="text-sm text-gray-500 mt-0.5">{label}</div>
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 bg-gray-50 rounded-xl">
    <span className="opacity-40">{icon}</span>
    <p className="mt-3 text-sm">{text || 'Нет данных'}</p>
  </div>
);

const SectionTitle = ({ accent, children }) => (
  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
    <span className={`w-2 h-5 rounded inline-block ${accent || 'bg-[#1a3a32]'}`} />
    {children}
  </h3>
);

// ─── LEADS TAB ───────────────────────────────────────────────────────────────

const LeadsTab = ({ leads, onSetModal, onSetForm }) => {
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.source || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [leads, search, filterStatus]);

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <I.Search />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm hover:bg-gray-50 transition-colors"
          >
            <I.Filter />
            <span>{filterStatus === 'all' ? 'Все статусы' : LEAD_STATUSES[filterStatus]?.label}</span>
            <I.ChevronDown />
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-2 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => { setFilter('all'); setShowFilter(false); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                Все статусы
              </button>
              {Object.entries(LEAD_STATUSES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => { setFilter(k); setShowFilter(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => { onSetForm({}); onSetModal('addLead'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a3a32] text-white text-sm font-medium hover:bg-[#1a3a32]/90 transition-colors"
        >
          <I.Plus />
          Новый лид
        </button>
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <EmptyState icon={<I.Users />} text="Лиды не найдены" />
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const isOpen = expanded === lead.id;
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all"
              >
                {/* row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : lead.id)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a3a32]/10 flex items-center justify-center text-[#1a3a32] font-bold text-sm shrink-0">
                      {(lead.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{lead.name || '—'}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <I.Phone />
                            {lead.phone}
                          </span>
                        )}
                        {lead.source && (
                          <span className="flex items-center gap-1">
                            <I.Globe />
                            {lead.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Badge cfg={LEAD_STATUSES} value={lead.status} />
                      {lead.assignedTo && (
                        <span className="text-xs text-gray-400 hidden sm:block">{lead.assignedTo}</span>
                      )}
                      <span className="text-xs text-gray-400">{fmtDate(lead.createdAt)}</span>
                      <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <I.ChevronDown />
                      </span>
                    </div>
                  </div>
                </button>

                {/* expanded */}
                {isOpen && (
                  <div className="border-t bg-gray-50/60 px-5 py-4 space-y-4">
                    {/* details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Источник</div>
                        <div className="font-medium text-gray-700">{lead.source || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Менеджер</div>
                        <div className="font-medium text-gray-700">{lead.assignedTo || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Email</div>
                        <div className="font-medium text-gray-700">{lead.email || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Бюджет</div>
                        <div className="font-medium text-gray-700">{lead.budget ? fmtMoney(lead.budget) : '—'}</div>
                      </div>
                    </div>

                    {/* notes */}
                    {lead.notes && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Заметки</div>
                        <p className="text-sm text-gray-600 bg-white rounded-xl px-3 py-2 border">{lead.notes}</p>
                      </div>
                    )}

                    {/* history */}
                    {Array.isArray(lead.history) && lead.history.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 mb-2">История</div>
                        <div className="space-y-1.5">
                          {lead.history.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="mt-0.5 text-[#1a3a32]"><I.Clock /></span>
                              <span className="text-gray-400 shrink-0">{fmtDate(h.date)}</span>
                              <span className="text-gray-600">{h.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => { onSetForm(lead); onSetModal('editLead'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a3a32] text-white text-xs font-medium hover:bg-[#1a3a32]/90 transition-colors"
                      >
                        <I.Edit />
                        Редактировать
                      </button>
                      <button
                        onClick={() => { onSetForm({ leadId: lead.id }); onSetModal('addMeeting'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c9a227] text-white text-xs font-medium hover:bg-[#c9a227]/90 transition-colors"
                      >
                        <I.Calendar />
                        Назначить встречу
                      </button>
                      <button
                        onClick={() => { onSetForm({ leadId: lead.id }); onSetModal('logCall'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        <I.Phone />
                        Звонок
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── MEETINGS TAB ─────────────────────────────────────────────────────────────

const MeetingsTab = ({ meetings, onSetModal, onSetForm }) => {
  const [period, setPeriod] = useState('today');

  const filtered = useMemo(() => {
    const now = new Date();
    return meetings.filter((m) => {
      if (!m.datetime) return false;
      const d = new Date(m.datetime);
      if (period === 'today') {
        return d.toISOString().slice(0, 10) === today();
      }
      if (period === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return d >= start && d < end;
      }
      if (period === 'month') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }
      return true;
    });
  }, [meetings, period]);

  // group by date
  const byDay = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      const key = m.datetime ? new Date(m.datetime).toISOString().slice(0, 10) : 'unknown';
      if (!map[key]) map[key] = [];
      map[key].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const periodLabels = { today: 'Сегодня', week: 'Неделя', month: 'Месяц' };

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden text-sm">
          {Object.entries(periodLabels).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`px-4 py-2 transition-colors ${
                period === k
                  ? 'bg-[#1a3a32] text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => { onSetForm({}); onSetModal('addMeeting'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c9a227] text-white text-sm font-medium hover:bg-[#c9a227]/90 transition-colors"
          >
            <I.Plus />
            Встреча
          </button>
        </div>
      </div>

      {byDay.length === 0 ? (
        <EmptyState icon={<I.Calendar />} text="Встречи не найдены за выбранный период" />
      ) : (
        <div className="space-y-5">
          {byDay.map(([date, dayMeetings]) => (
            <div key={date}>
              {/* day header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#1a3a32] text-white rounded-xl px-3 py-1 text-sm font-semibold">
                  {fmtDate(date)}
                </div>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{dayMeetings.length} встр.</span>
              </div>

              <div className="space-y-2">
                {dayMeetings
                  .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                  .map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border shadow-sm px-5 py-4 flex flex-wrap items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      {/* time */}
                      <div className="text-xl font-bold text-[#1a3a32] w-14 shrink-0">
                        {fmtTime(m.datetime)}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{m.clientName || '—'}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                          {m.manager && (
                            <span className="flex items-center gap-1">
                              <I.Users />
                              {m.manager}
                            </span>
                          )}
                          {m.location && (
                            <span className="flex items-center gap-1">
                              <I.Globe />
                              {m.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge cfg={MEETING_TYPES} value={m.type} />
                        <Badge cfg={MEETING_STATUSES} value={m.status} />
                        <button
                          onClick={() => { onSetForm(m); onSetModal('editMeeting'); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                        >
                          <I.Edit />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── REPORT TAB ───────────────────────────────────────────────────────────────

const ReportTab = ({ leads, meetings, salesTeam }) => {
  const [period, setPeriod] = useState('month');

  // filter by period
  const filterByPeriod = (items, dateField) => {
    const now = new Date();
    return items.filter((item) => {
      const d = new Date(item[dateField]);
      if (isNaN(d)) return false;
      if (period === 'day') return item[dateField]?.slice(0, 10) === today();
      if (period === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return d >= start && d < end;
      }
      if (period === 'month') {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }
      return true;
    });
  };

  const periodLeads    = filterByPeriod(leads, 'createdAt');
  const periodMeetings = filterByPeriod(meetings, 'datetime');

  const closedWon  = periodLeads.filter((l) => l.status === 'closed_won');
  const closedLost = periodLeads.filter((l) => l.status === 'closed_lost');
  const totalRevenue = closedWon.reduce((s, l) => s + (Number(l.budget) || 0), 0);
  const callsMade  = periodLeads.reduce((s, l) => s + (Number(l.callsCount) || 0), 0);

  // per-manager breakdown
  const managerMap = {};
  periodLeads.forEach((l) => {
    const m = l.assignedTo || 'Не назначен';
    if (!managerMap[m]) managerMap[m] = { leads: 0, won: 0, lost: 0, revenue: 0 };
    managerMap[m].leads++;
    if (l.status === 'closed_won') { managerMap[m].won++; managerMap[m].revenue += Number(l.budget) || 0; }
    if (l.status === 'closed_lost') managerMap[m].lost++;
  });

  const managers = Object.entries(managerMap).sort((a, b) => b[1].won - a[1].won);
  const maxWon   = Math.max(...managers.map(([, v]) => v.won), 1);

  const periodLabels = { day: 'День', week: 'Неделя', month: 'Месяц' };

  return (
    <div className="space-y-6">
      {/* period selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Период:</span>
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden text-sm">
          {Object.entries(periodLabels).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`px-4 py-2 transition-colors ${
                period === k
                  ? 'bg-[#1a3a32] text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a3a32] to-[#1a3a32]/80 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-bold">{callsMade || '—'}</div>
          <div className="text-sm text-white/70 mt-1 flex items-center gap-1">
            <I.Phone />
            Звонков
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#c9a227] to-[#c9a227]/80 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-bold">{periodMeetings.length}</div>
          <div className="text-sm text-white/70 mt-1 flex items-center gap-1">
            <I.Calendar />
            Встреч
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-bold">{closedWon.length}</div>
          <div className="text-sm text-white/70 mt-1 flex items-center gap-1">
            <I.Check />
            Сделок
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-3xl font-bold">
            {totalRevenue > 0
              ? `${Math.round(totalRevenue / 1000)}K`
              : '—'}
          </div>
          <div className="text-sm text-white/70 mt-1 flex items-center gap-1">
            <I.Money />
            Выручка
          </div>
        </div>
      </div>

      {/* manager breakdown */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <SectionTitle>Разбивка по менеджерам</SectionTitle>

        {managers.length === 0 ? (
          <EmptyState icon={<I.Users />} text="Нет данных за выбранный период" />
        ) : (
          <>
            {/* table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b">
                    <th className="pb-2 font-medium">Менеджер</th>
                    <th className="pb-2 font-medium text-center">Лиды</th>
                    <th className="pb-2 font-medium text-center">Закрыто</th>
                    <th className="pb-2 font-medium text-center">Потеряно</th>
                    <th className="pb-2 font-medium text-center">Конверсия</th>
                    <th className="pb-2 font-medium text-right">Выручка</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {managers.map(([name, s], idx) => {
                    const conv = s.leads > 0 ? Math.round((s.won / s.leads) * 100) : 0;
                    return (
                      <tr key={name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1a3a32]/10 text-[#1a3a32] text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800">{name}</span>
                        </td>
                        <td className="py-3 text-center text-gray-600">{s.leads}</td>
                        <td className="py-3 text-center text-green-600 font-medium">{s.won}</td>
                        <td className="py-3 text-center text-red-500">{s.lost}</td>
                        <td className="py-3 text-center">
                          <span className={`font-medium ${conv >= 50 ? 'text-green-600' : conv >= 25 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {conv}%
                          </span>
                        </td>
                        <td className="py-3 text-right text-gray-700 font-medium">
                          {s.revenue > 0 ? fmtMoney(s.revenue) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CSS bar chart */}
            <div className="mt-6">
              <div className="text-xs text-gray-400 mb-3">Закрытых сделок по менеджерам</div>
              <div className="space-y-2">
                {managers.map(([name, s]) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-gray-600 truncate shrink-0">{name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1a3a32] to-[#1a3a32]/70 transition-all duration-500"
                        style={{ width: `${(s.won / maxWon) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-xs font-semibold text-[#1a3a32] text-right shrink-0">
                      {s.won}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* conversion funnel mini */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <SectionTitle accent="bg-[#c9a227]">Воронка продаж</SectionTitle>
        <div className="mt-4 flex flex-wrap gap-3 justify-between">
          {Object.entries(LEAD_STATUSES).map(([key, cfg]) => {
            const count = periodLeads.filter((l) => l.status === key).length;
            return (
              <div key={key} className="flex-1 min-w-[80px] text-center">
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${cfg.color}`}>
                  {cfg.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── TEAM TAB ─────────────────────────────────────────────────────────────────

const TeamTab = ({ salesTeam, leads, onSetModal, onSetForm }) => {
  const managers   = salesTeam.filter((m) => m.role === 'sales_manager' || m.role === 'manager');
  const callcenter = salesTeam.filter((m) => m.role === 'callcenter' || m.role === 'operator');
  const others     = salesTeam.filter(
    (m) => m.role !== 'sales_manager' && m.role !== 'manager' && m.role !== 'callcenter' && m.role !== 'operator'
  );

  // compute live stats per member from leads
  const getStats = (member) => {
    const name = member.name;
    const myLeads = leads.filter((l) => l.assignedTo === name);
    const won  = myLeads.filter((l) => l.status === 'closed_won').length;
    const conv = myLeads.length > 0 ? Math.round((won / myLeads.length) * 100) : 0;
    const revenue = myLeads
      .filter((l) => l.status === 'closed_won')
      .reduce((s, l) => s + (Number(l.budget) || 0), 0);
    return { leads: myLeads.length, won, conv, revenue };
  };

  const MemberCard = ({ member, accentClass }) => {
    const s = getStats(member);
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-5 card-hover space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${accentClass || 'bg-[#1a3a32]'} flex items-center justify-center text-white font-bold`}>
              {(member.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{member.name}</div>
              <div className="text-xs text-gray-400">{member.position || member.role || '—'}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => { onSetForm(member); onSetModal('editTeamMember'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            >
              <I.Edit />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="text-lg font-bold text-[#1a3a32]">{s.leads}</div>
            <div className="text-xs text-gray-400">лидов</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="text-lg font-bold text-green-600">{s.won}</div>
            <div className="text-xs text-gray-400">закрыто</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <div className={`text-lg font-bold ${s.conv >= 50 ? 'text-green-600' : s.conv >= 25 ? 'text-yellow-600' : 'text-gray-400'}`}>
              {s.conv}%
            </div>
            <div className="text-xs text-gray-400">конверсия</div>
          </div>
        </div>

        {/* progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Конверсия</span>
            <span>{s.conv}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                s.conv >= 50
                  ? 'bg-green-500'
                  : s.conv >= 25
                  ? 'bg-yellow-400'
                  : 'bg-gray-300'
              }`}
              style={{ width: `${Math.min(s.conv, 100)}%` }}
            />
          </div>
        </div>

        {s.revenue > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <I.Money />
            <span className="font-medium">{fmtMoney(s.revenue)}</span>
            <span className="text-gray-400">выручка</span>
          </div>
        )}

        {member.phone && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <I.Phone />
            {member.phone}
          </div>
        )}
        {member.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <I.Mail />
            {member.email}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Sales managers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Менеджеры по продажам</SectionTitle>
          <button
            onClick={() => { onSetForm({ role: 'sales_manager' }); onSetModal('addSalesManager'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a3a32] text-white text-xs font-medium hover:bg-[#1a3a32]/90 transition-colors"
          >
            <I.Plus />
            Добавить
          </button>
        </div>
        {managers.length === 0 ? (
          <EmptyState icon={<I.Users />} text="Нет менеджеров по продажам" />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {managers.map((m) => (
              <MemberCard key={m.id || m.name} member={m} accentClass="bg-[#1a3a32]" />
            ))}
          </div>
        )}
      </div>

      {/* Callcenter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle accent="bg-[#c9a227]">Колл-центр</SectionTitle>
          <button
            onClick={() => { onSetForm({ role: 'callcenter' }); onSetModal('addCallcenter'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c9a227] text-white text-xs font-medium hover:bg-[#c9a227]/90 transition-colors"
          >
            <I.Plus />
            Добавить
          </button>
        </div>
        {callcenter.length === 0 ? (
          <EmptyState icon={<I.Phone />} text="Нет операторов колл-центра" />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {callcenter.map((m) => (
              <MemberCard key={m.id || m.name} member={m} accentClass="bg-[#c9a227]" />
            ))}
          </div>
        )}
      </div>

      {/* Others */}
      {others.length > 0 && (
        <div>
          <div className="mb-4">
            <SectionTitle accent="bg-blue-500">Прочие сотрудники</SectionTitle>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {others.map((m) => (
              <MemberCard key={m.id || m.name} member={m} accentClass="bg-blue-500" />
            ))}
          </div>
        </div>
      )}

      {/* Performance ranking */}
      {managers.length + callcenter.length > 1 && (
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <SectionTitle>Рейтинг эффективности</SectionTitle>
          <div className="mt-4 space-y-3">
            {[...managers, ...callcenter]
              .map((m) => ({ ...m, stats: getStats(m) }))
              .sort((a, b) => b.stats.conv - a.stats.conv)
              .map((m, idx) => (
                <div key={m.id || m.name} className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0
                      ? 'bg-[#c9a227] text-white'
                      : idx === 1
                      ? 'bg-gray-300 text-gray-700'
                      : idx === 2
                      ? 'bg-orange-300 text-orange-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-32 font-medium text-gray-700 truncate text-sm">{m.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-[#c9a227]' : 'bg-[#1a3a32]/60'
                      }`}
                      style={{ width: `${Math.min(m.stats.conv, 100)}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm font-semibold text-right text-gray-700 shrink-0">
                    {m.stats.conv}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TABS = [
  { key: 'leads',    label: 'Лиды',    icon: <I.Users /> },
  { key: 'meetings', label: 'Встречи', icon: <I.Calendar /> },
  { key: 'report',   label: 'Отчёт',   icon: <I.Results /> },
  { key: 'team',     label: 'Команда', icon: <I.Flag /> },
];

const ROPDashboard = ({ data = {}, user, onSetModal, onSetForm, onSetView, onUpdateData, onAddLead, onUpdLead, onDelLead, onAddLeadNote, onAddMeeting, onUpdMeeting, onDelMeeting, onAddCall, initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'leads');

  // safe arrays
  const leads     = Array.isArray(data.leads)     ? data.leads     : [];
  const meetings  = Array.isArray(data.meetings)  ? data.meetings  : [];
  const salesTeam = Array.isArray(data.salesTeam) ? data.salesTeam : [];

  // ── stats ────────────────────────────────────────────────────────────────
  const totalLeads = leads.length;

  const todayStr = today();
  const meetingsToday = meetings.filter(
    (m) => m.datetime && new Date(m.datetime).toISOString().slice(0, 10) === todayStr
  ).length;

  const monthStr = thisMonth();
  const closedThisMonth = leads.filter(
    (l) =>
      l.status === 'closed_won' &&
      l.createdAt &&
      l.createdAt.slice(0, 7) === monthStr
  ).length;

  const closedTotal = leads.filter((l) => l.status === 'closed_won' || l.status === 'closed_lost').length;
  const conversionRate = closedTotal > 0
    ? Math.round((leads.filter((l) => l.status === 'closed_won').length / closedTotal) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#1a3a32] flex items-center justify-center text-white">
            <I.Dashboard />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Панель РОПа</h1>
            <p className="text-sm text-gray-500">{user?.name || 'Руководитель отдела продаж'}</p>
          </div>
        </div>
        <button
          onClick={() => { onSetForm && onSetForm({}); onSetModal && onSetModal('notifications'); }}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <I.Bell />
        </button>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<I.Users />}
          value={totalLeads}
          label="Всего лидов"
          color="text-[#1a3a32]"
        />
        <StatCard
          icon={<I.Calendar />}
          value={meetingsToday}
          label="Встреч сегодня"
          color="text-[#c9a227]"
        />
        <StatCard
          icon={<I.Check />}
          value={closedThisMonth}
          label="Закрыто в этом месяце"
          color="text-green-600"
        />
        <StatCard
          icon={<I.Results />}
          value={`${conversionRate}%`}
          label="Конверсия"
          color="text-blue-600"
        />
      </div>

      {/* tabs */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* tab bar */}
        <div className="flex border-b overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-[#1a3a32] text-[#1a3a32] bg-[#1a3a32]/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={activeTab === tab.key ? 'text-[#1a3a32]' : 'text-gray-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div className="p-5">
          {activeTab === 'leads' && (
            <LeadsTab
              leads={leads}
              onSetModal={onSetModal}
              onSetForm={onSetForm}
            />
          )}
          {activeTab === 'meetings' && (
            <MeetingsTab
              meetings={meetings}
              onSetModal={onSetModal}
              onSetForm={onSetForm}
            />
          )}
          {activeTab === 'report' && (
            <ReportTab
              leads={leads}
              meetings={meetings}
              salesTeam={salesTeam}
            />
          )}
          {activeTab === 'team' && (
            <TeamTab
              salesTeam={salesTeam}
              leads={leads}
              onSetModal={onSetModal}
              onSetForm={onSetForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ROPDashboard;
