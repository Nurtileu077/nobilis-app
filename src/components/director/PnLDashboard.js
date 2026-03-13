import React, { useState } from 'react';
import I from '../common/Icons';

let PNL_DATA = null;
let EXPENSES_DETAIL = null;
try {
  const pnlModule = require('../../data/pnlData');
  PNL_DATA = pnlModule.PNL_DATA;
  EXPENSES_DETAIL = pnlModule.EXPENSES_DETAIL;
} catch (e) { /* data not yet imported */ }

const fmt = (n) => n ? Math.round(n).toLocaleString('ru-RU') : '0';
const fmtM = (n) => n ? (n / 1000000).toFixed(1) + 'M' : '0';

const PnLDashboard = () => {
  const months = PNL_DATA?.months || [];
  const [selectedMonth, setSelectedMonth] = useState(months.length - 1);
  const [showExpenses, setShowExpenses] = useState(false);

  if (!PNL_DATA) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">P&L — Доходы и расходы</h1>
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-500 mb-2">Данные загружаются...</p>
          <p className="text-sm text-gray-400">Файлы из /data/pnl/ обрабатываются</p>
        </div>
      </div>
    );
  }

  const i = selectedMonth;
  const revenue = PNL_DATA.revenue?.[i] || 0;
  const expenses = PNL_DATA.totalExpenses?.[i] || 0;
  const profit = revenue - expenses;
  const plan = PNL_DATA.plan?.[i] || 0;
  const payroll = PNL_DATA.payroll?.[i] || 0;
  const planPct = plan > 0 ? Math.round((revenue / plan) * 100) : 0;

  // Cumulative totals
  const totalRevenue = PNL_DATA.revenue?.slice(0, i + 1).reduce((s, v) => s + v, 0) || 0;
  const totalExpenses = PNL_DATA.totalExpenses?.slice(0, i + 1).reduce((s, v) => s + v, 0) || 0;
  const totalProfit = totalRevenue - totalExpenses;

  // Find max for chart scaling
  const maxVal = Math.max(...(PNL_DATA.revenue || []), ...(PNL_DATA.totalExpenses || []), ...(PNL_DATA.plan || []));

  // Expenses for selected month
  const monthName = months[i];
  const monthExpenses = (EXPENSES_DETAIL || []).filter(e => e.month === monthName);
  const topExpenses = {};
  monthExpenses.forEach(e => {
    const cat = e.category || e.purpose;
    topExpenses[cat] = (topExpenses[cat] || 0) + e.amount;
  });
  const sortedExpenses = Object.entries(topExpenses).sort((a, b) => b[1] - a[1]).slice(0, 15);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">P&L — {monthName}</h1>
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          className="px-4 py-2 border rounded-xl bg-white text-sm font-medium">
          {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-5 text-white">
          <div className="text-sm text-white/70">Выручка</div>
          <div className="text-2xl font-bold mt-1">{fmt(revenue)} тг</div>
          <div className="text-xs text-white/50 mt-1">План: {fmt(plan)} тг ({planPct}%)</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500">Расходы</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{fmt(expenses)} тг</div>
          <div className="text-xs text-gray-400 mt-1">ЗП: {fmt(payroll)} тг</div>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm border ${profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-sm text-gray-500">Прибыль</div>
          <div className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}{fmt(profit)} тг
          </div>
          <div className="text-xs text-gray-400 mt-1">Маржа: {revenue > 0 ? Math.round((profit / revenue) * 100) : 0}%</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500">Выполнение плана</div>
          <div className="text-2xl font-bold text-[#c9a227] mt-1">{planPct}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-[#c9a227] h-2 rounded-full transition-all" style={{ width: `${Math.min(planPct, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses chart */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Выручка vs Расходы по месяцам</h3>
        <div className="flex items-end gap-1 h-56 overflow-x-auto pb-2">
          {months.map((m, idx) => {
            const rev = PNL_DATA.revenue?.[idx] || 0;
            const exp = PNL_DATA.totalExpenses?.[idx] || 0;
            const revH = maxVal > 0 ? (rev / maxVal) * 100 : 0;
            const expH = maxVal > 0 ? (exp / maxVal) * 100 : 0;
            const isSelected = idx === selectedMonth;
            return (
              <div key={m} className={`flex-1 min-w-[40px] flex flex-col items-center gap-0.5 cursor-pointer rounded-lg p-1 ${isSelected ? 'bg-gray-100' : ''}`}
                onClick={() => setSelectedMonth(idx)}>
                <div className="flex gap-0.5 items-end flex-1 w-full">
                  <div className="flex-1 rounded-t transition-all" style={{ height: `${revH}%`, backgroundColor: '#1a3a32', minHeight: '2px' }} />
                  <div className="flex-1 rounded-t transition-all" style={{ height: `${expH}%`, backgroundColor: '#ef4444', minHeight: '2px' }} />
                </div>
                <div className={`text-[10px] ${isSelected ? 'text-[#1a3a32] font-bold' : 'text-gray-400'}`}>
                  {m.split(' ')[0].slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-6 mt-3 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#1a3a32]" /> Выручка</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /> Расходы</div>
        </div>
      </div>

      {/* Cumulative totals */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h3 className="text-sm text-white/60 mb-3">Накопительный итог (Июнь 2024 — {monthName})</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-white/50">Общая выручка</div>
            <div className="text-xl font-bold">{fmtM(totalRevenue)} тг</div>
          </div>
          <div>
            <div className="text-sm text-white/50">Общие расходы</div>
            <div className="text-xl font-bold text-red-400">{fmtM(totalExpenses)} тг</div>
          </div>
          <div>
            <div className="text-sm text-white/50">Общая прибыль</div>
            <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}{fmtM(totalProfit)} тг
            </div>
          </div>
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <button onClick={() => setShowExpenses(!showExpenses)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="font-semibold text-gray-800">Расходы за {monthName} ({monthExpenses.length} записей)</span>
          <span className={`transition-transform inline-block ${showExpenses ? 'rotate-180' : ''}`}><I.ChevronDown /></span>
        </button>
        {showExpenses && (
          <div className="border-t">
            {sortedExpenses.length > 0 ? (
              <div className="divide-y">
                {sortedExpenses.map(([cat, amount]) => (
                  <div key={cat} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-700">{cat}</span>
                    <span className="font-medium text-sm">{fmt(amount)} тг</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center text-gray-400 text-sm">Нет данных по расходам за этот месяц</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PnLDashboard;
