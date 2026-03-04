import React from 'react';
import I from '../common/Icons';

const TeacherDashboard = ({ teacher, schedule, onSetSelected, onSetModal }) => {
  const mySchedule = schedule.filter(s => s.teacherId === teacher.id);
  const pending = teacher.lessons?.filter(l => !l.confirmed) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Привет, {teacher.name.split(' ')[0]}!</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#1a3a32]">{teacher.hoursWorked}</div>
          <div className="text-sm text-gray-500">Часов (подтв.)</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#c9a227]">{teacher.totalLessons}</div>
          <div className="text-sm text-gray-500">Уроков</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-blue-600">{mySchedule.length}</div>
          <div className="text-sm text-gray-500">Занятий/нед</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-green-600">{teacher.hourlyRate}</div>
          <div className="text-sm text-gray-500">тг/ч</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h3 className="font-semibold text-yellow-700 mb-2">Ожидают подтверждения: {pending.length} уроков</h3>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Расписание</h3>
        {mySchedule.length > 0 ? (
          <div className="space-y-2">
            {mySchedule.map(s => (
              <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover transition-all"
                onClick={() => { onSetSelected(s); onSetModal('scheduleDetail'); }}>
                <div>
                  <div className="font-medium">{s.day} {s.time}</div>
                  <div className="text-sm text-gray-500">{s.subject} &bull; Каб. {s.room}</div>
                </div>
                <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">{s.students?.length || 0} студ.</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет занятий</p>}
      </div>
    </div>
  );
};

export default TeacherDashboard;
