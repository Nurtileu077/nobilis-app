import React, { useState, useEffect } from 'react';
import I from '../common/Icons';
import { useSheets } from '../../context/GoogleSheetsContext';

let STATIC_EXPENSE_CATEGORIES = null;
let STATIC_EXPENSES_DETAIL = null;
try {
  const pnlModule = require('../../data/pnlData');
  STATIC_EXPENSE_CATEGORIES = pnlModule.EXPENSE_CATEGORIES;
  STATIC_EXPENSES_DETAIL = pnlModule.EXPENSES_DETAIL;
} catch (e) {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtFull = (n) => {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('ru-RU').format(Math.round(n));
};

const LS_CUSTOM_EXPENSES = 'nobilis_custom_expenses';
const LS_PLANNED_EXPENSES = 'nobilis_planned_expenses';

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
};

const DEFAULT_PLANNED = [
  { id: 1, name: 'Аренда', amount: 0, paid: false },
  { id: 2, name: 'Битрикс24', amount: 0, paid: false },
  { id: 3, name: 'Интернет/Связь', amount: 0, paid: false },
  { id: 4, name: 'Зарплата', amount: 0, paid: false },
  { id: 5, name: 'Налоги', amount: 0, paid: false },
  { id: 6, name: 'Вода', amount: 0, paid: false },
  { id: 7, name: 'Канцтовары', amount: 0, paid: false },
];

