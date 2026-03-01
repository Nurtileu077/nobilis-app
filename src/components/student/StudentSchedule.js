import React from 'react';
import I from '../common/Icons';
import { DAYS_ORDER } from '../../data/constants';

const StudentSchedule = ({ student, schedule, teachers, onSetSelected, onSetModal }) => {
  const mySchedule = schedule.filter(x => x.students?.includes(student.id));
  const sorted = [...mySchedule].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day));

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Моё расписание</h1>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {sorted.map(x => {
          const t = teachers.find(y => y.id === x.teacherId);
          return (
            <div key={x.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => { onSetSelected(x); onSetModal('scheduleDetail'); }}>
              <div className="w-28 font-medium text-[#1a3a32]">{x.day}</div>
              <div className="w-20 text-lg font-semibold">{x.time}</div>
              <div className="flex-1">
                <div className="font-medium">{x.subject}</div>
                <div className="text-sm text-gray-500">{t?.name || (x.isCurator ? 'Куратор' : '\u2014')}</div>
              </div>
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">Каб. {x.room}</div>
              <I.Right />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSchedule;
