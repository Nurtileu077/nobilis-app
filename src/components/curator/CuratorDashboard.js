import React from 'react';
import { formatDate, daysUntil } from '../../data/utils';
import { PACKAGE_TYPES } from '../../data/constants';

const CuratorDashboard = ({ data, onResolveTicket, onSetModal, onSetForm }) => {
  const openTix = data.supportTickets.filter(t => t.status === 'open');
  const urgent = openTix.filter(t => new Date(t.deadline) <= new Date());

  // Package expiry alerts
  const expiringPackages = [];
  data.students.forEach(s => {
    (s.packages || []).forEach(pkg => {
      if (pkg.frozen) return;
      const dl = daysUntil(pkg.endDate);
      if (dl > 0 && dl <= 14) {
        const typeInfo = PACKAGE_TYPES[pkg.type] || {};
        expiringPackages.push({ student: s, pkg, daysLeft: dl, typeName: typeInfo.name || pkg.type });
      }
    });
  });
  expiringPackages.sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Панель куратора</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-nobilis-green">{data.students.length}</div>
          <div className="text-sm text-gray-500">Студентов</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="text-3xl font-bold text-nobilis-gold">{data.teachers.length}</div>
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

      {/* Package expiry alerts */}
      {expiringPackages.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
            Скоро истекают пакеты ({expiringPackages.length})
          </h3>
          <div className="space-y-2">
            {expiringPackages.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.student.name}</div>
                  <div className="text-sm text-gray-500">{item.typeName}</div>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full flex-shrink-0 ${item.daysLeft <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {item.daysLeft} дн.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue tickets */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">!</span>
            Просроченные заявки ({urgent.length})
          </h3>
          <div className="space-y-2">
            {urgent.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded-xl gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.studentName}</div>
                  <div className="text-sm text-gray-500 truncate">{t.message}</div>
                </div>
                <button onClick={() => onResolveTicket(t.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex-shrink-0">Решить</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { onSetForm({}); onSetModal('addStudent'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Студент</button>
            <button onClick={() => { onSetForm({}); onSetModal('addTeacher'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Преподаватель</button>
            <button onClick={() => { onSetForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); onSetModal('addSchedule'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Расписание</button>
            <button onClick={() => { onSetForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); onSetModal('addMockTest'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Пробный тест</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Предстоящие тесты</h3>
          <div className="space-y-2">
            {data.mockTests.filter(t => new Date(t.date) >= new Date()).slice(0, 3).map(t => (
              <div key={t.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(t.date)}</div>
                </div>
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{t.students?.length || 0} студ.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorDashboard;
