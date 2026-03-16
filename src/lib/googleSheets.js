// Google Sheets API client
// Fetches data via /api/sheets proxy (keeps API key server-side)
// Falls back to static data when API is unavailable

const API_BASE = '/api/sheets';
const CACHE_KEY_PREFIX = 'gs_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Low-level fetch ─────────────────────────────────────────────────────────

async function fetchSheet(sheetName, range) {
  const params = new URLSearchParams({ sheet: sheetName });
  if (range) params.set('range', range);

  const url = `${API_BASE}?${params}`;

  // Check memory cache
  const cacheKey = CACHE_KEY_PREFIX + sheetName + '_' + (range || 'meta');
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch { /* ignore */ }

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();

  // Cache result
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }

  return data;
}

// Get sheet tab names
async function getSheetTabs(sheetName) {
  const meta = await fetchSheet(sheetName);
  return meta.sheets.map(s => s.properties.title);
}

// Get values from a range
async function getValues(sheetName, range) {
  const result = await fetchSheet(sheetName, range);
  return result.values || [];
}

// ─── Batch fetch all ranges from one spreadsheet ─────────────────────────────

async function batchGetValues(sheetName, ranges) {
  const results = {};
  // Fetch all ranges in parallel
  const promises = ranges.map(async (range) => {
    const values = await getValues(sheetName, range);
    results[range] = values;
  });
  await Promise.all(promises);
  return results;
}

// ─── Data parsers ────────────────────────────────────────────────────────────

function parseNumber(val) {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/\s/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// ─── Students sheet parser ───────────────────────────────────────────────────

export async function fetchStudents() {
  const tabs = await getSheetTabs('students');
  // Usually first tab has the main list
  const mainTab = tabs[0] || 'Лист1';
  const rows = await getValues('students', `'${mainTab}'!A1:Z`);

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  return rows.slice(1).filter(row => row.some(cell => cell != null && cell !== '')).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] != null ? row[i] : '';
    });
    return obj;
  });
}

// ─── PNL sheet parser ────────────────────────────────────────────────────────

export async function fetchPnl() {
  const tabs = await getSheetTabs('pnl');
  const mainTab = tabs[0] || 'Лист1';
  const rows = await getValues('pnl', `'${mainTab}'!A1:Z`);

  if (rows.length < 2) return null;

  // The PNL sheet typically has rows like:
  // Row 0: headers (months)
  // Row N: category name | value1 | value2 | ...
  // We need to detect the structure

  const headers = rows[0];
  // Find month columns (skip first column which is usually label)
  const months = headers.slice(1).filter(h => h != null && h !== '').map(String);

  const findRow = (label) => {
    const lower = label.toLowerCase();
    return rows.find(r => r[0] && String(r[0]).toLowerCase().includes(lower));
  };

  const extractValues = (row) => {
    if (!row) return months.map(() => 0);
    return months.map((_, i) => parseNumber(row[i + 1]));
  };

  const planRow = findRow('план');
  const revenueRow = findRow('выручка') || findRow('доход') || findRow('revenue');
  const expensesRow = findRow('расход') || findRow('expenses') || findRow('общие расход');
  const fixedRow = findRow('постоянн') || findRow('фиксиров');
  const payrollRow = findRow('зарплат') || findRow('фот') || findRow('зп');
  const profitRow = findRow('прибыль') || findRow('profit') || findRow('итого');

  return {
    months,
    plan: extractValues(planRow),
    revenue: extractValues(revenueRow),
    totalExpenses: extractValues(expensesRow),
    fixedExpenses: extractValues(fixedRow),
    payroll: extractValues(payrollRow),
    profit: extractValues(profitRow),
  };
}

// ─── Salary monthly sheet parser ─────────────────────────────────────────────

