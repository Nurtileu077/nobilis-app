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
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">Каб. {s.room}</span>
              </div>
              <div className="text-lg font-semibold text-[#1a3a32] mb-2 cursor-pointer"
                onClick={() => { onSetSelected(s); onSetModal('scheduleDetail'); }}>
                {s.subject}
              </div>
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
