import React from 'react';
import { formatDate } from '../../data/utils';

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
        <div className="text-3xl font-bold">{total.toLocaleString()} \u20B8</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Преподаватель</th>
              <th className="text-right p-4">Ставка</th>
              <th className="text-right p-4">Часы (подтв.)</th>
              <th className="text-right p-4">К выплате</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => {
              const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
              const pend = t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
              return (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4"><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{t.subject}</div></td>
                  <td className="p-4 text-right">{t.hourlyRate} \u20B8</td>
                  <td className="p-4 text-right">{conf} ч {pend > 0 && <span className="text-yellow-600">(+{pend} ожид.)</span>}</td>
                  <td className="p-4 text-right font-bold text-[#1a3a32]">{(conf * t.hourlyRate).toLocaleString()} \u20B8</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">На подтверждение</h3>
          <div className="space-y-2">
            {pending.map(l => (
              <div key={l.id} className="flex justify-between p-3 bg-yellow-50 rounded-xl">
                <div>
                  <div className="font-medium">{l.teacher.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(l.date)} &bull; {l.hours} ч</div>
                </div>
                <button onClick={() => onConfirmLesson(l.teacher.id, l.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Подтвердить</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorSalary;
