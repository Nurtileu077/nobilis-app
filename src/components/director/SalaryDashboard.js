import React, { useState } from 'react';
import I from '../common/Icons';

// Will be populated from parsed Excel data
let SALARY_DATA = null;
let SALES_DATA = null;
try {
  const salaryModule = require('../../data/salaryData');
  SALARY_DATA = salaryModule.SALARY_DATA;
  SALES_DATA = salaryModule.SALES_DATA;
} catch (e) { /* data not yet imported */ }

const ROLE_LABELS = {
  director: 'Директор',
  academic_director: 'Акад. директор',
  curator: 'Куратор',
  teacher: 'Преподаватель',
  coordinator: 'Координатор',
  rop: 'РОП',
  sales_manager: 'Менеджер ОП',
  callcenter: 'Колл-центр',
  office_manager: 'Офис-менеджер',
  accountant: 'Бухгалтер',
  other: 'Другое',
};

const ROLE_COLORS = {
  director: '#1a3a32',
  academic_director: '#2d5a4a',
  curator: '#3b82f6',
  teacher: '#8b5cf6',
  coordinator: '#06b6d4',
  rop: '#f59e0b',
  sales_manager: '#ef4444',
  callcenter: '#ec4899',
  office_manager: '#6b7280',
  accountant: '#10b981',
  other: '#9ca3af',
};

const fmt = (n) => n ? Math.round(n).toLocaleString('ru-RU') : '0';

