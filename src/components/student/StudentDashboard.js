import React from 'react';
import I from '../common/Icons';
import { daysBetween, formatDate, getAttendancePercent } from '../../data/utils';
import { DAYS_RU } from '../../data/constants';

const StudentDashboard = ({ student, schedule, teachers, onSetModal, onSetForm, onSetSelected }) => {
  const days = daysBetween(student.joinDate, new Date());
  const mySchedule = schedule.filter(x => x.students?.includes(student.id));
  const today = DAYS_RU[new Date().getDay()];
  const todayClasses = mySchedule.filter(x => x.day === today);
  const deadlines = Object.entries(student.deadlines || {})
    .map(([k, v]) => ({ type: k, date: v, d: daysBetween(new Date(), v) }))
    .filter(x => x.d > 0 && x.d <= 60)
    .sort((a, b) => a.d - b.d);
  const lastExam = student.examResults?.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Привет, {student.name.split(' ')[0]}! {'\u{1F44B}'}</h1>
          <p className="text-gray-500">{days === 0 ? 'Добро пожаловать!' : `${days} дней с нами`}</p>
        </div>
        <button onClick={() => { onSetModal('support'); onSetForm({}); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Support /><span>Поддержка</span>
        </button>
      </div>

      {todayClasses.length > 0 && (
        <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2"><I.Bell /><span className="font-semibold">Сегодня занятия:</span></div>
          <div className="space-y-2">
            {todayClasses.map(c => {
              const t = teachers.find(x => x.id === c.teacherId);
              return (
                <div key={c.id} className="bg-white/10 rounded-xl p-3 flex justify-between cursor-pointer hover:bg-white/20 transition-all card-hover"
                  onClick={() => { onSetSelected(c); onSetModal('scheduleDetail'); }}>
                  <div>
                    <div className="font-medium">{c.subject}</div>
                    <div className="text-sm text-white/70">{c.time} &bull; Каб. {c.room} {t ? `\u2022 ${t.name.split(' ')[0]}` : ''}</div>
                  </div>
                  <I.Right />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {deadlines.length > 0 && (
        <div className={`rounded-2xl p-4 ${deadlines[0].d <= 30 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <h3 className="font-semibold mb-2">{deadlines[0].d <= 30 ? '\u26A0\uFE0F' : '\u{1F4C5}'} Ближайшие дедлайны</h3>
          <div className="space-y-2">
            {deadlines.slice(0, 3).map(x => (
              <div key={x.type} className="flex justify-between">
                <span>{x.type.toUpperCase()}</span>
                <span className={`font-medium ${x.d <= 30 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {formatDate(x.date)} ({x.d} дн)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#1a3a32]">{getAttendancePercent(student.attendance)}%</div>
          <div className="text-sm text-gray-500">Посещаемость</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#c9a227]">{lastExam?.score || '\u2014'}</div>
          <div className="text-sm text-gray-500">Последний экзамен</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-emerald-600">{student.testResult ? '\u2713' : '\u2014'}</div>
          <div className="text-sm text-gray-500">Профориентация</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-xl font-bold text-blue-600 truncate">{student.targetUniversities?.[0] || '\u2014'}</div>
          <div className="text-sm text-gray-500">Целевой ВУЗ</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Моё расписание</h3>
        <div className="space-y-2">
          {mySchedule.length > 0 ? mySchedule.map(x => {
            const t = teachers.find(y => y.id === x.teacherId);
            return (
              <div key={x.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all card-hover"
                onClick={() => { onSetSelected(x); onSetModal('scheduleDetail'); }}>
                <div className="w-24 text-sm text-gray-500">{x.day}</div>
                <div className="w-16 font-medium">{x.time}</div>
                <div className="flex-1">{x.subject}</div>
                <div className="text-sm text-gray-500">Каб. {x.room}</div>
                <I.Right />
              </div>
            );
          }) : <p className="text-gray-500 text-center py-4">Нет занятий</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
