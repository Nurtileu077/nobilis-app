import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const TeacherLessons = ({ teacher, schedule, students, onSetModal, onSetForm, onMarkAtt, attendance }) => {
  const mySchedule = schedule.filter(s => s.teacherId === teacher.id);

  const statusLabel = (s) => s === 'conducted' ? 'Проведён' : s === 'cancelled' ? 'Отменён' : 'Перенесён';
  const statusStyle = (s) => s === 'conducted' ? 'bg-green-100 text-green-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Мои уроки</h1>
        <button onClick={() => {
          onSetForm({ date: new Date().toISOString().split('T')[0], scheduleId: mySchedule[0]?.id || '', status: 'conducted', hours: 1.5, note: '' });
          onSetModal('addLesson');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Отметить</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <div className="text-2xl font-bold text-[#1a3a32]">{teacher.totalLessons || 0}</div>
          <div className="text-xs text-gray-500">Проведено</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <div className="text-2xl font-bold text-[#c9a227]">{teacher.hoursWorked || 0}</div>
          <div className="text-xs text-gray-500">Часов</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">{teacher.lessons?.filter(l => !l.confirmed).length || 0}</div>
          <div className="text-xs text-gray-500">Ожидают</div>
        </div>
      </div>

      {/* Lessons list as cards */}
      <div className="space-y-3">
        {teacher.lessons?.sort((a, b) => new Date(b.date) - new Date(a.date)).map(l => {
          const sch = schedule.find(s => s.id === l.scheduleId);
          return (
            <div key={l.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{sch?.subject || '\u2014'}</div>
                  <div className="text-sm text-gray-500">{formatDate(l.date)}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle(l.status)}`}>
                    {statusLabel(l.status)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {l.status === 'conducted' && (
                  <span className="bg-gray-50 px-2 py-1 rounded text-gray-600">{l.hours} ч</span>
                )}
                <span className={`px-2 py-1 rounded ${l.confirmed ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {l.confirmed ? 'Подтверждён' : 'Ожидает'}
                </span>
                {l.note && <span className="text-gray-400 text-xs">{l.note}</span>}
              </div>
            </div>
          );
        })}
        {(!teacher.lessons || teacher.lessons.length === 0) && (
          <div className="text-center py-12 text-gray-500">Нет отмеченных уроков</div>
        )}
      </div>
    </div>
  );
};

export default TeacherLessons;
