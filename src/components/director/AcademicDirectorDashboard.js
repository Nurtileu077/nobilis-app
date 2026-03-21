import React from 'react';
import I from '../common/Icons';
import { getInitials } from '../../data/utils';
import { STUDENT_STATUSES } from '../../data/constants';

const DAYS_ORDER = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const getNextClasses = (schedule, count = 5) => {
  if (!schedule?.length) return [];
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ...
  // Map JS day index to DAYS_ORDER index (Mon=0 ... Sun=6)
  const jsToDaysOrder = [6, 0, 1, 2, 3, 4, 5];
  const todayIdx = jsToDaysOrder[today];

  const withOffset = schedule.map(item => {
    const dayIdx = DAYS_ORDER.indexOf(item.day);
    const offset = dayIdx >= 0 ? (dayIdx - todayIdx + 7) % 7 : 99;
    return { ...item, _offset: offset, _dayIdx: dayIdx };
  });

  return withOffset
    .sort((a, b) => a._offset - b._offset || a.time.localeCompare(b.time))
    .slice(0, count);
};

const AcademicDirectorDashboard = ({ data, onSetModal, onSetForm, onSetSelected }) => {
  const students = data.students || [];
  const teachers = data.teachers || [];
  const schedule = data.schedule || [];
  const mockTests = data.mockTests || [];
  const globalTasks = data.globalTasks || [];

  const upcomingMockTests = mockTests.filter(t => new Date(t.date) >= new Date());
  const nextClasses = getNextClasses(schedule, 5);

  // Student counts by status
  const statusCounts = Object.keys(STUDENT_STATUSES).reduce((acc, key) => {
    acc[key] = students.filter(s => s.status === key).length;
    return acc;
  }, {});

  // Pending global tasks
  const pendingTasks = globalTasks.filter(t => !t.done);
  const urgentTasks = pendingTasks.filter(t => t.urgent);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Панель академического директора</h1>
          <p className="text-gray-500 text-sm mt-0.5">Управление преподавателями, кураторами и координаторами</p>
        </div>
        <button
          onClick={() => { onSetForm({}); onSetModal('addTeacher'); }}
          className="flex items-center gap-2 px-4 py-2 bg-nobilis-green text-white rounded-xl text-sm font-medium hover:bg-nobilis-green-light transition-colors"
        >
          <I.Plus />
          <span className="hidden sm:inline">Добавить преподавателя</span>
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-nobilis-green/10 flex items-center justify-center text-nobilis-green">
              <I.Users />
            </div>
            <span className="text-sm text-gray-500 font-medium">Всего студентов</span>
          </div>
          <div className="text-3xl font-bold text-nobilis-green">{students.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-nobilis-gold/10 flex items-center justify-center text-nobilis-gold">
              <I.Book />
            </div>
            <span className="text-sm text-gray-500 font-medium">Преподавателей</span>
          </div>
          <div className="text-3xl font-bold text-nobilis-gold">{teachers.length}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <I.MockTest />
            </div>
            <span className="text-sm text-gray-500 font-medium">Предстоящих тестов</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{upcomingMockTests.length}</div>
        </div>
      </div>

      {/* Urgent tasks alert */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
            Срочные задачи ({urgentTasks.length})
          </h3>
          <div className="space-y-2">
            {urgentTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-xl gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{task.title}</div>
                  <div className="text-sm text-gray-500 truncate">{task.assigneeName}</div>
                </div>
                <span className="text-xs text-red-600 font-medium flex-shrink-0 bg-red-100 px-2 py-1 rounded-full">
                  {task.deadline}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Teacher Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <I.Results />
              Преподаватели
            </h3>
            <span className="text-sm text-gray-400">{teachers.length} чел.</span>
          </div>
          {teachers.length > 0 ? (
            <div className="space-y-3">
              {teachers.map(teacher => {
                return (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all card-hover"
                    onClick={() => { onSetSelected(teacher); onSetModal('teacherDetail'); }}
                  >
                    <div className="w-9 h-9 rounded-full bg-nobilis-green text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getInitials(teacher.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{teacher.name}</div>
                      <div className="text-xs text-gray-500 truncate">{teacher.subject}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-nobilis-green">{teacher.hoursWorked || 0} ч.</div>
                      <div className="text-xs text-nobilis-gold">{(teacher.hourlyRate || 0).toLocaleString()} тг/ч</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">Нет преподавателей</p>
          )}
          <button
            onClick={() => { onSetForm({}); onSetModal('addTeacher'); }}
            className="mt-4 w-full py-2 border border-dashed border-nobilis-green/30 text-nobilis-green rounded-xl text-sm hover:bg-nobilis-green/5 transition-colors flex items-center justify-center gap-1"
          >
            <I.Plus />
            Добавить преподавателя
          </button>
        </div>

        {/* Student Progress Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <I.Users />
              Прогресс студентов
            </h3>
            <span className="text-sm text-gray-400">{students.length} всего</span>
          </div>
          <div className="space-y-2">
            {Object.entries(STUDENT_STATUSES).map(([key, info]) => {
              const count = statusCounts[key] || 0;
              if (count === 0) return null;
              const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-600 flex-shrink-0 truncate">{info.name}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: info.color }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 min-w-[2rem] text-center"
                    style={{ backgroundColor: info.bg, color: info.color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
            {students.length === 0 && (
              <p className="text-gray-400 text-center py-4">Нет данных</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <div className="font-bold text-[#10b981]">{statusCounts.active || 0}</div>
              <div className="text-gray-400 text-xs">Активных</div>
            </div>
            <div>
              <div className="font-bold text-[#ef4444]">{statusCounts.refund || 0}</div>
              <div className="text-gray-400 text-xs">Возвратов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <I.Calendar />
            Ближайшие занятия
          </h3>
          <button
            onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
            className="text-sm text-nobilis-green hover:underline flex items-center gap-1"
          >
            <I.Plus />
            Добавить
          </button>
        </div>
        {nextClasses.length > 0 ? (
          <div className="space-y-2">
            {nextClasses.map(cls => {
              const teacher = teachers.find(t => t.id === cls.teacherId);
              return (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all card-hover"
                  onClick={() => { onSetSelected(cls); onSetModal('scheduleDetail'); }}
                >
                  <div className="w-20 flex-shrink-0">
                    <div className="text-xs text-gray-400 truncate">{cls.day}</div>
                    <div className="font-semibold text-nobilis-green">{cls.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{cls.subject}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {teacher ? teacher.name.split(' ').slice(0, 2).join(' ') : 'Куратор'} &bull; Каб. {cls.room}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {cls.students?.length || 0} студ.
                    </span>
                    <I.Right />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">Нет предстоящих занятий</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => { onSetForm({}); onSetModal('addTeacher'); }}
            className="p-4 bg-nobilis-green/5 rounded-xl hover:bg-nobilis-green/10 text-left transition-all card-hover"
          >
            <div className="text-nobilis-green mb-1"><I.Users /></div>
            <div className="text-sm font-medium text-gray-700">+ Преподаватель</div>
          </button>
          <button
            onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }}
            className="p-4 bg-nobilis-gold/5 rounded-xl hover:bg-nobilis-gold/10 text-left transition-all card-hover"
          >
            <div className="text-nobilis-gold mb-1"><I.Calendar /></div>
            <div className="text-sm font-medium text-gray-700">+ Расписание</div>
          </button>
          <button
            onClick={() => { onSetForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); onSetModal('addMockTest'); }}
            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 text-left transition-all card-hover"
          >
            <div className="text-blue-600 mb-1"><I.MockTest /></div>
            <div className="text-sm font-medium text-gray-700">+ Пробный тест</div>
          </button>
          <button
            onClick={() => { onSetForm({}); onSetModal('addTask'); }}
            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 text-left transition-all card-hover"
          >
            <div className="text-purple-600 mb-1"><I.Tasks /></div>
            <div className="text-sm font-medium text-gray-700">+ Задача</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicDirectorDashboard;
