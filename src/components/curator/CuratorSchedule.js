import React from 'react';
import I from '../common/Icons';
import { DAYS_ORDER } from '../../data/constants';

const CuratorSchedule = ({ schedule, teachers, onSetModal, onSetForm, onSetSelected, onDelSchedule }) => {
  const sorted = [...schedule].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day) || a.time.localeCompare(b.time));

  // Group by day
  const byDay = {};
  sorted.forEach(s => {
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(s);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Расписание</h1>
        <button onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
          className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      {DAYS_ORDER.filter(d => byDay[d]?.length > 0).map(day => (
        <div key={day}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{day}</h3>
          <div className="space-y-3">
            {byDay[day].map(s => {
              const t = teachers.find(x => x.id === s.teacherId);
              return (
                <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-nobilis-green text-lg">{s.time}</span>
                        <span className="text-sm text-gray-400">{s.duration} мин</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Каб. {s.room}</span>
                      </div>
                      <div className="font-medium text-gray-800">{s.subject}</div>
                      <div className="text-sm text-gray-500 mt-1">{t?.name || (s.isCurator ? 'Куратор' : '\u2014')}</div>
                      <div className="text-xs text-gray-400 mt-1">{s.students?.length || 0} студентов</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { onSetForm(s); onSetSelected(s); onSetModal('editSchedule'); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
                      <button onClick={() => { if (window.confirm('Удалить?')) onDelSchedule(s.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sorted.length === 0 && <div className="text-center py-12 text-gray-500">Нет занятий в расписании</div>}
    </div>
  );
};

export default CuratorSchedule;