export async function fetchSalaryMonthly() {
  const tabs = await getSheetTabs('salary_monthly');

  // Each tab is typically a month, or there's one sheet with all data
  // We'll try to detect the format

  if (tabs.length === 1) {
    // Single sheet — all data in one place
    return parseSalarySingleSheet(tabs[0]);
  }

  // Multiple tabs — each tab is a month
  const employees = {};
  for (const tab of tabs) {
    const monthName = tab;
    try {
      const rows = await getValues('salary_monthly', `'${tab}'!A1:Z`);
      if (rows.length < 2) continue;

      const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('имя') || h.includes('сотрудник') || h.includes('фио') || h === 'name');
      const baseIdx = headers.findIndex(h => h.includes('оклад') || h.includes('зп') || h.includes('зарплата') || h.includes('base'));
      const advIdx = headers.findIndex(h => h.includes('аванс') || h.includes('advance') || h.includes('выдано'));
      const bonusIdx = headers.findIndex(h => h.includes('бонус') || h.includes('bonus') || h.includes('премия'));
      const roleIdx = headers.findIndex(h => h.includes('роль') || h.includes('должность') || h.includes('role'));

      const ni = nameIdx >= 0 ? nameIdx : 0;
      const bi = baseIdx >= 0 ? baseIdx : 1;
      const ai = advIdx >= 0 ? advIdx : -1;
      const boi = bonusIdx >= 0 ? bonusIdx : -1;
      const ri = roleIdx >= 0 ? roleIdx : -1;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const name = String(row[ni] || '').trim();
        if (!name) continue;

        if (!employees[name]) {
          employees[name] = { name, role: ri >= 0 ? (row[ri] || 'other') : 'other', salaries: {} };
        }

        const base = parseNumber(row[bi]);
        const advances = ai >= 0 ? parseNumber(row[ai]) : 0;
        const bonus = boi >= 0 ? parseNumber(row[boi]) : 0;

        employees[name].salaries[monthName] = {
          base,
          advances,
          advancesList: advances > 0 ? [advances] : [],
          bonus,
          remaining: base + bonus - advances,
        };
      }
    } catch (e) {
      console.warn(`Failed to parse salary tab "${tab}":`, e);
    }
  }

  const allMonths = new Set();
  Object.values(employees).forEach(emp => {
    Object.keys(emp.salaries).forEach(m => allMonths.add(m));
  });
  const months = [...allMonths].sort(monthSortKey);

  return { employees: Object.values(employees), months };
}

async function parseSalarySingleSheet(tabName) {
  const rows = await getValues('salary_monthly', `'${tabName}'!A1:AZ`);
  if (rows.length < 2) return { employees: [] };

  // Detect if months are in columns (wide format)
  const headers = rows[0].map(h => String(h || '').trim());
  const employees = {};

  // Check if it's name + month columns format
  const nameIdx = 0;
  // Months start from column 1 onwards
  const monthHeaders = headers.slice(1).filter(Boolean);

  if (monthHeaders.length > 0) {
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const name = String(row[nameIdx] || '').trim();
      if (!name) continue;

      if (!employees[name]) employees[name] = { name, role: 'other', salaries: {} };

      for (let c = 1; c < headers.length; c++) {
        const month = headers[c];
        if (!month) continue;
        const val = parseNumber(row[c]);
        if (val > 0) {
          employees[name].salaries[month] = {
            base: val, advances: 0, advancesList: [], bonus: 0, remaining: val,
          };
        }
      }
    }
  }

  const allMonths = new Set();
  Object.values(employees).forEach(emp => {
    Object.keys(emp.salaries).forEach(m => allMonths.add(m));
  });
  const months = [...allMonths].sort(monthSortKey);

  return { employees: Object.values(employees), months };
}

// ─── Sales OP salary parser ─────────────────────────────────────────────────

export async function fetchSalaryOP() {
  const tabs = await getSheetTabs('salary_op');
  const mainTab = tabs[0] || 'Лист1';
  const rows = await getValues('salary_op', `'${mainTab}'!A1:Z`);

  if (rows.length < 2) return { managers: [] };

  const headers = rows[0].map(h => String(h || '').trim());
  const managers = {};

  // Try to detect structure
  const nameIdx = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = String(row[nameIdx] || '').trim();
    if (!name) continue;

    if (!managers[name]) {
      managers[name] = { name, role: 'sales_manager', sales: {} };
    }

    // Parse remaining columns based on headers
    for (let c = 1; c < headers.length; c++) {
      const header = headers[c];
      if (!header) continue;
      const val = parseNumber(row[c]);
      // If header looks like a month
      if (isMonth(header)) {
        if (!managers[name].sales[header]) {
          managers[name].sales[header] = { totalSales: 0, netSales: 0, deals: 0 };
        }
        managers[name].sales[header].totalSales = val;
      }
    }
  }

  return { managers: Object.values(managers) };
}

// ─── Expenses sheet parser ───────────────────────────────────────────────────

