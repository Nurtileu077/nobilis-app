import React from 'react';
import { DAYS_ORDER } from '../../data/constants';

const TeacherSchedule = ({ teacher, schedule, students, onSetSelected, onSetModal }) => {
  const mySchedule = schedule.filter(s => s.teacherId === teacher.id);
  const sorted = [...mySchedule].sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day));

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Моё расписание</h1>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {sorted.map(s => {
          const studs = s.students?.map(id => students.find(st => st.id === id)).filter(Boolean) || [];
          return (
            <div key={s.id} className="p-4 border-b hover:bg-gray-50 transition-all">
              <div className="flex justify-between mb-2 cursor-pointer"
                onClick={() => { onSetSelected(s); onSetModal('scheduleDetail'); }}>
                <div className="font-medium">{s.day} {s.time}</div>
                {s.format === 'online' ? (
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">📹 Онлайн</span>
                ) : (
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{s.room ? `Каб. ${s.room}` : 'Офлайн'}</span>
                )}
              </div>
              <div className="text-lg font-semibold text-nobilis-green mb-2 cursor-pointer"
                onClick={() => { onSetSelected(s); onSetModal('scheduleDetail'); }}>
                {s.subject}
              </div>
              {s.format === 'online' && s.meetLink && (
                <a href={s.meetLink} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 mb-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Подключиться к видеовстрече
                </a>
              )}
              <div className="flex flex-wrap gap-2">
                {studs.map(st => (
                  <button key={st.id}
                    onClick={(e) => { e.stopPropagation(); onSetSelected(st); onSetModal('studentDetailTeacher'); }}
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors cursor-pointer">
                    {st.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="p-8 text-center text-gray-500">Нет занятий</div>}
      </div>
    </div>
  );
};

export default TeacherSchedule;
