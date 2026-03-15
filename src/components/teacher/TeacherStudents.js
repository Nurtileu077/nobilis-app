import React from 'react';
import I from '../common/Icons';
import { getInitials, getAttendancePercent } from '../../data/utils';

const TeacherStudents = ({ teacher, schedule, students, onSetSelected, onSetModal }) => {
  const myStudentIds = [...new Set(schedule.filter(s => s.teacherId === teacher.id).flatMap(s => s.students || []))];
  const myStudents = myStudentIds.map(id => students.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Мои студенты</h1>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {myStudents.map(s => {
          const lastMock = s.examResults?.filter(e => e.type.startsWith('mock_')).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          return (
            <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all"
              onClick={() => { onSetSelected(s); onSetModal('studentDetailTeacher'); }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nobilis-green to-nobilis-green-light flex items-center justify-center text-white font-semibold">
                {getInitials(s.name)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-500">{s.grade}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Посещ: <span className="font-medium">{getAttendancePercent(s.attendance)}%</span></div>
                <div className="text-sm">Пробный: <span className="font-medium text-nobilis-gold">{lastMock?.score || '\u2014'}</span></div>
              </div>
              <div className="text-right">
                {s.targetIelts && <div className="text-sm">Цель IELTS: <span className="font-medium text-blue-600">{s.targetIelts}</span></div>}
                {s.targetSat && <div className="text-sm">Цель SAT: <span className="font-medium text-purple-600">{s.targetSat}</span></div>}
              </div>
              <I.Right />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherStudents;
