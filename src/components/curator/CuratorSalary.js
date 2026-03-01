import React from 'react';
import I from '../common/Icons';
import { formatDate, getInitials } from '../../data/utils';

const CuratorSalary = ({ teachers, onConfirmLesson }) => {
  const total = teachers.reduce((sum, t) => {
    const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
    return sum + conf * t.hourlyRate;
  }, 0);
  const pending = teachers.flatMap(t =>
    t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').map(l => ({ ...l, teacher: t })) || []
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Зарплаты</h1>

      <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-6 text-white">
        <div className="text-sm text-white/70">Общий фонд за месяц</div>
        <div className="text-3xl font-bold">{total.toLocaleString()} тг</div>
      </div>

      <div className="space-y-4">
        {teachers.map(t => {
          const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
          const pend = t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
          const payment = conf * t.hourlyRate;

          return (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a68620] flex items-center justify-center text-white font-semibold">
                  {getInitials(t.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.subject}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#1a3a32]">{payment.toLocaleString()} тг</div>
                  <div className="text-sm text-gray-500">к выплате</div>
                </div>
              </div>
              <div className="px-4 pb-4 grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className="text-sm font-semibold text-gray-700">{t.hourlyRate.toLocaleString()} тг</div>
                  <div className="text-xs text-gray-400">ставка/час</div>
                </div>
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className="text-sm font-semibold text-gray-700">{conf} ч</div>
                  <div className="text-xs text-gray-400">подтверждено</div>
                </div>
                <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                  <div className={`text-sm font-semibold ${pend > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {pend > 0 ? `+${pend} ч` : '—'}
                  </div>
                  <div className="text-xs text-gray-400">ожидает</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">На подтверждение</h3>
          <div className="space-y-3">
            {pending.map(l => (
              <div key={l.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a68620] flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(l.teacher.name)}
                  </div>
                  <div>
                    <div className="font-medium">{l.teacher.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(l.date)} — {l.hours} ч</div>
                  </div>
                </div>
                <button onClick={() => onConfirmLesson(l.teacher.id, l.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1.5">
                  <I.Check /><span>Подтвердить</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorSalary;
