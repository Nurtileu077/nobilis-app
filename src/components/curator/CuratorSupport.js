import React from 'react';
import { formatDate } from '../../data/utils';

const CuratorSupport = ({ tickets, onResolveTicket }) => {
  const open = tickets.filter(t => t.status === 'open');

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Поддержка</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Открытые ({open.length})</h3>
        {open.length > 0 ? (
          <div className="space-y-3">
            {open.map(t => {
              const overdue = new Date(t.deadline) <= new Date();
              return (
                <div key={t.id} className={`p-4 rounded-xl ${overdue ? 'bg-red-50 border border-red-200' : 'bg-yellow-50'}`}>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{t.studentName}</div>
                    <span className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-yellow-600'}`}>
                      {overdue ? 'Просрочено!' : `До: ${formatDate(t.deadline)}`}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{t.message}</p>
                  <button onClick={() => onResolveTicket(t.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Решить</button>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет открытых заявок {'\u{1F389}'}</p>}
      </div>
    </div>
  );
};

export default CuratorSupport;
