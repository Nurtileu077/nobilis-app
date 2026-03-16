import React, { useState, useCallback, useRef, useEffect } from 'react';
import I from '../common/Icons';
import { useSheets } from '../../context/GoogleSheetsContext';

let STATIC_SALARY_DATA = null;
let STATIC_SALES_DATA = null;
let STATIC_COMPANY_DEBTS = null;
try {
  const salaryModule = require('../../data/salaryData');
  STATIC_SALARY_DATA = salaryModule.SALARY_DATA;
  STATIC_SALES_DATA = salaryModule.SALES_DATA;
  STATIC_COMPANY_DEBTS = salaryModule.COMPANY_DEBTS;
} catch (e) {}

const SALARY_LS_KEY = 'nobilis_salary_edits';

// ─── Constants ────────────────────────────────────────────────────────────────

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

const DEPT_TABS = [
  { id: 'all', label: 'Все' },
  { id: 'management', label: 'Руководство', roles: ['director', 'academic_director', 'rop'] },
  { id: 'academic', label: 'Академический', roles: ['teacher', 'curator'] },
  { id: 'sales', label: 'Продажи', roles: ['sales_manager', 'callcenter'] },
  { id: 'ops', label: 'Операционный', roles: ['coordinator', 'office_manager', 'accountant', 'other'] },
];

const ROLE_ORDER = [
  'director', 'academic_director', 'rop', 'coordinator',
  'teacher', 'curator', 'sales_manager', 'callcenter',
  'office_manager', 'accountant', 'other',
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (n) => n ? Math.round(n).toLocaleString('ru-RU') : '0';
const fmtK = (n) => n ? (Math.round(n / 1000)).toLocaleString('ru-RU') + 'K' : '0';

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ name, color, size = 40 }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
    style={{ width: size, height: size, fontSize: size * 0.35, background: color || '#1a3a32' }}
  >
    {getInitials(name)}
  </div>
);

const SummaryCard = ({ label, value, sub, gradient, accent, icon: Icon }) => (
  <div
    className={`rounded-2xl p-5 relative overflow-hidden transition-transform duration-200 hover:scale-[1.02] ${
      gradient ? '' : 'bg-white shadow-sm border border-gray-100'
    }`}
    style={gradient ? { background: gradient } : {}}
  >
    {gradient && (
      <div className="absolute right-4 top-4 opacity-20">
        {Icon && <Icon />}
      </div>
    )}
    <div className={`text-sm font-medium mb-1 ${gradient ? 'text-white/70' : 'text-gray-500'}`}>
      {label}
    </div>
    <div
      className={`text-2xl font-bold tracking-tight ${gradient ? 'text-white' : ''}`}
      style={!gradient && accent ? { color: accent } : {}}
    >
      {value}
    </div>
    {sub && (
      <div className={`text-xs mt-1 ${gradient ? 'text-white/60' : 'text-gray-400'}`}>{sub}</div>
    )}
  </div>
);

