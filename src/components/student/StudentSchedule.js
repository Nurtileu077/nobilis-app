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
              <div className="w-28 font-medium text-nobilis-green">{x.day}</div>
              <div className="w-20 text-lg font-semibold">{x.time}</div>
              <div className="flex-1">
                <div className="font-medium">{x.subject}</div>
                <div className="text-sm text-gray-500">{t?.name || (x.isCurator ? 'Куратор' : '\u2014')}</div>
              </div>
              {x.format === 'online' ? (
                <div className="flex items-center gap-2">
                  {x.meetLink && (
                    <a href={x.meetLink} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Войти
                    </a>
                  )}
                  {!x.meetLink && <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">📹 Онлайн</span>}
                </div>
              ) : (
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{x.room ? `Каб. ${x.room}` : 'Офлайн'}</div>
              )}
              <I.Right />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSchedule;