const SalaryDashboard = ({ teachers, onConfirmLesson, onUpdateTeacher }) => {
  const months = SALARY_DATA?.months || [];
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '');
  const [viewMode, setViewMode] = useState('table'); // table | chart
  const [expandedEmployee, setExpandedEmployee] = useState(null);

  // If no data yet, show placeholder
  if (!SALARY_DATA) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Зарплаты сотрудников</h1>
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 mb-2">Данные загружаются...</p>
          <p className="text-sm text-gray-400">Файлы из /data/salary/ обрабатываются</p>
        </div>
      </div>
    );
  }

  const employees = SALARY_DATA.employees || [];

  // Calculate totals for selected month
  const monthData = employees.map(emp => {
    const s = emp.salaries?.[selectedMonth] || {};
    return { ...emp, ...s };
  }).filter(e => e.base > 0);

  const totalBase = monthData.reduce((s, e) => s + (e.base || 0), 0);
  const totalBonus = monthData.reduce((s, e) => s + (e.bonus || 0), 0);
  const totalRemaining = monthData.reduce((s, e) => s + (e.remaining || 0), 0);
  const totalAdvances = monthData.reduce((s, e) => s + (e.advances || 0), 0);

  // Group by role
  const byRole = {};
  monthData.forEach(e => {
    const role = e.role || 'other';
    if (!byRole[role]) byRole[role] = [];
    byRole[role].push(e);
  });

  // Sales data for the month
  const salesMonth = SALES_DATA?.managers?.map(m => ({
    ...m,
    ...(m.sales?.[selectedMonth] || {})
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Зарплаты сотрудников</h1>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-xl bg-white text-sm font-medium">
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="flex border rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-[#1a3a32] text-white' : 'bg-white text-gray-600'}`}>
              <I.Menu />
            </button>
            <button onClick={() => setViewMode('chart')}
              className={`px-3 py-2 text-sm ${viewMode === 'chart' ? 'bg-[#1a3a32] text-white' : 'bg-white text-gray-600'}`}>
              <I.Results />
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-5 text-white">
          <div className="text-sm text-white/70">Фонд ЗП</div>
          <div className="text-2xl font-bold mt-1">{fmt(totalBase)} тг</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500">Выплачено (авансы)</div>
          <div className="text-2xl font-bold text-[#1a3a32] mt-1">{fmt(totalAdvances)} тг</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500">Премии</div>
          <div className="text-2xl font-bold text-[#c9a227] mt-1">{fmt(totalBonus)} тг</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500">Остаток к выплате</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{fmt(totalRemaining)} тг</div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        /* Chart view - salary by month */
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">ЗП по месяцам</h3>
          <div className="flex items-end gap-2 h-64">
            {months.map(m => {
              const monthTotal = employees.reduce((s, e) => s + (e.salaries?.[m]?.base || 0), 0);
              const maxTotal = Math.max(...months.map(mm => employees.reduce((s, e) => s + (e.salaries?.[mm]?.base || 0), 0)));
              const height = maxTotal > 0 ? (monthTotal / maxTotal) * 100 : 0;
              const isSelected = m === selectedMonth;
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedMonth(m)}>
                  <div className="text-xs text-gray-400 font-medium">{fmt(monthTotal / 1000)}K</div>
                  <div className="w-full rounded-t-lg transition-all duration-300"
                    style={{ height: `${height}%`, backgroundColor: isSelected ? '#1a3a32' : '#e5e7eb', minHeight: '4px' }} />
                  <div className={`text-xs ${isSelected ? 'text-[#1a3a32] font-bold' : 'text-gray-400'}`}>
                    {m.split(' ')[0].slice(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table view - employees by role */
        <div className="space-y-4">
          {Object.entries(byRole).map(([role, emps]) => (
            <div key={role} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderLeftWidth: '4px', borderLeftColor: ROLE_COLORS[role] || '#9ca3af' }}>
                <span className="font-semibold text-gray-800">{ROLE_LABELS[role] || role}</span>
                <span className="text-sm text-gray-400">({emps.length})</span>
                <span className="ml-auto text-sm font-bold text-[#1a3a32]">
                  {fmt(emps.reduce((s, e) => s + (e.base || 0), 0))} тг
                </span>
              </div>
              {emps.map(emp => (
                <div key={emp.name} className="border-b last:border-0">
                  <div className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedEmployee(expandedEmployee === emp.name ? null : emp.name)}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ background: ROLE_COLORS[role] || '#9ca3af' }}>
                      {emp.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{emp.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmt(emp.base)} тг</div>
                      {emp.bonus > 0 && <div className="text-xs text-[#c9a227]">+{fmt(emp.bonus)} премия</div>}
                    </div>
                    <span className={`transition-transform inline-block ${expandedEmployee === emp.name ? 'rotate-180' : ''}`}><I.ChevronDown /></span>
                  </div>
                  {expandedEmployee === emp.name && (
                    <div className="px-5 pb-4 bg-gray-50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="bg-white rounded-xl p-3">
                          <div className="text-xs text-gray-500">Оклад</div>
                          <div className="font-semibold">{fmt(emp.base)} тг</div>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <div className="text-xs text-gray-500">Авансы</div>
                          <div className="font-semibold">{fmt(emp.advances)} тг</div>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <div className="text-xs text-gray-500">Премия</div>
                          <div className="font-semibold text-[#c9a227]">{fmt(emp.bonus)} тг</div>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <div className="text-xs text-gray-500">Остаток</div>
                          <div className="font-semibold text-red-600">{fmt(emp.remaining)} тг</div>
                        </div>
                      </div>
                      {/* Monthly history */}
                      <div className="text-xs text-gray-500 mb-2">История по месяцам:</div>
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {months.map(m => {
                          const ms = emp.salaries?.[m];
                          if (!ms || !ms.base) return null;
                          return (
                            <div key={m} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs ${m === selectedMonth ? 'bg-[#1a3a32] text-white' : 'bg-white border'}`}>
                              <div className="font-medium">{m.split(' ')[0].slice(0, 3)}</div>
                              <div>{fmt(ms.base / 1000)}K</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Sales department */}
      {salesMonth.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderLeftWidth: '4px', borderLeftColor: '#ef4444' }}>
            <span className="font-semibold text-gray-800">Отдел продаж — {selectedMonth}</span>
          </div>
          {salesMonth.map(m => (
            <div key={m.name} className="flex items-center gap-4 px-5 py-3 border-b last:border-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-semibold">
                {m.name?.[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{m.name}</div>
                <div className="text-sm text-gray-500">{m.deals || 0} сделок</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{fmt(m.totalSales)} тг</div>
                <div className="text-xs text-[#c9a227]">KPI: {fmt(m.commission)} тг</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalaryDashboard;
