import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';
import { PACKAGE_TYPES } from '../../data/constants';

const CuratorDashboard = ({ data, onResolveTicket, onSetModal, onSetForm }) => {
  const openTix = data.supportTickets.filter(t => t.status === 'open');
  const urgent = openTix.filter(t => new Date(t.deadline) <= new Date());

  // Find students with expiring packages (within 14 days)
  const expiringPackages = [];
  data.students.forEach(s => {
    (s.packages || []).forEach(pkg => {
      const days = Math.ceil((new Date(pkg.dateTo) - new Date()) / 86400000);
      if (days <= 14 && days > 0) {
        expiringPackages.push({ student: s, pkg, days });
      }
    });
  });

  // Frozen students count
  const frozenCount = data.students.filter(s => s.freeze).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Панель куратора</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#1a3a32]">{data.students.length}</div>
          <div className="text-sm text-gray-500">Студентов</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-[#c9a227]">{data.teachers.length}</div>
          <div className="text-sm text-gray-500">Преподавателей</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-blue-600">{data.schedule.length}</div>
          <div className="text-sm text-gray-500">Занятий</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className={`text-3xl font-bold ${urgent.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{openTix.length}</div>
          <div className="text-sm text-gray-500">Заявок</div>
        </div>
      </div>

      {/* Expiring packages warning */}
      {expiringPackages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <I.Warning />
            <h3 className="font-semibold text-red-700">Истекающие пакеты</h3>
          </div>
          <div className="space-y-2">
            {expiringPackages.map(({ student, pkg, days }) => {
              const type = PACKAGE_TYPES[pkg.type] || { label: pkg.type };
              return (
                <div key={`${student.id}-${pkg.id}`} className="flex justify-between items-center p-3 bg-white rounded-xl">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{type.label} — осталось {days} дн.</div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {pkg.totalLessons - pkg.completedLessons} занятий ост.
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overdue tickets */}
      {urgent.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <I.Warning />
            <h3 className="font-semibold text-orange-700">Просроченные заявки</h3>
          </div>
          <div className="space-y-2">
            {urgent.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-white rounded-xl">
                <div>
                  <div className="font-medium">{t.studentName}</div>
                  <div className="text-sm text-gray-500">{t.message}</div>
                </div>
                <button onClick={() => onResolveTicket(t.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Решить</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { onSetForm({}); onSetModal('addStudent'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left transition-all card-hover">
              <div className="font-medium text-[#1a3a32]">+ Студент</div>
              <div className="text-xs text-gray-400 mt-1">{data.students.length} всего</div>
            </button>
            <button onClick={() => { onSetForm({}); onSetModal('addTeacher'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left transition-all card-hover">
              <div className="font-medium text-[#1a3a32]">+ Преподаватель</div>
              <div className="text-xs text-gray-400 mt-1">{data.teachers.length} всего</div>
            </button>
            <button onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left transition-all card-hover">
              <div className="font-medium text-[#1a3a32]">+ Расписание</div>
              <div className="text-xs text-gray-400 mt-1">{data.schedule.length} занятий</div>
            </button>
            <button onClick={() => { onSetForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); onSetModal('addMockTest'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left transition-all card-hover">
              <div className="font-medium text-[#1a3a32]">+ Пробный тест</div>
              <div className="text-xs text-gray-400 mt-1">{data.mockTests.length} тестов</div>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Предстоящие тесты</h3>
          <div className="space-y-2">
            {data.mockTests.filter(t => new Date(t.date) >= new Date()).slice(0, 3).map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(t.date)}</div>
                </div>
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{t.students?.length || 0} студ.</span>
              </div>
            ))}
            {data.mockTests.filter(t => new Date(t.date) >= new Date()).length === 0 && (
              <p className="text-gray-500 text-center py-4">Нет предстоящих тестов</p>
            )}
          </div>
        </div>
      </div>

      {/* Frozen students info */}
      {frozenCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <I.Pause />
            <span className="text-blue-700 font-medium">Замороженных студентов: {frozenCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorDashboard;