// ─── Main Component ───────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const ExpensesDashboard = ({ onUpdateData } = {}) => {
  const sheets = useSheets();
  const EXPENSE_CATEGORIES = sheets?.expenseCategories || STATIC_EXPENSE_CATEGORIES;
  const EXPENSES_DETAIL = sheets?.expensesDetail || STATIC_EXPENSES_DETAIL;
  const months = EXPENSE_CATEGORIES?.months?.length
    ? EXPENSE_CATEGORIES.months
    : ['Январь 2026', 'Февраль 2026', 'Март 2026'];
  const categories = EXPENSE_CATEGORIES?.categories || [];
  const amounts = EXPENSE_CATEGORIES?.amounts || [];
  const details = EXPENSES_DETAIL || [];

  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customExpenses, setCustomExpenses] = useState(() => loadJSON(LS_CUSTOM_EXPENSES, []));

  // Sync selectedMonth when months data loads/changes
  useEffect(() => {
    if (months.length > 0 && (!selectedMonth || !months.includes(selectedMonth))) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [months.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const [plannedExpenses, setPlannedExpenses] = useState(() => loadJSON(LS_PLANNED_EXPENSES, DEFAULT_PLANNED));
  const [showAddPlanned, setShowAddPlanned] = useState(false);
  const [newPlannedName, setNewPlannedName] = useState('');

  // Add-expense form state
  const [formDate, setFormDate] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');

  // Persist to localStorage
  useEffect(() => { saveJSON(LS_CUSTOM_EXPENSES, customExpenses); }, [customExpenses]);
  useEffect(() => { saveJSON(LS_PLANNED_EXPENSES, plannedExpenses); }, [plannedExpenses]);

  // ─── Derived data ────────────────────────────────────────────────────────────

  const monthIndex = months.indexOf(selectedMonth);

  // Existing expenses for selected month from EXPENSE_CATEGORIES
  const existingByCategory = categories.map((cat, catIdx) => ({
    category: cat,
    amount: monthIndex >= 0 && amounts[monthIndex] ? (amounts[monthIndex][catIdx] || 0) : 0,
  })).filter((e) => e.amount > 0);

  // Custom expenses for selected month
  const monthCustomExpenses = customExpenses.filter((e) => e.month === selectedMonth);

  // Totals
  const totalActual =
    existingByCategory.reduce((s, e) => s + e.amount, 0) +
    monthCustomExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const totalPlanned = plannedExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = totalPlanned - totalActual;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAddExpense = () => {
    if (!formDate || !formCategory || !formAmount) return;
    const newExpense = {
      id: Date.now(),
      date: formDate,
      category: formCategory,
      description: formDescription,
      amount: Number(formAmount),
      month: selectedMonth,
    };
    setCustomExpenses((prev) => [...prev, newExpense]);
    setFormDate('');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setShowAddForm(false);
  };

  const handleDeleteCustom = (id) => {
    setCustomExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handlePlannedAmountChange = (id, value) => {
    setPlannedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount: value } : e))
    );
  };

  const handlePlannedPaidToggle = (id) => {
    setPlannedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, paid: !e.paid } : e))
    );
  };

  const handleAddPlannedItem = () => {
    if (!newPlannedName.trim()) return;
    setPlannedExpenses((prev) => [
      ...prev,
      { id: Date.now(), name: newPlannedName.trim(), amount: 0, paid: false },
    ]);
    setNewPlannedName('');
    setShowAddPlanned(false);
  };

  const handleDeletePlanned = (id) => {
    setPlannedExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <I.Calendar />
            <span>Плановые расходы</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#1a3a32' }}>
            {fmtFull(totalPlanned)} ₸
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <I.Money />
            <span>Фактические расходы</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#c9a227' }}>
            {fmtFull(totalActual)} ₸
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <I.Results />
            <span>Остаток</span>
          </div>
          <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {fmtFull(remaining)} ₸
          </div>
        </div>
      </div>

      {/* ── Month Selector ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Месяц:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: '#1a3a32', focusRingColor: '#c9a227' }}
            >
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1a3a32' }}
          >
            <I.Plus />
            Добавить расход
          </button>
        </div>
      </div>

      {/* ── Add Expense Form (inline) ───────────────────────────────────────── */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="text-base font-semibold mb-4" style={{ color: '#1a3a32' }}>
            Новый расход
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Дата</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Категория</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">— выберите —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Другое">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Назначение</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Описание расхода"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Сумма (₸)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddExpense}
              className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#c9a227' }}
            >
              Сохранить
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 border hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* ── Existing Expenses for Month ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h3 className="text-base font-semibold mb-4" style={{ color: '#1a3a32' }}>
          Расходы за {selectedMonth}
        </h3>
        {existingByCategory.length === 0 && monthCustomExpenses.length === 0 ? (
          <p className="text-sm text-gray-400">Нет данных за выбранный месяц</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ color: '#1a3a32' }}>
                  <th className="text-left py-2 font-medium">Категория</th>
                  <th className="text-left py-2 font-medium">Описание</th>
                  <th className="text-right py-2 font-medium">Сумма</th>
                  <th className="text-right py-2 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {existingByCategory.map((e) => (
                  <tr key={e.category} className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">{e.category}</td>
                    <td className="py-2 text-gray-400">—</td>
                    <td className="py-2 text-right font-medium" style={{ color: '#1a3a32' }}>
                      {fmtFull(e.amount)} ₸
                    </td>
                    <td></td>
                  </tr>
                ))}
                {monthCustomExpenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 bg-amber-50/40">
                    <td className="py-2 text-gray-700">{e.category}</td>
                    <td className="py-2 text-gray-500">{e.description || '—'}</td>
                    <td className="py-2 text-right font-medium" style={{ color: '#c9a227' }}>
                      {fmtFull(e.amount)} ₸
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDeleteCustom(e.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <I.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold" style={{ color: '#1a3a32' }}>
                  <td className="py-3">Итого</td>
                  <td></td>
                  <td className="py-3 text-right">{fmtFull(totalActual)} ₸</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Planned / Recurring Expenses ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: '#1a3a32' }}>
            Плановые / регулярные расходы
          </h3>
          <button
            onClick={() => setShowAddPlanned(!showAddPlanned)}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#c9a227' }}
          >
            <I.Plus />
            Добавить
          </button>
        </div>

        {showAddPlanned && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPlannedName}
              onChange={(e) => setNewPlannedName(e.target.value)}
              placeholder="Название расхода"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlannedItem()}
            />
            <button
              onClick={handleAddPlannedItem}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: '#1a3a32' }}
            >
              Добавить
            </button>
          </div>
        )}

        <div className="space-y-2">
          {plannedExpenses.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                item.paid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={item.paid}
                onChange={() => handlePlannedPaidToggle(item.id)}
                className="w-4 h-4 rounded accent-green-600"
                title="Оплачено в этом месяце"
              />
              <span className={`flex-1 text-sm ${item.paid ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {item.name}
              </span>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => handlePlannedAmountChange(item.id, e.target.value)}
                className="w-32 border rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-2"
                placeholder="0"
              />
              <span className="text-xs text-gray-400">₸/мес</span>
              <button
                onClick={() => handleDeletePlanned(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Удалить"
              >
                <I.Trash />
              </button>
            </div>
          ))}
        </div>

        {plannedExpenses.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">Нет плановых расходов</p>
        )}
      </div>
    </div>
  );
};

export default ExpensesDashboard;
