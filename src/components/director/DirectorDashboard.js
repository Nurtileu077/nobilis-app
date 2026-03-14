import React from 'react';
import I from '../common/Icons';
import { getInitials, formatDateTime } from '../../data/utils';
import { ROLES } from '../../data/constants';

let PNL_DATA = null;
try { PNL_DATA = require('../../data/pnlData').PNL_DATA; } catch (e) {}

const fmtMoney = (n) => {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + ' млн';
  if (abs >= 1_000) return sign + Math.round(abs / 1_000).toLocaleString('ru-RU') + ' тыс';
  return String(Math.round(n));
};

const StatCard = ({ icon: Icon, label, value, gradient, accent }) => (
  <div className={`rounded-2xl p-5 shadow-sm ${gradient ? 'bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] text-white' : 'bg-white border text-gray-800'} card-hover`}>
    <div className="flex items-start justify-between">
      <div>
        <div className={`text-3xl font-bold ${gradient ? 'text-white' : accent || 'text-[#1a3a32]'}`}>{value}</div>
        <div className={`text-sm mt-1 ${gradient ? 'text-green-200' : 'text-gray-500'}`}>{label}</div>
      </div>
      <div className={`p-2 rounded-xl ${gradient ? 'bg-white/10' : 'bg-[#f0f7f4]'}`}>
        <Icon />
      </div>
    </div>
  </div>
);

