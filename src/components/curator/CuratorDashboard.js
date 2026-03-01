import React from 'react';
import { formatDate } from '../../data/utils';

const CuratorDashboard = ({ data, onResolveTicket, onSetModal, onSetForm }) => {
  const openTix = data.supportTickets.filter(t => t.status === 'open');
  const urgent = openTix.filter(t => new Date(t.deadline) <= new Date());

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

      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-semibold text-red-700 mb-3">\u26A0\uFE0F Просроченные заявки</h3>
          <div className="space-y-2">
            {urgent.map(t => (
              <div key={t.id} className="flex justify-between p-3 bg-white rounded-xl">
                <div>
                  <div className="font-medium">{t.studentName}</div>
                  <div className="text-sm text-gray-500">{t.message}</div>
                </div>
                <button onClick={() => onResolveTicket(t.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Решить</button>
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
