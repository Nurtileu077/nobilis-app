import React, { useState } from 'react';
import { useSheets } from '../../context/GoogleSheetsContext';
import I from './Icons';

const GoogleSheetsSync = () => {
  const sheets = useSheets();
  const [expanded, setExpanded] = useState(false);

  if (!sheets) return null;

  const { loading, lastError, lastSync, refresh, isFromSheets, isConfigured } = sheets;

  const formatTime = (date) => {
    if (!date) return 'никогда';
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isFromSheets ? 'bg-green-100' : lastError ? 'bg-amber-100' : 'bg-gray-100'
          }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={
              isFromSheets ? '#16a34a' : lastError ? '#d97706' : '#6b7280'
            } strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-800">Google Sheets</div>
            <div className="text-xs text-gray-500">
              {loading ? 'Синхронизация...' :
               isFromSheets ? `Обновлено в ${formatTime(lastSync)}` :
               isConfigured ? 'Локальные данные' : 'Не настроено'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-nobilis-green border-t-transparent rounded-full animate-spin" />
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t">
          {/* Status */}
          {lastError && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">{lastError}</p>
            </div>
          )}

          {/* Data sources */}
          <div className="mt-3 space-y-2">
            <DataSourceRow label="Ученики" sheet="students" sheets={sheets} />
            <DataSourceRow label="P&L" sheet="pnl" sheets={sheets} />
            <DataSourceRow label="Зарплаты" sheet="salaryMonthly" sheets={sheets} />
            <DataSourceRow label="Продажи ОП" sheet="salaryOP" sheets={sheets} />
            <DataSourceRow label="Расходы" sheet="expenses" sheets={sheets} />
          </div>

          {/* Sync button */}
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="w-full mt-2 py-2 px-4 bg-nobilis-green text-white text-sm font-medium rounded-lg hover:bg-nobilis-green-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <I.Refresh />
                Обновить данные
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const DataSourceRow = ({ label, sheet, sheets }) => {
  const hasData = sheets.sheetsData?.[sheet] != null;
  const hasError = sheets.sheetsData?.errors?.[sheet];

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <span className={`px-2 py-0.5 rounded-full font-medium ${
        hasData ? 'bg-green-100 text-green-700' :
        hasError ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-500'
      }`}>
        {hasData ? 'Google Sheets' : hasError ? 'Ошибка' : 'Локально'}
      </span>
    </div>
  );
};

export default GoogleSheetsSync;