const DirectorDashboard = ({ data, onSetModal, onSetForm, onSetSelected }) => {
  const { students = [], teachers = [], schedule = [], mockTests = [], internships = [], supportTickets = [], globalTasks = [] } = data;

  const activeEmployees = teachers.length; // 3 сотрудника

  const pendingTasks = globalTasks?.filter(t => !t.done).length ?? 0;
  const openTickets = supportTickets?.filter(t => !t.resolved).length ?? 0;

  // Gather last 5 history entries across all students
  const recentActivity = [];
  students.forEach(s => {
    (s.history || []).forEach(h => {
      recentActivity.push({ ...h, studentName: s.name, studentId: s.id });
    });
  });
  recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestActivity = recentActivity.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Панель директора</h1>
        <span className="text-sm text-gray-400 font-medium">{ROLES.director?.name}</span>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={I.Users}
          label="Всего студентов"
          value={students.length}
          gradient
        />
        <StatCard
          icon={I.Briefcase}
          label="Сотрудников"
          value={activeEmployees}
          accent="text-[#c9a227]"
        />
        <StatCard
          icon={I.Tasks}
          label="Задач в работе"
          value={pendingTasks}
          accent={pendingTasks > 0 ? 'text-amber-500' : 'text-green-600'}
        />
        <StatCard
          icon={I.Support}
          label="Открытых тикетов"
          value={openTickets}
          accent={openTickets > 0 ? 'text-red-500' : 'text-green-600'}
        />
      </div>

      {/* Financial overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#f0f7f4] rounded-xl">
            <I.Money />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Финансовый обзор</h2>
          {PNL_DATA && (
            <span className="text-xs text-gray-400 ml-auto">{PNL_DATA.months[PNL_DATA.months.length - 1]}</span>
          )}
        </div>
        {PNL_DATA ? (() => {
          const lastIdx = PNL_DATA.months.length - 1;
          const rev = PNL_DATA.revenue[lastIdx] || 0;
          const exp = PNL_DATA.totalExpenses[lastIdx] || 0;
          const profit = PNL_DATA.profit[lastIdx] || 0;
          const plan = PNL_DATA.plan[lastIdx] || 0;
          const payroll = PNL_DATA.payroll[lastIdx] || 0;
          const planPct = plan > 0 ? ((rev / plan) * 100).toFixed(0) : 0;
          const cumProfit = PNL_DATA.profit.reduce((s, p) => s + p, 0);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg,#1a3a32,#2d5a4a)' }}>
                  <div className="text-xs text-green-200/60 font-medium">Выручка</div>
                  <div className="text-xl font-bold text-white mt-1">{fmtMoney(rev)} ₸</div>
                  <div className="text-xs text-green-200/40 mt-1">{planPct}% от плана</div>
                </div>
                <div className="rounded-xl p-4 bg-red-50 border border-red-100">
                  <div className="text-xs text-red-400 font-medium">Расходы</div>
                  <div className="text-xl font-bold text-red-600 mt-1">{fmtMoney(exp)} ₸</div>
                  <div className="text-xs text-red-300 mt-1">ЗП: {fmtMoney(payroll)} ₸</div>
                </div>
                <div className={`rounded-xl p-4 ${profit >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                  <div className={`text-xs font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {profit >= 0 ? 'Прибыль' : 'Убыток'}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {fmtMoney(profit)} ₸
                  </div>
                </div>
                <div className={`rounded-xl p-4 ${cumProfit >= 0 ? 'bg-amber-50 border border-amber-100' : 'bg-red-50 border border-red-100'}`}>
                  <div className="text-xs text-amber-500 font-medium">Накоплено (всего)</div>
                  <div className={`text-xl font-bold mt-1 ${cumProfit >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {fmtMoney(cumProfit)} ₸
                  </div>
                  <div className="text-xs text-amber-300 mt-1">{PNL_DATA.months.length} мес.</div>
                </div>
              </div>
              {/* Mini bar chart - last 6 months */}
              <div className="flex items-end gap-1 h-16 px-2">
                {PNL_DATA.profit.slice(-6).map((p, i) => {
                  const monthName = PNL_DATA.months.slice(-6)[i];
                  const maxAbs = Math.max(...PNL_DATA.profit.slice(-6).map(Math.abs), 1);
                  const h = Math.max((Math.abs(p) / maxAbs) * 50, 3);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${h}px`,
                          background: p >= 0 ? '#22c55e' : '#ef4444',
                          opacity: 0.7,
                        }}
                      />
                      <span className="text-[8px] text-gray-400">{(monthName || '').split(' ')[0]?.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })() : (
          <div className="bg-[#f8faf9] rounded-xl p-6 text-center border border-dashed border-[#1a3a32]/20">
            <div className="text-[#1a3a32]/40 mb-2">
              <I.Documents />
            </div>
            <p className="text-gray-500 font-medium">Финансы — загрузите данные в <span className="font-mono text-[#c9a227] bg-amber-50 px-2 py-0.5 rounded">/data/pnl/</span></p>
            <p className="text-sm text-gray-400 mt-1">Отчёты P&amp;L, задолженности и платежи появятся здесь</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#f0f7f4] rounded-xl">
              <I.Bell />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Последние события</h2>
          </div>
          {latestActivity.length > 0 ? (
            <div className="space-y-3">
              {latestActivity.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] transition-colors cursor-pointer"
                  onClick={() => {
                    const student = students.find(s => s.id === entry.studentId);
                    if (student) { onSetSelected(student); onSetModal('studentDetail'); }
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(entry.studentName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-gray-800 truncate">{entry.studentName}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(entry.date)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Нет активности</p>
          )}
        </div>

        {/* Staff overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#f0f7f4] rounded-xl">
              <I.Users />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Сотрудники</h2>
          </div>
          {teachers.length > 0 ? (
            <div className="space-y-2">
              {teachers.map(t => {
                const roleInfo = ROLES[t.role] || {};
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] transition-colors cursor-pointer"
                    onClick={() => { onSetSelected(t); onSetModal('teacherDetail'); }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a8851e] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getInitials(t.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{t.name}</div>
                      <div className="text-xs text-gray-400">{roleInfo.name || t.role || 'Сотрудник'}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {t.hoursWorked != null && (
                        <div className="text-sm font-semibold text-[#1a3a32]">{t.hoursWorked} ч.</div>
                      )}
                      {t.hourlyRate != null && (
                        <div className="text-xs text-gray-400">{t.hourlyRate?.toLocaleString('ru-RU')} тг/ч</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Нет сотрудников</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => { onSetForm({}); onSetModal('addStudent'); }}
            className="flex items-center gap-2 p-4 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] text-left font-medium text-sm transition-all card-hover border border-transparent hover:border-[#1a3a32]/10"
          >
            <span className="text-[#1a3a32]"><I.Plus /></span>
            Студент
          </button>
          <button
            onClick={() => { onSetForm({}); onSetModal('addTeacher'); }}
            className="flex items-center gap-2 p-4 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] text-left font-medium text-sm transition-all card-hover border border-transparent hover:border-[#1a3a32]/10"
          >
            <span className="text-[#c9a227]"><I.Users /></span>
            Сотрудник
          </button>
          <button
            onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
            className="flex items-center gap-2 p-4 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] text-left font-medium text-sm transition-all card-hover border border-transparent hover:border-[#1a3a32]/10"
          >
            <span className="text-blue-500"><I.Calendar /></span>
            Расписание
          </button>
          <button
            onClick={() => { onSetForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); onSetModal('addMockTest'); }}
            className="flex items-center gap-2 p-4 bg-[#f8faf9] rounded-xl hover:bg-[#f0f7f4] text-left font-medium text-sm transition-all card-hover border border-transparent hover:border-[#1a3a32]/10"
          >
            <span className="text-purple-500"><I.MockTest /></span>
            Пробный тест
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;
