import React from 'react';
import I from '../common/Icons';
import { daysBetween, formatDate, getAttendancePercent, getPackageProgress } from '../../data/utils';
import { DAYS_RU, PACKAGE_TYPES, SUPPORT_STAGES } from '../../data/constants';

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
          <h1 className="text-2xl font-bold text-gray-800">Привет, {student.name.split(' ')[0]}!</h1>
          <p className="text-gray-500">{days === 0 ? 'Добро пожаловать!' : `${days} дней с нами`}</p>
        </div>
        <button onClick={() => { onSetModal('support'); onSetForm({}); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Support /><span className="hidden sm:inline">Поддержка</span>
        </button>
      </div>

      {todayClasses.length > 0 && (
        <div className="bg-gradient-to-r from-nobilis-green to-nobilis-green-light rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2"><I.Bell /><span className="font-semibold">Сегодня занятия:</span></div>
          <div className="space-y-2">
            {todayClasses.map(c => {
              const t = teachers.find(x => x.id === c.teacherId);
              return (
                <div key={c.id} className="bg-white/10 rounded-xl p-3 flex justify-between cursor-pointer hover:bg-white/20 transition-all card-hover"
                  onClick={() => { onSetSelected(c); onSetModal('scheduleDetail'); }}>
                  <div>
                    <div className="font-medium">{c.subject}</div>
                    <div className="text-sm text-white/70">{c.time} - Каб. {c.room} {t ? `- ${t.name.split(' ')[0]}` : ''}</div>
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
          <h3 className="font-semibold mb-2">Ближайшие дедлайны</h3>
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
          <div className="text-3xl font-bold text-nobilis-green">{getAttendancePercent(student.attendance)}%</div>
          <div className="text-sm text-gray-500">Посещаемость</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-nobilis-gold">{lastExam?.score || '\u2014'}</div>
          <div className="text-sm text-gray-500">Последний экзамен</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-lg font-bold text-emerald-600 truncate">{student.testResult || '\u2014'}</div>
          <div className="text-sm text-gray-500">Профориентация</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-xl font-bold text-blue-600 truncate">{student.targetUniversities?.[0] || '\u2014'}</div>
          <div className="text-sm text-gray-500">Целевой ВУЗ</div>
        </div>
      </div>

      {/* My Packages */}
      {student.packages?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Мои пакеты</h3>
          <div className="space-y-3">
            {student.packages.map(pkg => {
              const typeInfo = PACKAGE_TYPES[pkg.type] || {};
              const prog = getPackageProgress(pkg, SUPPORT_STAGES);
              return (
                <div key={pkg.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: typeInfo.color || '#6b7280' }}>
                        {typeInfo.name || pkg.type}
                      </span>
                      {pkg.frozen && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Заморожен</span>}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${prog.percent}%`, backgroundColor: typeInfo.color || '#6b7280' }} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{prog.text}</span>
                    <span className="font-medium" style={{ color: typeInfo.color }}>{prog.percent}%</span>
                  </div>
                  {pkg.type !== 'support' && (
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Всего: {pkg.totalLessons}</span>
                      <span>Проведено: {pkg.completedLessons || 0}</span>
                      <span>Осталось: {(pkg.totalLessons || 0) - (pkg.completedLessons || 0) - (pkg.missedLessons || 0)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Моё расписание</h3>
        <div className="space-y-2">
          {mySchedule.length > 0 ? mySchedule.map(x => {
            return (
              <div key={x.id} className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all card-hover"
                onClick={() => { onSetSelected(x); onSetModal('scheduleDetail'); }}>
                <div className="w-20 sm:w-24 text-sm text-gray-500">{x.day}</div>
                <div className="w-14 sm:w-16 font-medium">{x.time}</div>
                <div className="flex-1 truncate">{x.subject}</div>
                <div className="text-sm text-gray-500 hidden sm:block">Каб. {x.room}</div>
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