export async function fetchExpenses() {
  const tabs = await getSheetTabs('expenses');
  const mainTab = tabs[0] || 'Лист1';
  const rows = await getValues('expenses', `'${mainTab}'!A1:AZ`);

  if (rows.length < 2) return { categories: [], details: [] };

  const headers = rows[0].map(h => String(h || '').trim());

  // Detect if it's a transaction log or category summary
  const dateIdx = headers.findIndex(h =>
    h.toLowerCase().includes('дата') || h.toLowerCase() === 'date'
  );
  const amountIdx = headers.findIndex(h =>
    h.toLowerCase().includes('сумма') || h.toLowerCase() === 'amount'
  );
  const categoryIdx = headers.findIndex(h =>
    h.toLowerCase().includes('категория') || h.toLowerCase() === 'category'
  );
  const purposeIdx = headers.findIndex(h =>
    h.toLowerCase().includes('назначение') || h.toLowerCase().includes('описание') || h.toLowerCase() === 'purpose'
  );
  const monthIdx = headers.findIndex(h =>
    h.toLowerCase().includes('месяц') || h.toLowerCase() === 'month'
  );

  const details = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.some(cell => cell != null && cell !== '')) continue;

    const entry = {
      date: dateIdx >= 0 ? String(row[dateIdx] || '') : '',
      amount: amountIdx >= 0 ? parseNumber(row[amountIdx]) : 0,
      category: categoryIdx >= 0 ? String(row[categoryIdx] || 'Прочее') : 'Прочее',
      purpose: purposeIdx >= 0 ? String(row[purposeIdx] || '') : '',
      month: monthIdx >= 0 ? String(row[monthIdx] || '') : '',
    };

    if (entry.amount > 0) details.push(entry);
  }

  // Build category summary
  const byMonthCategory = {};
  const allMonths = new Set();
  const allCategories = new Set();

  details.forEach(d => {
    const month = d.month || guessMonth(d.date);
    if (month) {
      allMonths.add(month);
      allCategories.add(d.category);
      const key = `${month}|${d.category}`;
      byMonthCategory[key] = (byMonthCategory[key] || 0) + d.amount;
    }
  });

  const months = [...allMonths].sort(monthSortKey);
  const categories = [...allCategories].sort();
  const amounts = months.map(m =>
    categories.map(cat => byMonthCategory[`${m}|${cat}`] || 0)
  );

  return {
    months,
    categories,
    amounts,
    details: details.map(d => ({ ...d, month: d.month || guessMonth(d.date) })),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS_RU = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

function isMonth(str) {
  const lower = String(str).toLowerCase();
  return MONTHS_RU.some(m => lower.includes(m));
}

function guessMonth(dateStr) {
  if (!dateStr) return '';
  // Try to parse date like 2024-06-10 or 10.06.2024
  const parts = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (parts) {
    const monthIdx = parseInt(parts[2], 10) - 1;
    const year = parts[1];
    if (monthIdx >= 0 && monthIdx < 12) {
      return MONTHS_RU[monthIdx].charAt(0).toUpperCase() + MONTHS_RU[monthIdx].slice(1) + ' ' + year;
    }
  }
  return '';
}

function monthSortKey(a) {
  const lower = a.toLowerCase();
  for (let i = 0; i < MONTHS_RU.length; i++) {
    if (lower.includes(MONTHS_RU[i])) {
      const yearMatch = a.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : 2024;
      return year * 12 + i;
    }
  }
  return 0;
}

// ─── Fetch all data ──────────────────────────────────────────────────────────

export async function fetchAllSheetsData() {
  const results = {
    students: null,
    pnl: null,
    salaryMonthly: null,
    salaryOP: null,
    expenses: null,
    errors: {},
  };

  const tasks = [
    { key: 'students', fn: fetchStudents },
    { key: 'pnl', fn: fetchPnl },
    { key: 'salaryMonthly', fn: fetchSalaryMonthly },
    { key: 'salaryOP', fn: fetchSalaryOP },
    { key: 'expenses', fn: fetchExpenses },
  ];

  await Promise.allSettled(
    tasks.map(async ({ key, fn }) => {
      try {
        results[key] = await fn();
      } catch (e) {
        results.errors[key] = e.message;
        console.warn(`Google Sheets: failed to fetch ${key}:`, e);
      }
    })
  );

  return results;
}
