import React, { useState, useRef, useEffect } from 'react';
import I from '../common/Icons';
import { useSheets } from '../../context/GoogleSheetsContext';

let STATIC_PNL_DATA = null;
let STATIC_EXPENSES_DETAIL = null;
let STATIC_EXPENSE_CATEGORIES = null;
let STATIC_COMPANY_DEBTS = null;
try {
  const pnlModule = require('../../data/pnlData');
  STATIC_PNL_DATA = pnlModule.PNL_DATA;
  STATIC_EXPENSES_DETAIL = pnlModule.EXPENSES_DETAIL;
  STATIC_EXPENSE_CATEGORIES = pnlModule.EXPENSE_CATEGORIES;
} catch (e) {}
try {
  const salaryModule = require('../../data/salaryData');
  STATIC_COMPANY_DEBTS = salaryModule.COMPANY_DEBTS;
} catch (e) {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(2) + ' млн';
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(0) + ' тыс';
  return String(Math.round(n));
};

const fmtFull = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('ru-RU').format(Math.round(n));
};

const pct = (a, b) => (b && b !== 0 ? ((a / b) * 100).toFixed(1) : '0.0');

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const LS_KEY = 'pnl_dashboard_tableData';
const TX_KEY = 'pnl_dashboard_transactions';

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK = {
  months: ['Янв 2025', 'Фев 2025', 'Мар 2025'],
  plan: [30000000, 30000000, 30000000],
  revenue: [17271000, 10081000, 8285000],
  totalExpenses: [13281302, 11128493, 9404962],
  fixedExpenses: [10537500, 9959925, 8911410],
  payroll: [6315000, 5741500, 5116750],
  profit: [3989697, -1047493, -1119962],
};

// ─── Build expense categories for a given month ──────────────────────────────

function getExpenseCategoriesForMonth(monthName, expensesDetail, expenseCategories) {
  // First try EXPENSES_DETAIL (has individual transactions)
  const details = expensesDetail
    ? expensesDetail.filter((e) => e.month === monthName)
    : [];

  if (details.length > 0) {
    const byCategory = details.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    const catList = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0);
    return { catList, details, source: 'detail' };
  }

  // Fallback to EXPENSE_CATEGORIES (aggregated by month)
  if (expenseCategories) {
    const monthIdx = expenseCategories.months.indexOf(monthName);
    if (monthIdx !== -1 && expenseCategories.amounts[monthIdx]) {
      const row = expenseCategories.amounts[monthIdx];
      const cats = expenseCategories.categories;
      const catList = cats
        .map((cat, ci) => [cat, row[ci] || 0])
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);
      return { catList, details: [], source: 'categories' };
    }
  }

  return { catList: [], details: [], source: 'none' };
}

// ─── Excel export (HTML table approach) ──────────────────────────────────────

