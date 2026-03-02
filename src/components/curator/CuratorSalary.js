import React, { useState } from 'react';
import { formatDate } from '../../data/utils';

const CuratorSalary = ({ teachers, onConfirmLesson, onUpdateTeacher }) => {
  const [editingRate, setEditingRate] = useState(null);
  const [rateValue, setRateValue] = useState('');

  const total = teachers.reduce((sum, t) => {
    const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
    return sum + conf * t.hourlyRate;
  }, 0);
  const pending = teachers.flatMap(t =>
    t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').map(l => ({ ...l, teacher: t })) || []
  );

  const startEdit = (teacher) => {
    setEditingRate(teacher.id);
    setRateValue(String(teacher.hourlyRate));
  };

  const saveRate = (teacherId) => {
    const val = parseInt(rateValue, 10);
    if (val > 0 && onUpdateTeacher) {
      onUpdateTeacher(teacherId, { hourlyRate: val });
    }
    setEditingRate(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Зарплаты</h1>

      <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-6 text-white">
        <div className="text-sm text-white/70">Общий фонд за месяц</div>
        <div className="text-3xl font-bold">{total.toLocaleString()} тг</div>
      </div>

      {/* Teacher salary cards */}
      <div className="space-y-3">
        {teachers.map(t => {
          const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
          const pend = t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0;
          return (
            <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.subject}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-[#1a3a32]">{(conf * t.hourlyRate).toLocaleString()} тг</div>
                  <div className="text-xs text-gray-400">к выплате</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Ставка: </span>
                  {editingRate === t.id ? (
                    <span className="inline-flex items-center gap-1">
                      <input type="number" value={rateValue} onChange={e => setRateValue(e.target.value)}
                        className="w-20 px-1 py-0.5 border rounded text-sm" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveRate(t.id); if (e.key === 'Escape') setEditingRate(null); }} />
                      <button onClick={() => saveRate(t.id)} className="text-green-600 font-bold text-xs">OK</button>
                      <button onClick={() => setEditingRate(null)} className="text-red-500 font-bold text-xs">✕</button>
                    </span>
                  ) : (
                    <span className="font-medium cursor-pointer hover:text-[#c9a227] transition-colors" onClick={() => startEdit(t)}>
                      {t.hourlyRate} тг/ч
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="text-gray-500">Подтв: </span>
                  <span className="font-medium">{conf} ч</span>
                </div>
                {pend > 0 && (
                  <div className="bg-yellow-50 px-3 py-1.5 rounded-lg text-yellow-700">
                    +{pend} ч ожид.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">На подтверждение</h3>
          <div className="space-y-2">
            {pending.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{l.teacher.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(l.date)} - {l.hours} ч</div>
                </div>
                <button onClick={() => onConfirmLesson(l.teacher.id, l.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0 text-sm">Подтвердить</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorSalary;
