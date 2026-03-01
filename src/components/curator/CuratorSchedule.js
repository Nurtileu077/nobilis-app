import React from 'react';
import I from '../common/Icons';
import { DAYS_ORDER } from '../../data/constants';

const CuratorSchedule = ({ schedule, teachers, onSetModal, onSetForm, onSetSelected, onDelSchedule }) => {
  const sorted = [...schedule].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day) || a.time.localeCompare(b.time));

  // Group by day
  const grouped = {};
  sorted.forEach(s => {
    if (!grouped[s.day]) grouped[s.day] = [];
    grouped[s.day].push(s);
  });

  const dayColors = {
    'Понедельник': 'border-l-blue-500',
    'Вторник': 'border-l-purple-500',
    'Среда': 'border-l-green-500',
    'Четверг': 'border-l-yellow-500',
    'Пятница': 'border-l-red-500',
    'Суббота': 'border-l-indigo-500',
    'Воскресенье': 'border-l-pink-500',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Расписание</h1>
        <button onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
          className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{day}</h3>
            <div className="space-y-3">
              {items.map(s => {
                const t = teachers.find(x => x.id === s.teacherId);
                return (
                  <div key={s.id} className={`bg-white rounded-xl shadow-sm border border-l-4 ${dayColors[day] || 'border-l-gray-500'} p-4 hover:shadow-md transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-[#1a3a32]">{s.time}</div>
                        <div className="text-xs text-gray-400">{s.duration} мин</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{s.subject}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{t?.name || (s.isCurator ? 'Куратор' : '—')}</span>
                          <span className="text-gray-300">|</span>
                          <span>Каб. {s.room}</span>
                        </div>
                      </div>
                      <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{s.students?.length || 0} студ.</span>
                      <div className="flex gap-1">
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
        {sorted.length === 0 && (
          <div className="text-center text-gray-500 py-8">Нет занятий в расписании</div>
        )}
      </div>
    </div>
  );
};

export default CuratorSchedule;
