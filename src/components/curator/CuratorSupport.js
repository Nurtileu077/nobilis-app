import React, { useState } from 'react';
import { formatDate } from '../../data/utils';

const CuratorSupport = ({ tickets, onResolveTicket }) => {
  const [tab, setTab] = useState('open');
  const open = tickets.filter(t => t.status === 'open');
  const resolved = tickets.filter(t => t.status === 'resolved');

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Поддержка</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('open')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'open' ? 'bg-[#1a3a32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Открытые ({open.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'history' ? 'bg-[#1a3a32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          История ({resolved.length})
        </button>
      </div>

      {tab === 'open' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          {open.length > 0 ? (
            <div className="space-y-3">
              {open.map(t => {
                const overdue = new Date(t.deadline) <= new Date();
                return (
                  <div key={t.id} className={`p-4 rounded-xl border ${overdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-100'}`}>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">{t.studentName}</div>
                      <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-yellow-600'}`}>
                        {overdue ? 'Просрочено' : `До: ${formatDate(t.deadline)}`}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{t.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Создано: {formatDate(t.created)}</span>
                      <button onClick={() => onResolveTicket(t.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Решить</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-500 text-center py-4">Нет открытых заявок</p>}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          {resolved.length > 0 ? (
            <div className="space-y-3">
              {resolved.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{t.studentName}</div>
                    <span className="text-sm text-green-600 font-medium">Решено</span>
                  </div>
                  <p className="text-gray-600 mb-2">{t.message}</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Создано: {formatDate(t.created)}</span>
                    {t.resolvedDate && <span>Решено: {formatDate(t.resolvedDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-4">Нет решенных заявок</p>}
        </div>
      )}
    </div>
  );
};

export default CuratorSupport;