function exportExcel(rows, fileName) {
  const KEYS = [
    { key: 'revenue', label: 'Выручка' },
    { key: 'plan', label: 'План' },
    { key: 'payroll', label: 'Зарплата' },
    { key: 'directExpenses', label: 'Прямые расходы' },
    { key: 'totalExpenses', label: 'Итого расходов' },
    { key: 'profit', label: 'Чистая прибыль' },
  ];

  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>PnL</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
  html += '<body><table border="1">';

  // Header row
  html += '<tr><th>Показатель</th>';
  rows.forEach((r) => { html += '<th>' + r.month + '</th>'; });
  html += '</tr>';

  // Data rows
  KEYS.forEach((k) => {
    html += '<tr><td>' + k.label + '</td>';
    rows.forEach((r) => {
      html += '<td style="mso-number-format:\'\\#\\,\\#\\#0\'">' + Math.round(r[k.key] ?? 0) + '</td>';
    });
    html += '</tr>';
  });

  html += '</table></body></html>';

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
export default function PnLDashboard({ onUpdateData } = {}) {
  const sheets = useSheets();
  const PNL_DATA = sheets?.pnlData || STATIC_PNL_DATA;
  const EXPENSES_DETAIL = sheets?.expensesDetail || STATIC_EXPENSES_DETAIL;
  const EXPENSE_CATEGORIES = sheets?.expenseCategories || STATIC_EXPENSE_CATEGORIES;
  const COMPANY_DEBTS = sheets?.companyDebts || STATIC_COMPANY_DEBTS;
  const raw = PNL_DATA || FALLBACK;

  // Build a clean row array for each month
  const derived = raw.months.map((_, i) => {
    const revenue = raw.revenue[i] ?? 0;
    const plan = raw.plan[i] ?? 0;
    const totalExpenses = raw.totalExpenses[i] ?? 0;
    const payroll = raw.payroll[i] ?? 0;
    const directExpenses = totalExpenses - payroll;
    const indirectExpenses = (raw.fixedExpenses?.[i] ?? 0) - payroll;
    const profit = raw.profit?.[i] ?? revenue - totalExpenses;
    return { month: raw.months[i], plan, revenue, totalExpenses, payroll, directExpenses, indirectExpenses, profit };
  });

  // ── State ─────────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState(() => {
    // Try loading from localStorage first
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate structure: must be array with same length
        if (Array.isArray(parsed) && parsed.length === derived.length) {
          return parsed;
        }
      }
    } catch (e) {}
    return derived.map((d) => ({ ...d }));
  });
  const [editedCells, setEditedCells] = useState(() => {
    // Detect which cells differ from derived data (were previously edited)
    const cells = {};
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === derived.length) {
          const editableKeys = ['revenue', 'plan', 'payroll', 'totalExpenses', 'directExpenses', 'profit'];
          parsed.forEach((row, i) => {
            editableKeys.forEach((key) => {
              if (row[key] !== derived[i][key]) {
                cells[`${key}-${i}`] = true;
              }
            });
          });
        }
      }
    } catch (e) {}
    return cells;
  });
  const [editingCell, setEditingCell] = useState(null); // { rowKey, colIdx }
  const [editValue, setEditValue] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    Math.max(0, derived.findIndex((d) => {
      const n = (d.month || '').toLowerCase();
      return n.includes('март') && n.includes('2026');
    }))
  );
  const [compareMonths, setCompareMonths] = useState([
    Math.max(0, derived.length - 2),
    Math.max(0, derived.length - 1),
  ]);
  const [expenseOpen, setExpenseOpen] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TX_KEY) || '[]'); } catch { return []; }
  });
  const [showTxForm, setShowTxForm] = useState(false);
  const [txForm, setTxForm] = useState({ type: 'revenue', amount: '', desc: '', sign: '+' });
  const [showTxLog, setShowTxLog] = useState(false);
  const inputRef = useRef(null);

  // Persist transactions
  useEffect(() => {
    try { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  const addTransaction = () => {
    const amount = parseFloat(txForm.amount.replace(/\s/g, '').replace(',', '.'));
    if (!amount || isNaN(amount)) return;
    const monthName = tableData[selectedMonth]?.month;
    if (!monthName) return;
    const entry = {
      id: Date.now(),
      month: monthName,
      monthIdx: selectedMonth,
      type: txForm.type,
      sign: txForm.sign,
      amount: txForm.sign === '-' ? -Math.abs(amount) : Math.abs(amount),
      desc: txForm.desc || (txForm.sign === '+' ? 'Поступление' : 'Списание'),
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions(prev => [entry, ...prev]);
    // Apply to table data
    setTableData(prev => prev.map((row, i) => {
      if (i !== selectedMonth) return row;
      const updated = { ...row };
      updated[txForm.type] = (updated[txForm.type] || 0) + entry.amount;
      if (txForm.type !== 'profit') {
        updated.profit = updated.revenue - updated.totalExpenses;
      }
      return updated;
    }));
    setEditedCells(prev => ({ ...prev, [`${txForm.type}-${selectedMonth}`]: true }));
    setTxForm({ type: 'revenue', amount: '', desc: '', sign: '+' });
    setShowTxForm(false);
  };

  const deleteTx = (txId) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    setTransactions(prev => prev.filter(t => t.id !== txId));
    // Revert from table data
    setTableData(prev => prev.map((row, i) => {
      if (i !== tx.monthIdx) return row;
      const updated = { ...row };
      updated[tx.type] = (updated[tx.type] || 0) - tx.amount;
      if (tx.type !== 'profit') {
        updated.profit = updated.revenue - updated.totalExpenses;
      }
      return updated;
    }));
  };

  const monthTxs = transactions.filter(t => t.month === tableData[selectedMonth]?.month);

  const months = tableData.map((d) => d.month);

  // ── Persist edits to localStorage on each change ───────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tableData));
    } catch (e) {}
  }, [tableData]);

  // ── Cell editing ──────────────────────────────────────────────────────────
  const handleCellDoubleClick = (rowKey, colIdx) => {
    const val = tableData[colIdx][rowKey];
    setEditingCell({ rowKey, colIdx });
    setEditValue(String(Math.round(val ?? 0)));
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { rowKey, colIdx } = editingCell;
    const num = parseFloat(editValue.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(num)) {
      setTableData((prev) =>
        prev.map((row, i) => {
          if (i !== colIdx) return row;
          const updated = { ...row, [rowKey]: num };
          // Auto-calc directExpenses only if not manually edited
          if (rowKey !== 'directExpenses' && !editedCells[`directExpenses-${colIdx}`]) {
            updated.directExpenses = updated.totalExpenses - updated.payroll;
          }
          // Auto-calc profit only if not manually edited
          if (rowKey !== 'profit' && !editedCells[`profit-${colIdx}`]) {
            updated.profit = updated.revenue - updated.totalExpenses;
          }
          return updated;
        })
      );
      setEditedCells((prev) => ({ ...prev, [`${rowKey}-${colIdx}`]: true }));
    }
    setEditingCell(null);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(tableData));
    } catch (e) {}
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  // ── Export Excel ────────────────────────────────────────────────────────
  const handleExport = (onlySelected) => {
    const rows = onlySelected ? [tableData[selectedMonth]] : tableData;
    const fileName = onlySelected
      ? `PnL_${tableData[selectedMonth].month}.xls`
      : 'PnL_All.xls';
    exportExcel(rows, fileName);
  };

  // ── Expense detail for selected month ─────────────────────────────────────
  const { catList: expenseCatList, details: expenseDetails, source: expenseSource } =
    getExpenseCategoriesForMonth(months[selectedMonth], EXPENSES_DETAIL, EXPENSE_CATEGORIES);
  const expenseCatTotal = expenseCatList.reduce((s, [, v]) => s + v, 0);

  // ── Chart scale ───────────────────────────────────────────────────────────
  const maxRevExp = Math.max(...tableData.map((d) => Math.max(d.revenue, d.totalExpenses)), 1);
  const maxProfitAbs = Math.max(...tableData.map((d) => Math.abs(d.profit)), 1);

  // Running cumulative
  let running = 0;
  const runningArr = tableData.map((d) => { running += d.profit; return running; });
  const maxRunning = Math.max(...runningArr.map(Math.abs), 1);

  // ── Cumulative totals ──────────────────────────────────────────────────────
  const cumRevenue = tableData.reduce((s, d) => s + d.revenue, 0);
  const cumExpenses = tableData.reduce((s, d) => s + d.totalExpenses, 0);
  const cumProfit = tableData.reduce((s, d) => s + d.profit, 0);
  const avgMonthlyProfit = cumProfit / (tableData.length || 1);

  // ── Selected month ────────────────────────────────────────────────────────
  const sel = tableData[selectedMonth] || tableData[0];
  const planPct = Number(pct(sel.revenue, sel.plan));
  const margin = Number(pct(sel.profit, sel.revenue));

  // ── Table rows config ─────────────────────────────────────────────────────
  const TABLE_ROWS = [
    { key: 'revenue',       label: 'Выручка',          editable: true,  colorClass: 'text-emerald-600' },
    { key: 'plan',          label: 'План',              editable: true,  colorClass: 'text-amber-500'   },
    { key: 'payroll',       label: 'Зарплата',          editable: true,  colorClass: 'text-rose-500'    },
    { key: 'directExpenses',label: 'Прямые расходы',    editable: true, colorClass: 'text-orange-500'  },
    { key: 'totalExpenses', label: 'Итого расходов',    editable: true,  colorClass: 'text-red-600'     },
    { key: 'profit',        label: 'Чистая прибыль',    editable: true, colorClass: ''                 },
  ];

  // ── Company debts data ─────────────────────────────────────────────────────
  const debts = COMPANY_DEBTS;
  const debtsTotal = debts
    ? (debts.salaryDebts?.total || 0) +
      (debts.companyDebts?.total || 0) +
      (debts.taxes?.total || 0) +
      (debts.returnable?.total || 0)
    : 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1a3a32,#2d6a56)' }}
          >
            <I.Results className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight">
              P&L — <span style={{ color: '#1a3a32' }}>{sel.month}</span>
            </h1>
            <p className="text-xs text-gray-400">Отчёт о прибылях и убытках · Nobilis</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <I.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Export current month */}
          <button
            onClick={() => handleExport(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600"
          >
            <I.Download className="w-4 h-4" />
            <span>Месяц</span>
          </button>

          {/* Export all */}
          <button
            onClick={() => handleExport(false)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl text-white shadow-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#1a3a32,#2d6a56)' }}
          >
            <I.Download className="w-4 h-4" />
            <span>Excel (все)</span>
          </button>
        </div>
      </div>

      {/* ══ KPI CARDS ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        {/* Revenue */}
        <div
          className="rounded-2xl p-5 shadow-lg text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1a3a32 0%,#2d6a56 60%,#3a8a6a 100%)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white opacity-5" />
          <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white opacity-5" />
          <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Выручка</p>
          <p className="text-3xl font-extrabold leading-tight">{fmt(sel.revenue)}</p>
          <p className="text-xs opacity-50 mt-0.5">{fmtFull(sel.revenue)} ₸</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(201,162,39,0.3)', color: '#f5d76e' }}
            >
              {planPct}% от плана
            </span>
            <span className="text-xs opacity-50">план {fmt(sel.plan)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-2xl p-5 shadow-md bg-white border border-gray-100 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-red-50 opacity-80" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Расходы</p>
          <p className="text-3xl font-extrabold text-red-500 leading-tight">{fmt(sel.totalExpenses)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtFull(sel.totalExpenses)} ₸</p>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-red-50 rounded-xl px-2 py-1.5">
              <p className="text-gray-400 text-xs leading-tight">Зарплата</p>
              <p className="font-bold text-red-400">{fmt(sel.payroll)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl px-2 py-1.5">
              <p className="text-gray-400 text-xs leading-tight">Прочее</p>
              <p className="font-bold text-orange-400">{fmt(sel.directExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div
          className="rounded-2xl p-5 shadow-lg text-white relative overflow-hidden"
          style={{
            background: sel.profit >= 0
              ? 'linear-gradient(135deg,#14532d,#16a34a,#4ade80)'
              : 'linear-gradient(135deg,#7f1d1d,#dc2626,#f87171)',
          }}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white opacity-5" />
          <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Чистая прибыль</p>
          <p className="text-3xl font-extrabold leading-tight">{fmt(sel.profit)}</p>
          <p className="text-xs opacity-50 mt-0.5">{fmtFull(sel.profit)} ₸</p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-20 font-semibold">
              Маржа {margin}%
            </span>
            <span className="text-xs opacity-60">
              {sel.profit >= 0 ? '\u25B2 Прибыль' : '\u25BC Убыток'}
            </span>
          </div>
        </div>

        {/* Plan completion */}
        <div className="rounded-2xl p-5 shadow-md bg-white border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Выполнение плана</p>
          <p className="text-3xl font-extrabold leading-tight" style={{ color: '#c9a227' }}>
            {planPct}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">план: {fmtFull(sel.plan)} ₸</p>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${clamp(planPct, 0, 100)}%`,
                  background:
                    planPct >= 100
                      ? 'linear-gradient(90deg,#c9a227,#f5d76e)'
                      : planPct >= 60
                      ? 'linear-gradient(90deg,#d97706,#c9a227)'
                      : 'linear-gradient(90deg,#b45309,#d97706)',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ REVENUE vs EXPENSES BAR CHART ════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-gray-800 text-base">Выручка vs Расходы по месяцам</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#1a3a32' }} />
              Выручка
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />
              Расходы
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#c9a227' }} />
              Прибыль (точки)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div
            className="flex items-end gap-1.5"
            style={{ minWidth: `${tableData.length * 56}px`, height: '200px', paddingTop: '20px' }}
          >
            {tableData.map((d, i) => {
              const revH = clamp((d.revenue / maxRevExp) * 160, 2, 160);
              const expH = clamp((d.totalExpenses / maxRevExp) * 160, 2, 160);
              const isSelected = i === selectedMonth;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-pointer flex-shrink-0 group"
                  style={{ width: '52px' }}
                  onClick={() => setSelectedMonth(i)}
                  title={`${d.month} | Выручка: ${fmtFull(d.revenue)} | Расходы: ${fmtFull(d.totalExpenses)} | Прибыль: ${fmtFull(d.profit)}`}
                >
                  {/* Profit dot above bars */}
                  <div className="relative w-full flex justify-center mb-1" style={{ height: '16px' }}>
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125"
                      style={{ background: d.profit >= 0 ? '#c9a227' : '#ef4444' }}
                    />
                  </div>

                  {/* Dual bars */}
                  <div className="flex items-end gap-0.5 w-full justify-center">
                    <div
                      className="rounded-t-md transition-all duration-300"
                      style={{
                        width: '20px',
                        height: `${revH}px`,
                        background: isSelected
                          ? 'linear-gradient(180deg,#2d6a56,#1a3a32)'
                          : 'linear-gradient(180deg,#3a8a6a,#1a3a32)',
                        opacity: isSelected ? 1 : 0.65,
                        boxShadow: isSelected ? '0 0 0 2px #c9a227' : 'none',
                      }}
                    />
                    <div
                      className="rounded-t-md transition-all duration-300"
                      style={{
                        width: '20px',
                        height: `${expH}px`,
                        background: isSelected
                          ? 'linear-gradient(180deg,#f87171,#dc2626)'
                          : 'linear-gradient(180deg,#fca5a5,#ef4444)',
                        opacity: isSelected ? 1 : 0.65,
                      }}
                    />
                  </div>

                  {/* Month label */}
                  <div className="text-center mt-1.5">
                    <span
                      className="block leading-tight"
                      style={{
                        fontSize: '9px',
                        color: isSelected ? '#1a3a32' : '#9ca3af',
                        fontWeight: isSelected ? '700' : '400',
                      }}
                    >
                      {d.month.split(' ')[0].substring(0, 3)}
                    </span>
                    <span
                      className="block leading-tight"
                      style={{
                        fontSize: '8px',
                        color: isSelected ? '#2d6a56' : '#d1d5db',
                      }}
                    >
                      {d.month.split(' ')[1]?.slice(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ PROFIT TREND ═════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-gray-800 text-base">Динамика прибыли</h2>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400" />Прибыль
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-red-400" />Убыток
            </span>
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="inline-block w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#c9a227' }} />
              Накопленный итог
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div
            className="relative"
            style={{ minWidth: `${tableData.length * 56}px`, height: '150px' }}
          >
            {/* SVG running-total line */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: `${tableData.length * 56}px`, height: '140px' }}
            >
              <polyline
                fill="none"
                stroke="#c9a227"
                strokeWidth="2"
                strokeDasharray="5 3"
                points={runningArr.map((val, i) => {
                  const x = i * 56 + 26;
                  const norm = (val + maxRunning) / (2 * maxRunning);
                  const y = 130 - clamp(norm * 120, 5, 125);
                  return `${x},${y}`;
                }).join(' ')}
              />
              {runningArr.map((val, i) => {
                const x = i * 56 + 26;
                const norm = (val + maxRunning) / (2 * maxRunning);
                const y = 130 - clamp(norm * 120, 5, 125);
                return (
                  <circle
                    key={i}
                    cx={x} cy={y} r={i === selectedMonth ? 5 : 3}
                    fill="#c9a227"
                    opacity={i === selectedMonth ? 1 : 0.6}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMonth(i)}
                  />
                );
              })}
            </svg>

            {/* Zero line */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-gray-200"
              style={{ top: '65px' }}
            />

            {/* Bars */}
            <div className="flex items-center gap-1.5 h-full" style={{ paddingTop: '0px' }}>
              {tableData.map((d, i) => {
                const isPos = d.profit >= 0;
                const barH = clamp((Math.abs(d.profit) / maxProfitAbs) * 60, 2, 60);
                const isSelected = i === selectedMonth;

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center cursor-pointer flex-shrink-0"
                    style={{ width: '52px', height: '140px', justifyContent: 'center' }}
                    onClick={() => setSelectedMonth(i)}
                    title={`${d.month}: ${fmtFull(d.profit)} ₸`}
                  >
                    {isPos ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '70px', justifyContent: 'flex-end' }}>
                        <div
                          style={{
                            width: '28px',
                            height: `${barH}px`,
                            borderRadius: '4px 4px 0 0',
                            background: isSelected
                              ? 'linear-gradient(180deg,#22c55e,#15803d)'
                              : 'linear-gradient(180deg,#86efac,#22c55e)',
                            opacity: isSelected ? 1 : 0.75,
                            boxShadow: isSelected ? '0 0 0 2px #c9a227' : 'none',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '70px', justifyContent: 'flex-start', marginTop: '0px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: `${barH}px`,
                            borderRadius: '0 0 4px 4px',
                            background: isSelected
                              ? 'linear-gradient(180deg,#dc2626,#7f1d1d)'
                              : 'linear-gradient(180deg,#f87171,#fca5a5)',
                            opacity: isSelected ? 1 : 0.75,
                            boxShadow: isSelected ? '0 0 0 2px #c9a227' : 'none',
                          }}
                        />
                      </div>
                    )}
                    <div className="text-center mt-1">
                      <span style={{ fontSize: '9px', color: isSelected ? '#1a3a32' : '#9ca3af', fontWeight: isSelected ? '700' : '400' }}>
                        {d.month.split(' ')[0].substring(0, 3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ EDITABLE DATA TABLE ══════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Данные P&L</h2>
            <p className="text-xs text-gray-400 mt-0.5">Двойной клик по ячейке для редактирования</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {Object.keys(editedCells).length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-xl"
                style={{ background: 'rgba(201,162,39,0.1)', color: '#b45309' }}>
                Изменено: {Object.keys(editedCells).length} ячеек
              </span>
            )}
            {savedNotice && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600">
                Сохранено ✓
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#1a3a32,#2d6a56)' }}
            >
              <I.Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: `${tableData.length * 110 + 160}px` }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="sticky left-0 z-10 bg-gray-50 text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ minWidth: '150px' }}>
                  Показатель
                </th>
                {tableData.map((d, i) => (
                  <th
                    key={i}
                    className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide cursor-pointer select-none transition-colors"
                    style={{
                      color: i === selectedMonth ? '#1a3a32' : '#9ca3af',
                      background: i === selectedMonth ? '#f0fdf4' : undefined,
                      minWidth: '105px',
                    }}
                    onClick={() => setSelectedMonth(i)}
                  >
                    {d.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row) => (
                <tr key={row.key} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-semibold text-gray-700 text-xs whitespace-nowrap border-r border-gray-50">
                    {row.label}
                  </td>
                  {tableData.map((d, i) => {
                    const cellKey = `${row.key}-${i}`;
                    const isEditing = editingCell?.rowKey === row.key && editingCell?.colIdx === i;
                    const isEdited = !!editedCells[cellKey];
                    const val = d[row.key];
                    const isProfit = row.key === 'profit';
                    const colorClass = isProfit
                      ? (val >= 0 ? 'text-emerald-600' : 'text-red-500')
                      : row.colorClass;
                    const isSelected = i === selectedMonth;

                    return (
                      <td
                        key={i}
                        className={`px-2 py-2.5 text-right text-xs transition-all ${
                          row.editable ? 'cursor-pointer hover:bg-yellow-50' : ''
                        } ${isSelected ? 'bg-green-50' : ''}`}
                        style={{
                          outline: isEdited ? '2px solid #c9a227' : undefined,
                          outlineOffset: '-2px',
                          borderRadius: isEdited ? '4px' : undefined,
                        }}
                        onDoubleClick={() => row.editable && handleCellDoubleClick(row.key, i)}
                        title={row.editable ? 'Двойной клик для редактирования' : undefined}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            className="w-full text-right text-xs border border-amber-400 bg-amber-50 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-amber-400"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span className={`font-mono ${colorClass || 'text-gray-700'} ${isProfit ? 'font-bold' : 'font-medium'}`}>
                            {fmtFull(val)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ EXPENSE BREAKDOWN ════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors rounded-t-2xl"
          onClick={() => setExpenseOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-800 text-base">Статьи расходов</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#f0fdf4', color: '#1a3a32' }}
            >
              {sel.month}
            </span>
            {expenseSource === 'categories' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
                По категориям
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xs">{expenseCatList.length} категорий</span>
            {expenseOpen ? <I.ChevronDown /> : <I.ChevronRight />}
          </div>
        </button>

        {expenseOpen && (
          <div className="p-5 border-t border-gray-100">
            {expenseCatList.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <I.Documents className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Нет детальных данных расходов за этот месяц</p>
              </div>
            ) : (
              <>
                {/* Horizontal bar chart */}
                <div className="space-y-2.5 mb-6">
                  {expenseCatList.map(([cat, amount]) => {
                    const catPct = expenseCatTotal > 0 ? (amount / expenseCatTotal) * 100 : 0;
                    const colors = [
                      'from-red-400 to-red-500',
                      'from-orange-400 to-orange-500',
                      'from-rose-400 to-rose-500',
                      'from-pink-400 to-pink-500',
                      'from-amber-400 to-amber-500',
                    ];
                    const colorIdx = Math.abs(cat.charCodeAt(0)) % colors.length;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-sm text-gray-700 truncate flex-1 max-w-xs">{cat}</span>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-gray-400 tabular-nums">{catPct.toFixed(1)}%</span>
                            <span className="text-sm font-bold text-red-500 font-mono tabular-nums">
                              {fmtFull(amount)} ₸
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${colors[colorIdx]} transition-all duration-500`}
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Transactions table (only when we have detailed data) */}
                {expenseDetails.length > 0 && (
                  <>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Все операции ({expenseDetails.length})
                    </h3>
                    <div className="overflow-y-auto max-h-72 rounded-xl border border-gray-100">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">Дата</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">Категория</th>
                            <th className="text-left px-3 py-2 text-gray-500 font-semibold">Назначение</th>
                            <th className="text-right px-3 py-2 text-gray-500 font-semibold">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseDetails.map((e, idx) => (
                            <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">{e.date}</td>
                              <td className="px-3 py-1.5 text-gray-600">{e.category}</td>
                              <td className="px-3 py-1.5 text-gray-500 max-w-xs truncate">{e.purpose}</td>
                              <td className="px-3 py-1.5 text-right font-mono font-bold text-red-500 tabular-nums whitespace-nowrap">
                                {fmtFull(e.amount)} ₸
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ══ TRANSACTION LOG ══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800 text-base">Операции</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#f0fdf4', color: '#1a3a32' }}>
              {sel.month}
            </span>
            {monthTxs.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                {monthTxs.length} записей
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTxLog(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600"
            >
              <I.Menu className="w-4 h-4" />
              <span>Лог</span>
            </button>
            <button
              onClick={() => setShowTxForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#1a3a32,#2d6a56)' }}
            >
              <I.Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Add transaction form */}
        {showTxForm && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Категория</label>
                <select
                  value={txForm.type}
                  onChange={e => setTxForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="revenue">Выручка</option>
                  <option value="plan">План</option>
                  <option value="payroll">Зарплата</option>
                  <option value="totalExpenses">Расходы</option>
                  <option value="directExpenses">Прямые расходы</option>
                </select>
              </div>
              {/* Sign */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Тип</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTxForm(p => ({ ...p, sign: '+' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-xl font-bold transition-colors ${
                      txForm.sign === '+' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    + Добавить
                  </button>
                  <button
                    onClick={() => setTxForm(p => ({ ...p, sign: '-' }))}
                    className={`flex-1 px-3 py-2 text-sm rounded-xl font-bold transition-colors ${
                      txForm.sign === '-' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    − Минус
                  </button>
                </div>
              </div>
              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Сумма (₸)</label>
                <input
                  type="text"
                  value={txForm.amount}
                  onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="500 000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nobilis-green/20"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Описание</label>
                <input
                  type="text"
                  value={txForm.desc}
                  onChange={e => setTxForm(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Комментарий к операции"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nobilis-green/20"
                />
              </div>
              {/* Submit */}
              <div>
                <button
                  onClick={addTransaction}
                  disabled={!txForm.amount}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: txForm.sign === '+' ? 'linear-gradient(135deg,#14532d,#16a34a)' : 'linear-gradient(135deg,#7f1d1d,#dc2626)' }}
                >
                  {txForm.sign === '+' ? 'Добавить ↑' : 'Вычесть ↓'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction log */}
        {showTxLog && (
          <div className="p-5">
            {monthTxs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Нет записей за {sel.month}</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-72 rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-500 font-semibold">Дата</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-semibold">Категория</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-semibold">Описание</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-semibold">Сумма</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthTxs.map(tx => {
                      const typeLabels = { revenue: 'Выручка', plan: 'План', payroll: 'Зарплата', totalExpenses: 'Расходы', directExpenses: 'Прямые расходы' };
                      return (
                        <tr key={tx.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">{tx.date}</td>
                          <td className="px-3 py-1.5 text-gray-600">{typeLabels[tx.type] || tx.type}</td>
                          <td className="px-3 py-1.5 text-gray-500 max-w-xs truncate">{tx.desc}</td>
                          <td className={`px-3 py-1.5 text-right font-mono font-bold tabular-nums whitespace-nowrap ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {tx.amount >= 0 ? '+' : ''}{fmtFull(tx.amount)} ₸
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <button
                              onClick={() => deleteTx(tx.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                              title="Удалить"
                            >
                              <I.Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ MONTHLY COMPARISON ═══════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-800 text-base mb-4">Сравнение месяцев</h2>

        <div className="flex flex-wrap gap-4 mb-5">
          {[0, 1].map((slot) => (
            <div key={slot} className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{
                  background: slot === 0 ? '#f0fdf4' : '#eff6ff',
                  color: slot === 0 ? '#1a3a32' : '#1d4ed8',
                }}
              >
                {slot === 0 ? 'A' : 'B'}
              </span>
              <div className="relative">
                <select
                  value={compareMonths[slot]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setCompareMonths((prev) => slot === 0 ? [v, prev[1]] : [prev[0], v]);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <I.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 text-xs text-gray-500 font-semibold pr-4">Показатель</th>
                <th className="text-right py-2.5 text-xs font-bold pr-4" style={{ color: '#1a3a32' }}>
                  {tableData[compareMonths[0]]?.month}
                </th>
                <th className="text-right py-2.5 text-xs font-bold text-blue-600 pr-4">
                  {tableData[compareMonths[1]]?.month}
                </th>
                <th className="text-right py-2.5 text-xs text-gray-500 font-semibold">{'\u0394'} изменение</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row) => {
                const a = tableData[compareMonths[0]]?.[row.key] ?? 0;
                const b = tableData[compareMonths[1]]?.[row.key] ?? 0;
                const diff = b - a;
                const diffPctVal = a !== 0 ? ((diff / Math.abs(a)) * 100).toFixed(1) : null;
                const isUp = diff > 0;
                // For profit/revenue: up = good; for expenses: up = bad
                const isGood = (row.key === 'profit' || row.key === 'revenue') ? isUp : !isUp;

                return (
                  <tr key={row.key} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-gray-600 text-xs font-semibold pr-4">{row.label}</td>
                    <td className="py-3 text-right font-mono text-xs font-bold pr-4" style={{ color: '#1a3a32' }}>
                      {fmtFull(a)}
                    </td>
                    <td className="py-3 text-right font-mono text-xs font-bold text-blue-600 pr-4">
                      {fmtFull(b)}
                    </td>
                    <td className="py-3 text-right">
                      {diff !== 0 ? (
                        <span
                          className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{
                            background: isGood ? '#f0fdf4' : '#fef2f2',
                            color: isGood ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {isUp ? '\u25B2' : '\u25BC'}
                          {diffPctVal !== null ? `${diffPctVal}%` : '—'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ CUMULATIVE TOTALS ════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-6 shadow-xl mb-6"
        style={{ background: 'linear-gradient(135deg,#0f2219 0%,#1a3a32 40%,#2d6a56 80%,#3a8a6a 100%)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-white bg-opacity-10 flex items-center justify-center">
            <I.Money className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base">Накопленные итоги</h2>
            <p className="text-xs opacity-50 text-white">{tableData.length} месяцев данных</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Итого выручка', value: cumRevenue, color: 'text-white' },
            { label: 'Итого расходы', value: cumExpenses, color: 'text-red-300' },
            {
              label: 'Итого прибыль',
              value: cumProfit,
              color: cumProfit >= 0 ? 'text-emerald-300' : 'text-red-300',
            },
            {
              label: 'Ср. прибыль/мес',
              value: avgMonthlyProfit,
              color: avgMonthlyProfit >= 0 ? 'text-amber-300' : 'text-red-300',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-xs opacity-60 text-white uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-xl font-extrabold ${color}`}>{fmt(value)}</p>
              <p className="text-xs opacity-40 text-white mt-0.5">{fmtFull(value)} ₸</p>
            </div>
          ))}
        </div>

        {/* Summary progress bar */}
        <div>
          <div className="flex justify-between text-xs text-white opacity-50 mb-1.5">
            <span>Расходы: {pct(cumExpenses, cumRevenue)}% от выручки</span>
            <span>Маржинальность: {pct(cumProfit, cumRevenue)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-10 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${clamp(Math.max(0, Number(pct(cumRevenue - cumExpenses, cumRevenue))), 0, 100)}%`,
                background: 'linear-gradient(90deg,#c9a227,#f5d76e)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ══ COMPANY DEBTS ════════════════════════════════════════════════════ */}
      {debts && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)' }}
            >
              <I.Money className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base">Долги компании</h2>
              <p className="text-xs text-gray-400">по состоянию на {debts.asOf}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {/* Salary debts */}
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">Долги по ЗП</p>
              <p className="text-2xl font-extrabold text-red-600">{fmt(debts.salaryDebts?.total || 0)}</p>
              <p className="text-xs text-red-400 mt-0.5">{fmtFull(debts.salaryDebts?.total || 0)} ₸</p>
            </div>

            {/* Company debts */}
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-1">Долги компании</p>
              <p className="text-2xl font-extrabold text-orange-600">{fmt(debts.companyDebts?.total || 0)}</p>
              <p className="text-xs text-orange-400 mt-0.5">{fmtFull(debts.companyDebts?.total || 0)} ₸</p>
            </div>

            {/* Taxes */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1">Налоги</p>
              <p className="text-2xl font-extrabold text-rose-600">{fmt(debts.taxes?.total || 0)}</p>
              <p className="text-xs text-rose-400 mt-0.5">{fmtFull(debts.taxes?.total || 0)} ₸</p>
            </div>

            {/* Returnables */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">Возвратные</p>
              <p className="text-2xl font-extrabold text-amber-600">{fmt(debts.returnable?.total || 0)}</p>
              <p className="text-xs text-amber-500 mt-0.5">{fmtFull(debts.returnable?.total || 0)} ₸</p>
            </div>
          </div>

          {/* Breakdown details */}
          {debts.companyDebts?.breakdown && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Расшифровка долгов компании</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(debts.companyDebts.breakdown).map(([name, amount]) => (
                      <tr key={name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-gray-600">{name}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-orange-500 tabular-nums whitespace-nowrap">
                          {fmtFull(amount)} ₸
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {debts.returnable?.breakdown && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Расшифровка возвратных</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(debts.returnable.breakdown).map(([name, amount]) => (
                      <tr key={name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-gray-600">{name}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-amber-500 tabular-nums whitespace-nowrap">
                          {fmtFull(amount)} ₸
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)' }}
          >
            <span className="text-sm font-bold text-white uppercase tracking-wide">Итого долгов</span>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-white">{fmt(debtsTotal)}</p>
              <p className="text-xs text-red-200">{fmtFull(debtsTotal)} ₸</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
