import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const TeacherLessons = ({ teacher, schedule, onSetModal, onSetForm }) => {
  const mySchedule = schedule.filter(s => s.teacherId === teacher.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Мои уроки</h1>
        <button onClick={() => {
          onSetForm({ date: new Date().toISOString().split('T')[0], scheduleId: mySchedule[0]?.id || '', status: 'conducted', hours: 1.5, note: '' });
          onSetModal('addLesson');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Отметить урок</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Дата</th>
              <th className="text-left p-4">Занятие</th>
              <th className="text-left p-4">Статус</th>
              <th className="text-right p-4">Часы</th>
              <th className="text-center p-4">Подтв.</th>
            </tr>
          </thead>
          <tbody>
            {teacher.lessons?.sort((a, b) => new Date(b.date) - new Date(a.date)).map(l => {
              const sch = schedule.find(s => s.id === l.scheduleId);
              return (
                <tr key={l.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4">{formatDate(l.date)}</td>
                  <td className="p-4">{sch?.subject || '\u2014'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      l.status === 'conducted' ? 'bg-green-100 text-green-700'
                        : l.status === 'cancelled' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {l.status === 'conducted' ? 'Проведён' : l.status === 'cancelled' ? 'Отменён' : 'Перенесён'}
                    </span>
                    {l.note && <div className="text-xs text-gray-500 mt-1">{l.note}</div>}
                  </td>
                  <td className="p-4 text-right">{l.hours} ч</td>
                  <td className="p-4 text-center">
                    {l.confirmed ? <span className="text-green-600">\u2713</span> : <span className="text-yellow-600">\u231B</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherLessons;