const EditableCell = ({ value, onSave, edited, className = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef();

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(String(value || 0));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    const num = parseFloat(draft.replace(/\s/g, '').replace(',', '.'));
    if (!isNaN(num)) onSave(num);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
        className="w-24 px-2 py-1 rounded-lg border-2 border-nobilis-gold text-right font-semibold text-sm outline-none bg-yellow-50"
        onClick={e => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      onDoubleClick={startEdit}
      title="Двойной клик — редактировать"
      className={`cursor-pointer select-none rounded px-1 transition-all duration-150 ${
        edited ? 'ring-2 ring-nobilis-gold bg-yellow-50 rounded-md px-2' : 'hover:bg-gray-100'
      } ${className}`}
    >
      {fmt(value)} тг
    </span>
  );
};

// ─── CSS-only Bar Chart ───────────────────────────────────────────────────────

const BarChart = ({ data, selectedKey, onSelect, height = 200 }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map(({ key, label, value, shortLabel }) => {
        const pct = (value / max) * 100;
        const isSelected = key === selectedKey;
        return (
          <div
            key={key}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
            onClick={() => onSelect(key)}
          >
            <div className={`text-xs font-medium transition-colors ${isSelected ? 'text-nobilis-green' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {fmtK(value)}
            </div>
            <div className="w-full relative" style={{ height: height - 36 }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(pct, 1)}%`,
                  background: isSelected
                    ? 'linear-gradient(180deg, #2d5a4a 0%, #1a3a32 100%)'
                    : 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)',
                }}
              />
            </div>
            <div className={`text-xs text-center leading-tight transition-colors ${isSelected ? 'text-nobilis-green font-bold' : 'text-gray-400'}`}>
              {shortLabel || label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HorizBar = ({ label, value, max, color, total }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-gray-600 text-right truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="w-28 text-sm font-semibold text-gray-700 flex-shrink-0">
        {fmt(value)} тг
      </div>
      {total > 0 && (
        <div className="w-10 text-xs text-gray-400 flex-shrink-0">
          {Math.round((value / total) * 100)}%
        </div>
      )}
    </div>
  );
};

// ─── Excel / CSV Export ───────────────────────────────────────────────────────

const exportCSV = (employees, salesManagers, month) => {
  const rows = [
    ['Сотрудник', 'Должность', 'Оклад', 'Авансы', 'Премия', 'Остаток', 'Итого'],
  ];

  employees.forEach(emp => {
    const s = emp.salaries?.[month] || {};
    rows.push([
      emp.name,
      ROLE_LABELS[emp.role] || emp.role,
      s.base || 0,
      s.advances || 0,
      s.bonus || 0,
      s.remaining || 0,
      (s.base || 0) + (s.bonus || 0),
    ]);
  });

  if (salesManagers?.length) {
    rows.push([]);
    rows.push(['Менеджер ОП', 'Продажи (брутто)', 'Продажи (нетто)', 'Сделок', 'Ком. 3%', 'Ком. 5%', 'Ком. 7%']);
    salesManagers.forEach(m => {
      const s = m.sales?.[month] || {};
      rows.push([
        m.name,
        s.totalSales || 0,
        s.netSales || 0,
        s.deals || 0,
        s.commission3pct || 0,
        s.commission5pct || 0,
        s.commission7pct || 0,
      ]);
    });
  }

  const tsv = rows.map(r => r.join('\t')).join('\n');
  const blob = new Blob(['\uFEFF' + tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Зарплаты_${month.replace(' ', '_')}.tsv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Main Component ───────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const SalaryDashboard = ({ teachers, onConfirmLesson, onUpdateTeacher, onUpdateData } = {}) => {
  const sheets = useSheets();
  const SALARY_DATA = sheets?.salaryData || STATIC_SALARY_DATA;
  const SALES_DATA = sheets?.salesData || STATIC_SALES_DATA;
  const COMPANY_DEBTS = sheets?.companyDebts || STATIC_COMPANY_DEBTS;
  const employees = SALARY_DATA?.employees || [];
  const months = SALARY_DATA?.months?.length
    ? SALARY_DATA.months
    : (() => {
        const allMonths = new Set();
        employees.forEach(emp => {
          Object.keys(emp.salaries || {}).forEach(m => allMonths.add(m));
        });
        return [...allMonths].sort();
      })();
  const salesManagers = SALES_DATA?.managers || [];

  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '');
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [collapsedRoles, setCollapsedRoles] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [edits, setEdits] = useState(() => {
    try {
      const saved = localStorage.getItem(SALARY_LS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  }); // { 'name|month|field': value }
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync selectedMonth when months data loads/changes
  useEffect(() => {
    if (months.length > 0 && (!selectedMonth || !months.includes(selectedMonth))) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [months.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist salary edits
  useEffect(() => {
    try {
      localStorage.setItem(SALARY_LS_KEY, JSON.stringify(edits));
    } catch (e) {}
  }, [edits]);

  const [advanceForm, setAdvanceForm] = useState(null); // { empName, amount }
  const [advanceHistory, setAdvanceHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nobilis_advances') || '[]'); } catch { return []; }
  });

  const saveAdvance = useCallback((empName, amount, note) => {
    const entry = {
      id: Date.now(),
      empName,
      amount: Number(amount),
      note: note || '',
      month: selectedMonth,
      date: new Date().toISOString().slice(0, 10),
    };
    setAdvanceHistory(prev => {
      const next = [entry, ...prev];
      localStorage.setItem('nobilis_advances', JSON.stringify(next));
      return next;
    });
    setAdvanceForm(null);
  }, [selectedMonth]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getEditKey = (name, month, field) => `${name}|${month}|${field}`;

  const getFieldValue = useCallback((emp, month, field) => {
    const key = getEditKey(emp.name, month, field);
    if (edits[key] !== undefined) return edits[key];
    return emp.salaries?.[month]?.[field] || 0;
  }, [edits]);

  const setFieldValue = useCallback((emp, month, field, value) => {
    const key = getEditKey(emp.name, month, field);
    setEdits(prev => ({ ...prev, [key]: value }));
  }, []);

  const isEdited = useCallback((emp, month, field) => {
    const key = getEditKey(emp.name, month, field);
    return edits[key] !== undefined;
  }, [edits]);

  const clearEdits = () => setEdits({});

  const toggleRole = (role) =>
    setCollapsedRoles(prev => ({ ...prev, [role]: !prev[role] }));

  const navigateMonth = (dir) => {
    const idx = months.indexOf(selectedMonth);
    const next = idx + dir;
    if (next >= 0 && next < months.length) setSelectedMonth(months[next]);
  };

  // ── Filtered employees ───────────────────────────────────────────────────

  const activeTabDef = DEPT_TABS.find(t => t.id === activeTab);
  const filteredEmployees = activeTab === 'all'
    ? employees
    : employees.filter(e => activeTabDef?.roles?.includes(e.role));

  // ── Per-employee data for selected month ─────────────────────────────────

  const empData = filteredEmployees.map(emp => ({
    ...emp,
    _base: getFieldValue(emp, selectedMonth, 'base'),
    _advances: getFieldValue(emp, selectedMonth, 'advances'),
    _bonus: getFieldValue(emp, selectedMonth, 'bonus'),
    _remaining: getFieldValue(emp, selectedMonth, 'remaining'),
  })).filter(e => e._base > 0 || e._advances > 0 || (emp => emp.salaries?.[selectedMonth])(e));

  const totalBase = empData.reduce((s, e) => s + e._base, 0);
  const totalAdvances = empData.reduce((s, e) => s + e._advances, 0);
  const totalBonus = empData.reduce((s, e) => s + e._bonus, 0);
  const totalRemaining = empData.reduce((s, e) => s + e._remaining, 0);
  const totalFund = totalBase + totalBonus;

  // Group by role (ordered)
  const byRole = {};
  empData.forEach(e => {
    const role = e.role || 'other';
    if (!byRole[role]) byRole[role] = [];
    byRole[role].push(e);
  });
  const orderedRoles = ROLE_ORDER.filter(r => byRole[r]);

  // ── Chart data ────────────────────────────────────────────────────────────

  const chartData = months.map(m => {
    const val = employees.reduce((s, emp) => {
      const b = edits[getEditKey(emp.name, m, 'base')] ?? (emp.salaries?.[m]?.base || 0);
      const bon = edits[getEditKey(emp.name, m, 'bonus')] ?? (emp.salaries?.[m]?.bonus || 0);
      return s + b + bon;
    }, 0);
    const parts = m.split(' ');
    return {
      key: m,
      label: m,
      shortLabel: (parts[0] || '').slice(0, 3),
      value: val,
    };
  });

  const deptData = DEPT_TABS.filter(t => t.id !== 'all').map(dept => {
    const deptEmps = employees.filter(e => dept.roles?.includes(e.role));
    const val = deptEmps.reduce((s, emp) => {
      const b = edits[getEditKey(emp.name, selectedMonth, 'base')] ?? (emp.salaries?.[selectedMonth]?.base || 0);
      const bon = edits[getEditKey(emp.name, selectedMonth, 'bonus')] ?? (emp.salaries?.[selectedMonth]?.bonus || 0);
      return s + b + bon;
    }, 0);
    return { label: dept.label, value: val, color: ROLE_COLORS[dept.roles?.[0]] || '#9ca3af' };
  });
  const maxDeptVal = Math.max(...deptData.map(d => d.value), 1);
  const deptTotal = deptData.reduce((s, d) => s + d.value, 0);

  // ── Sales data ────────────────────────────────────────────────────────────

  const salesMonthData = salesManagers.map(m => ({
    ...m,
    ...(m.sales?.[selectedMonth] || {}),
  })).filter(m => m.totalSales > 0 || m.deals > 0);

  // ── Debts ─────────────────────────────────────────────────────────────────

  const debts = filteredEmployees
    .map(emp => ({
      ...emp,
      rem: getFieldValue(emp, selectedMonth, 'remaining'),
    }))
    .filter(e => e.rem > 0);
  const totalDebt = debts.reduce((s, e) => s + e.rem, 0);

  // ── No data placeholder ───────────────────────────────────────────────────

  if (!SALARY_DATA) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Зарплаты сотрудников</h1>
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <I.Money />
          </div>
          <p className="text-gray-600 font-medium mb-1">Данные о зарплатах не загружены</p>
          <p className="text-sm text-gray-400">Добавьте файл salaryData.js в папку /src/data/</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Зарплаты сотрудников</h1>
          <p className="text-sm text-gray-400 mt-0.5">Управление ФОТ и выплатами</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month navigation */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => navigateMonth(-1)}
              disabled={months.indexOf(selectedMonth) <= 0}
              className="p-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              onClick={() => navigateMonth(1)}
              disabled={months.indexOf(selectedMonth) >= months.length - 1}
              className="p-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              title="Таблица"
              className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-nobilis-green text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <I.Menu />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              title="Графики"
              className={`px-3 py-2 transition-colors ${viewMode === 'chart' ? 'bg-nobilis-green text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <I.Results />
            </button>
          </div>

          {/* Edit mode toggle */}
          {viewMode === 'table' && (
            <button
              onClick={() => { setEditMode(m => !m); if (editMode) clearEdits(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                editMode
                  ? 'bg-yellow-50 border-nobilis-gold text-nobilis-gold'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <I.Edit />
              {editMode ? 'Отмена правок' : 'Редактировать'}
            </button>
          )}

          {/* Save edits */}
          {editMode && Object.keys(edits).length > 0 && (
            <button
              onClick={() => {
                setEditMode(false);
                setSavedNotice(true);
                setTimeout(() => setSavedNotice(false), 2500);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-nobilis-green text-white hover:bg-nobilis-green-light transition-colors shadow-sm"
            >
              <I.Save />
              Сохранить ({Object.keys(edits).length})
            </button>
          )}

          {/* Saved confirmation */}
          {savedNotice && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium animate-pulse">
              Изменения сохранены
            </span>
          )}

          {/* Export */}
          <button
            onClick={() => exportCSV(employees, salesManagers, selectedMonth)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-nobilis-green hover:text-nobilis-green transition-all shadow-sm"
          >
            <I.Download />
            Excel
          </button>
        </div>
      </div>

      {/* ── Month Strip ──────────────────────────────────────────────────── */}
      {months.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {months.map(m => {
            const val = employees.reduce((s, emp) => {
              return s + (emp.salaries?.[m]?.base || 0) + (emp.salaries?.[m]?.bonus || 0);
            }, 0);
            const isSelected = m === selectedMonth;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                  isSelected
                    ? 'bg-nobilis-green text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-nobilis-green hover:text-nobilis-green'
                }`}
              >
                <span className="font-semibold">{m.split(' ')[0].slice(0, 3)}</span>
                <span className={`mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                  {fmtK(val)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Фонд ЗП"
          value={`${fmt(totalFund)} тг`}
          sub={`Оклады: ${fmt(totalBase)} тг`}
          gradient="linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)"
          icon={I.Money}
        />
        <SummaryCard
          label="Авансы выплачены"
          value={`${fmt(totalAdvances)} тг`}
          sub={`${empData.length} сотрудников`}
          accent="#1a3a32"
        />
        <SummaryCard
          label="Премии"
          value={`${fmt(totalBonus)} тг`}
          sub={totalFund > 0 ? `${Math.round((totalBonus / totalFund) * 100)}% от ФОТ` : ''}
          accent="#c9a227"
        />
        <SummaryCard
          label="Остаток к выплате"
          value={`${fmt(totalRemaining)} тг`}
          sub={debts.length > 0 ? `${debts.length} сотрудников` : 'Все оплачено'}
          accent={totalRemaining > 0 ? '#ef4444' : '#10b981'}
        />
      </div>

      {/* ── Department Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DEPT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-nobilis-green text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-nobilis-green hover:text-nobilis-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chart View ──────────────────────────────────────────────────── */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          {/* Bar chart by month */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800">ФОТ по месяцам</h3>
                <p className="text-xs text-gray-400 mt-0.5">Клик по столбику — выбрать месяц</p>
              </div>
              <div className="text-sm font-semibold text-nobilis-green">
                {fmtK(chartData.find(d => d.key === selectedMonth)?.value || 0)} тг
              </div>
            </div>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                selectedKey={selectedMonth}
                onSelect={setSelectedMonth}
                height={220}
              />
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Нет данных</div>
            )}
          </div>

          {/* Horizontal breakdown by department */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Расходы по отделам</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedMonth}</p>
              </div>
              <div className="text-sm font-semibold text-nobilis-green">{fmt(deptTotal)} тг</div>
            </div>
            <div className="space-y-3">
              {deptData.filter(d => d.value > 0).map(dept => (
                <HorizBar
                  key={dept.label}
                  label={dept.label}
                  value={dept.value}
                  max={maxDeptVal}
                  color={dept.color}
                  total={deptTotal}
                />
              ))}
              {deptData.every(d => d.value === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Нет данных за {selectedMonth}</p>
              )}
            </div>
          </div>

          {/* Per-role breakdown */}
          {orderedRoles.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-6">Структура ФОТ по ролям</h3>
              <div className="space-y-3">
                {orderedRoles.map(role => {
                  const roleEmps = byRole[role] || [];
                  const roleTotal = roleEmps.reduce((s, e) => s + e._base + e._bonus, 0);
                  const rolePct = totalFund > 0 ? Math.round((roleTotal / totalFund) * 100) : 0;
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: ROLE_COLORS[role] }}
                      />
                      <div className="w-36 text-sm text-gray-600 truncate">{ROLE_LABELS[role]}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${rolePct}%`, background: ROLE_COLORS[role] }}
                        />
                      </div>
                      <div className="w-28 text-sm font-semibold text-gray-700">{fmt(roleTotal)} тг</div>
                      <div className="w-10 text-xs text-gray-400">{rolePct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table View ──────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {editMode && (
            <div className="bg-yellow-50 border border-nobilis-gold rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-nobilis-gold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="text-sm text-yellow-800">
                <strong>Режим редактирования:</strong> дважды кликните на любое значение для изменения.
                Изменения подсвечиваются золотой рамкой.
              </p>
            </div>
          )}

          {orderedRoles.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-gray-400 text-sm">
              Нет данных за {selectedMonth}
            </div>
          )}

          {orderedRoles.map(role => {
            const roleEmps = byRole[role] || [];
            const isCollapsed = collapsedRoles[role];
            const roleTotal = roleEmps.reduce((s, e) => s + e._base + e._bonus, 0);

            return (
              <div
                key={role}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Role header */}
                <button
                  onClick={() => toggleRole(role)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  style={{ borderLeft: `4px solid ${ROLE_COLORS[role] || '#9ca3af'}` }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: ROLE_COLORS[role] }}
                  />
                  <span className="font-semibold text-gray-800">{ROLE_LABELS[role] || role}</span>
                  <span className="text-sm text-gray-400">({roleEmps.length})</span>
                  <span className="ml-auto text-sm font-bold text-nobilis-green">{fmt(roleTotal)} тг</span>
                  <span className={`transition-transform duration-200 text-gray-400 ${isCollapsed ? '' : 'rotate-180'}`}>
                    <I.ChevronDown />
                  </span>
                </button>

                {/* Column headers */}
                {!isCollapsed && (
                  <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 text-xs text-gray-400 font-medium border-t border-gray-100">
                    <div className="col-span-4">Сотрудник</div>
                    <div className="col-span-2 text-right">Оклад</div>
                    <div className="col-span-2 text-right">Авансы</div>
                    <div className="col-span-2 text-right">Премия</div>
                    <div className="col-span-2 text-right">Остаток</div>
                  </div>
                )}

                {/* Employee rows */}
                {!isCollapsed && roleEmps.map(emp => {
                  const isExpanded = expandedEmployee === emp.name;
                  const hasEdits = ['base', 'advances', 'bonus', 'remaining'].some(f => isEdited(emp, selectedMonth, f));

                  return (
                    <div
                      key={emp.name}
                      className={`border-t border-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
                    >
                      {/* Main row */}
                      <div
                        className="grid grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setExpandedEmployee(isExpanded ? null : emp.name)}
                      >
                        {/* Name */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          <Avatar name={emp.name} color={ROLE_COLORS[role]} size={36} />
                          <div className="min-w-0">
                            <div className={`font-medium text-gray-800 truncate text-sm ${hasEdits ? 'text-nobilis-gold' : ''}`}>
                              {emp.name}
                              {hasEdits && <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">изм.</span>}
                            </div>
                          </div>
                        </div>

                        {/* Base */}
                        <div className="col-span-2 text-right text-sm font-semibold text-gray-700">
                          {editMode ? (
                            <EditableCell
                              value={emp._base}
                              edited={isEdited(emp, selectedMonth, 'base')}
                              onSave={v => setFieldValue(emp, selectedMonth, 'base', v)}
                            />
                          ) : (
                            <span>{fmt(emp._base)} тг</span>
                          )}
                        </div>

                        {/* Advances */}
                        <div className="col-span-2 text-right text-sm text-gray-500">
                          {editMode ? (
                            <EditableCell
                              value={emp._advances}
                              edited={isEdited(emp, selectedMonth, 'advances')}
                              onSave={v => setFieldValue(emp, selectedMonth, 'advances', v)}
                            />
                          ) : (
                            <span>{fmt(emp._advances)} тг</span>
                          )}
                        </div>

                        {/* Bonus */}
                        <div className="col-span-2 text-right text-sm">
                          {editMode ? (
                            <EditableCell
                              value={emp._bonus}
                              edited={isEdited(emp, selectedMonth, 'bonus')}
                              onSave={v => setFieldValue(emp, selectedMonth, 'bonus', v)}
                            />
                          ) : (
                            emp._bonus > 0
                              ? <span className="text-nobilis-gold font-semibold">+{fmt(emp._bonus)} тг</span>
                              : <span className="text-gray-300">—</span>
                          )}
                        </div>

                        {/* Remaining */}
                        <div className="col-span-2 text-right text-sm">
                          {editMode ? (
                            <EditableCell
                              value={emp._remaining}
                              edited={isEdited(emp, selectedMonth, 'remaining')}
                              onSave={v => setFieldValue(emp, selectedMonth, 'remaining', v)}
                            />
                          ) : (
                            emp._remaining > 0
                              ? <span className="text-red-500 font-semibold">{fmt(emp._remaining)} тг</span>
                              : <span className="text-green-500 font-medium text-xs">Оплачено</span>
                          )}
                        </div>
                      </div>

                      {/* Expanded employee detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                          {/* Stats row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-4">
                            {[
                              { label: 'Итого к выдаче', value: emp._base + emp._bonus, accent: '#1a3a32' },
                              { label: 'Авансы', value: emp._advances, accent: '#6b7280' },
                              { label: 'Премия', value: emp._bonus, accent: '#c9a227' },
                              { label: 'Остаток', value: emp._remaining, accent: emp._remaining > 0 ? '#ef4444' : '#10b981' },
                            ].map(({ label, value, accent }) => (
                              <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                                <div className="text-xs text-gray-400">{label}</div>
                                <div className="font-semibold text-sm mt-0.5" style={{ color: accent }}>
                                  {fmt(value)} тг
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Advance list */}
                          {emp.salaries?.[selectedMonth]?.advancesList?.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-2">Авансовые выплаты:</div>
                              <div className="flex flex-wrap gap-2">
                                {emp.salaries[selectedMonth].advancesList.map((adv, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg font-medium"
                                  >
                                    {typeof adv === 'object'
                                      ? `${adv.date ? adv.date + ': ' : ''}${fmt(adv.amount || adv)} тг`
                                      : `${fmt(adv)} тг`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Advance button & form */}
                          <div className="mb-4">
                            {advanceForm?.empName === emp.name ? (
                              <div className="bg-white rounded-xl border border-nobilis-gold/30 p-4 space-y-3">
                                <div className="text-sm font-semibold text-gray-700">Записать аванс — {emp.name}</div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-400">Сумма</label>
                                    <input
                                      type="number"
                                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/20"
                                      placeholder="100000"
                                      value={advanceForm.amount || ''}
                                      onChange={e => setAdvanceForm(prev => ({ ...prev, amount: e.target.value }))}
                                      onClick={e => e.stopPropagation()}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400">Примечание</label>
                                    <input
                                      type="text"
                                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nobilis-green/20"
                                      placeholder="Аванс за март"
                                      value={advanceForm.note || ''}
                                      onChange={e => setAdvanceForm(prev => ({ ...prev, note: e.target.value }))}
                                      onClick={e => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={e => { e.stopPropagation(); saveAdvance(emp.name, advanceForm.amount, advanceForm.note); }}
                                    className="px-4 py-2 bg-nobilis-green text-white text-xs font-medium rounded-lg hover:bg-nobilis-green/90 transition-colors"
                                  >
                                    Сохранить
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setAdvanceForm(null); }}
                                    className="px-4 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); setAdvanceForm({ empName: emp.name, amount: '', note: '' }); }}
                                className="flex items-center gap-2 px-4 py-2 bg-nobilis-gold/10 border border-nobilis-gold/30 text-nobilis-gold text-xs font-medium rounded-xl hover:bg-nobilis-gold/20 transition-colors"
                              >
                                <I.Plus className="w-3 h-3" />
                                Записать аванс
                              </button>
                            )}

                            {/* Recorded advances from localStorage */}
                            {advanceHistory.filter(a => a.empName === emp.name && a.month === selectedMonth).length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-400 mb-1">Записанные авансы:</div>
                                <div className="flex flex-wrap gap-2">
                                  {advanceHistory.filter(a => a.empName === emp.name && a.month === selectedMonth).map(a => (
                                    <span key={a.id} className="text-xs bg-nobilis-gold/10 text-nobilis-gold px-2.5 py-1 rounded-lg font-medium">
                                      {a.date}: {fmt(a.amount)} тг {a.note && `(${a.note})`}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Monthly history strip */}
                          <div>
                            <div className="text-xs text-gray-400 mb-2">История по месяцам:</div>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {months.map(m => {
                                const ms = emp.salaries?.[m];
                                if (!ms || !ms.base) return null;
                                const isCurrentMonth = m === selectedMonth;
                                const mBase = edits[getEditKey(emp.name, m, 'base')] ?? ms.base;
                                const mBonus = edits[getEditKey(emp.name, m, 'bonus')] ?? (ms.bonus || 0);
                                return (
                                  <button
                                    key={m}
                                    onClick={e => { e.stopPropagation(); setSelectedMonth(m); }}
                                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                                      isCurrentMonth
                                        ? 'bg-nobilis-green text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-nobilis-green'
                                    }`}
                                  >
                                    <span className="font-semibold">{m.split(' ')[0].slice(0, 3)}</span>
                                    <span className={`mt-0.5 ${isCurrentMonth ? 'text-white/70' : 'text-gray-400'}`}>
                                      {fmtK(mBase)}
                                    </span>
                                    {mBonus > 0 && (
                                      <span className={`text-xs ${isCurrentMonth ? 'text-yellow-300' : 'text-nobilis-gold'}`}>
                                        +{fmtK(mBonus)}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Mini trend bar chart */}
                          {months.filter(m => emp.salaries?.[m]?.base).length > 1 && (
                            <div className="mt-4">
                              <div className="text-xs text-gray-400 mb-2">Динамика оклада:</div>
                              <div className="flex items-end gap-1 h-16">
                                {months.map(m => {
                                  const ms = emp.salaries?.[m];
                                  if (!ms) return null;
                                  const val = (edits[getEditKey(emp.name, m, 'base')] ?? ms.base) || 0;
                                  const allVals = months.map(mm => (edits[getEditKey(emp.name, mm, 'base')] ?? emp.salaries?.[mm]?.base) || 0);
                                  const maxVal = Math.max(...allVals, 1);
                                  const pct = (val / maxVal) * 100;
                                  const isCur = m === selectedMonth;
                                  return (
                                    <div
                                      key={m}
                                      className="flex-1 rounded-t-sm transition-all duration-300"
                                      style={{
                                        height: `${Math.max(pct, 4)}%`,
                                        background: isCur ? '#1a3a32' : '#d1fae5',
                                        minHeight: 3,
                                      }}
                                      title={`${m}: ${fmt(val)} тг`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Role total row */}
                {!isCollapsed && roleEmps.length > 1 && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">
                      Итого: {ROLE_LABELS[role]} ({roleEmps.length} чел.)
                    </span>
                    <div className="flex gap-6 text-xs">
                      <span className="text-gray-500">
                        Оклады: <strong className="text-gray-700">{fmt(roleEmps.reduce((s, e) => s + e._base, 0))} тг</strong>
                      </span>
                      {roleEmps.reduce((s, e) => s + e._bonus, 0) > 0 && (
                        <span className="text-nobilis-gold">
                          Премии: <strong>{fmt(roleEmps.reduce((s, e) => s + e._bonus, 0))} тг</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Sales Department Section ──────────────────────────────────── */}
      {(activeTab === 'all' || activeTab === 'sales') && salesMonthData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
            style={{ borderLeft: '4px solid #ef4444' }}
          >
            <div>
              <span className="font-semibold text-gray-800">Отдел продаж</span>
              <span className="ml-2 text-sm text-gray-400">— {selectedMonth}</span>
            </div>
            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              Комиссии от продаж
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 text-xs text-gray-400 font-medium border-b border-gray-100">
            <div className="col-span-3">Менеджер</div>
            <div className="col-span-2 text-right">Продажи</div>
            <div className="col-span-2 text-right">Нетто</div>
            <div className="col-span-1 text-center">Сделок</div>
            <div className="col-span-1 text-right">3%</div>
            <div className="col-span-1 text-right">5%</div>
            <div className="col-span-2 text-right">7%</div>
          </div>

          {salesMonthData.map((m, idx) => (
            <div
              key={m.name}
              className={`grid grid-cols-12 gap-2 px-5 py-3 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/50'}`}
            >
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <Avatar name={m.name} color="#ef4444" size={32} />
                <span className="text-sm font-medium text-gray-800 truncate">{m.name}</span>
              </div>
              <div className="col-span-2 text-right text-sm font-semibold text-gray-700">
                {fmt(m.totalSales)} тг
              </div>
              <div className="col-span-2 text-right text-sm text-gray-500">
                {fmt(m.netSales)} тг
              </div>
              <div className="col-span-1 text-center">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {m.deals || 0}
                </span>
              </div>
              <div className="col-span-1 text-right text-xs text-gray-500">
                {fmt(m.commission3pct)}
              </div>
              <div className="col-span-1 text-right text-xs text-nobilis-gold font-medium">
                {fmt(m.commission5pct)}
              </div>
              <div className="col-span-2 text-right text-sm font-semibold text-nobilis-green">
                {fmt(m.commission7pct)} тг
              </div>
            </div>
          ))}

          {/* Sales totals */}
          <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Итого: {salesMonthData.length} менеджеров
            </span>
            <div className="flex gap-4 text-xs">
              <span className="text-gray-500">
                Продажи: <strong className="text-gray-700">
                  {fmt(salesMonthData.reduce((s, m) => s + (m.totalSales || 0), 0))} тг
                </strong>
              </span>
              <span className="text-nobilis-gold">
                Комиссии 7%: <strong>
                  {fmt(salesMonthData.reduce((s, m) => s + (m.commission7pct || 0), 0))} тг
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Company Debts Section ─────────────────────────────────────── */}
      {debts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-5 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.193 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-red-700">Задолженности компании</span>
                <p className="text-xs text-red-400 mt-0.5">{selectedMonth} — {debts.length} сотрудников</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-600">{fmt(totalDebt)} тг</div>
              <div className="text-xs text-red-400">общий долг</div>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {debts
              .sort((a, b) => b.rem - a.rem)
              .map(emp => {
                const pct = totalDebt > 0 ? (emp.rem / totalDebt) * 100 : 0;
                return (
                  <div key={emp.name} className="px-5 py-3 flex items-center gap-4 hover:bg-red-50/30 transition-colors">
                    <Avatar name={emp.name} color={ROLE_COLORS[emp.role] || '#9ca3af'} size={34} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{emp.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-red-100 rounded-full h-1.5 overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-red-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">{fmt(emp.rem)} тг</div>
                      <div className="text-xs text-gray-400">{ROLE_LABELS[emp.role] || emp.role}</div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="px-5 py-3 bg-red-50 border-t border-red-100 flex items-center justify-between">
            <span className="text-xs text-red-400">
              Необходимо погасить до конца месяца
            </span>
            <span className="text-sm font-bold text-red-600">{fmt(totalDebt)} тг</span>
          </div>
        </div>
      )}

      {/* All debts paid badge */}
      {debts.length === 0 && empData.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-4 bg-green-50 rounded-2xl border border-green-100">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-700">
            Все выплаты за {selectedMonth} закрыты
          </span>
        </div>
      )}

      {/* Company Debts from Excel */}
      {COMPANY_DEBTS && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-5 py-4 border-b bg-red-50" style={{ borderLeftWidth: '4px', borderLeftColor: '#ef4444' }}>
            <h3 className="font-semibold text-gray-800">Долги компании (Февраль 2026)</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Долги по ЗП</div>
                <div className="text-lg font-bold text-red-600">{fmt(COMPANY_DEBTS.salaryDebts)} тг</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Долги компании</div>
                <div className="text-lg font-bold text-orange-600">{fmt(COMPANY_DEBTS.companyDebts)} тг</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Налоги</div>
                <div className="text-lg font-bold text-yellow-600">{fmt(COMPANY_DEBTS.taxes)} тг</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">Возвраты</div>
                <div className="text-lg font-bold text-blue-600">{fmt(COMPANY_DEBTS.returnables)} тг</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white">
              <div className="text-sm text-white/70">Общий долг</div>
              <div className="text-2xl font-bold">
                {fmt((COMPANY_DEBTS.salaryDebts || 0) + (COMPANY_DEBTS.companyDebts || 0) + (COMPANY_DEBTS.taxes || 0) + (COMPANY_DEBTS.returnables || 0))} тг
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDashboard;
