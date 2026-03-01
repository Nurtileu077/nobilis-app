import React, { useState } from 'react';
import { formatDate, formatDateTime } from '../../data/utils';

const CuratorSupport = ({ tickets, onResolveTicket }) => {
  const [showResolved, setShowResolved] = useState(false);
  const open = tickets.filter(t => t.status === 'open');
  const resolved = tickets.filter(t => t.status === 'resolved');

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Поддержка</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className={`text-3xl font-bold ${open.length > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{open.length}</div>
          <div className="text-sm text-gray-500">Открытых</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="text-3xl font-bold text-gray-400">{resolved.length}</div>
          <div className="text-sm text-gray-500">Решённых</div>
        </div>
      </div>

      {/* Open tickets */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Открытые заявки ({open.length})</h3>
        {open.length > 0 ? (
          <div className="space-y-3">
            {open.map(t => {
              const overdue = new Date(t.deadline) <= new Date();
              return (
                <div key={t.id} className={`p-4 rounded-xl ${overdue ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-100'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="font-medium">{t.studentName}</div>
                    <span className={`text-sm flex-shrink-0 ${overdue ? 'text-red-600 font-semibold' : 'text-yellow-600'}`}>
                      {overdue ? 'Просрочено!' : `До: ${formatDate(t.deadline)}`}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{t.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatDateTime(t.created)}</span>
                    <button onClick={() => onResolveTicket(t.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">Решить</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет открытых заявок</p>}
      </div>

      {/* Resolved tickets history */}
      {resolved.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <button onClick={() => setShowResolved(!showResolved)} className="w-full flex items-center justify-between">
            <h3 className="text-lg font-semibold">История решённых ({resolved.length})</h3>
            <span className="text-gray-400 text-sm">{showResolved ? 'Скрыть' : 'Показать'}</span>
          </button>
          {showResolved && (
            <div className="space-y-2 mt-4">
              {resolved.map(t => (
                <div key={t.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{t.studentName}</div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Решено</span>
                  </div>
                  <p className="text-sm text-gray-500">{t.message}</p>
                  <div className="text-xs text-gray-400 mt-1">{formatDateTime(t.created)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CuratorSupport;
