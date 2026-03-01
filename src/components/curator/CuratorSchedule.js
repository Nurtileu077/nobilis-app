import React from 'react';
import I from '../common/Icons';
import { DAYS_ORDER } from '../../data/constants';

const CuratorSchedule = ({ schedule, teachers, onSetModal, onSetForm, onSetSelected, onDelSchedule }) => {
  const sorted = [...schedule].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day) || a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Расписание</h1>
        <button onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
          className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {sorted.map(s => {
          const t = teachers.find(x => x.id === s.teacherId);
          return (
            <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all">
              <div className="w-28 font-medium text-[#1a3a32]">{s.day}</div>
              <div className="w-16 font-semibold">{s.time}</div>
              <div className="flex-1">
                <div className="font-medium">{s.subject}</div>
                <div className="text-sm text-gray-500">{t?.name || (s.isCurator ? 'Куратор' : '\u2014')}</div>
              </div>
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{s.students?.length || 0} студ.</div>
              <div className="flex gap-2">
                <button onClick={() => { onSetForm(s); onSetSelected(s); onSetModal('editSchedule'); }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
                <button onClick={() => { if (window.confirm('Удалить?')) onDelSchedule(s.id); }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CuratorSchedule;
