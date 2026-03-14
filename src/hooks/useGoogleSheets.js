// Hook for loading Google Sheets data with fallback to static files
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllSheetsData } from '../lib/googleSheets';

const LS_KEY = 'nobilis_sheets_cache';
const LS_TS_KEY = 'nobilis_sheets_cache_ts';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Load static fallback data
let STATIC_PNL = null;
let STATIC_EXPENSES_DETAIL = null;
let STATIC_EXPENSE_CATEGORIES = null;
let STATIC_SALARY = null;
let STATIC_SALES = null;
let STATIC_DEBTS = null;

try {
  const pnl = require('../data/pnlData');
  STATIC_PNL = pnl.PNL_DATA;
  STATIC_EXPENSES_DETAIL = pnl.EXPENSES_DETAIL;
  STATIC_EXPENSE_CATEGORIES = pnl.EXPENSE_CATEGORIES;
} catch {}
try {
  const sal = require('../data/salaryData');
  STATIC_SALARY = sal.SALARY_DATA;
  STATIC_SALES = sal.SALES_DATA;
  STATIC_DEBTS = sal.COMPANY_DEBTS;
} catch {}

function loadCache() {
  try {
    const ts = parseInt(localStorage.getItem(LS_TS_KEY), 10);
    if (Date.now() - ts < CACHE_TTL) {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    localStorage.setItem(LS_TS_KEY, String(Date.now()));
  } catch {}
}

export function useGoogleSheets() {
  const [sheetsData, setSheetsData] = useState(() => loadCache());
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setLastError(null);

    try {
      const data = await fetchAllSheetsData();
      const hasErrors = Object.keys(data.errors).length > 0;

      if (hasErrors && !data.pnl && !data.salaryMonthly && !data.students) {
        // All failed — probably API not configured
        setLastError('Google Sheets API не настроен. Используются локальные данные.');
      } else {
        setSheetsData(data);
        saveCache(data);
        setLastSync(new Date());
        if (hasErrors) {
          setLastError(`Частичная загрузка. Ошибки: ${Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join('; ')}`);
        }
      }
    } catch (e) {
      setLastError(e.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Auto-fetch on mount if cache is stale
  useEffect(() => {
    const cached = loadCache();
    if (!cached) {
      refresh();
    } else {
      setSheetsData(cached);
      setLastSync(new Date(parseInt(localStorage.getItem(LS_TS_KEY), 10)));
    }
  }, [refresh]);

  // ─── Merged data getters (Google Sheets data preferred, fallback to static) ──

  const pnlData = sheetsData?.pnl || STATIC_PNL;

  const salaryData = sheetsData?.salaryMonthly
    ? sheetsData.salaryMonthly
    : STATIC_SALARY;

  const salesData = sheetsData?.salaryOP
    ? { months: STATIC_SALES?.months || [], managers: sheetsData.salaryOP.managers }
    : STATIC_SALES;

  const expenseCategories = sheetsData?.expenses
    ? {
        months: sheetsData.expenses.months,
        categories: sheetsData.expenses.categories,
        amounts: sheetsData.expenses.amounts,
      }
    : STATIC_EXPENSE_CATEGORIES;

  const expensesDetail = sheetsData?.expenses?.details || STATIC_EXPENSES_DETAIL;

  const companyDebts = STATIC_DEBTS; // Debts typically not in separate sheet

  const students = sheetsData?.students || [];

  return {
    // Raw data
    sheetsData,
    // Merged data (with fallback)
    pnlData,
    salaryData,
    salesData,
    expenseCategories,
    expensesDetail,
    companyDebts,
    students,
    // State
    loading,
    lastError,
    lastSync,
    // Actions
    refresh,
    // Source info
    isFromSheets: !!sheetsData?.pnl || !!sheetsData?.salaryMonthly,
    isConfigured: !lastError?.includes('не настроен'),
  };
}
