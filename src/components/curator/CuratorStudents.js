import React from 'react';
import I from '../common/Icons';
import { getInitials, getAttendancePercent } from '../../data/utils';

const CuratorStudents = ({ students, search, onSetSearch, onSetModal, onSetForm, onSetSelected }) => {
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Студенты</h1>
        <button onClick={() => {
          onSetForm({ name: '', email: '', phone: '', age: '', grade: '', parentName: '', parentPhone: '', contractEndDate: '', targetIelts: '', targetSat: '' });
          onSetModal('addStudent');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      <div className="relative">
        <input type="text" value={search} onChange={e => onSetSearch(e.target.value)}
          className="w-full p-3 pl-4 border rounded-xl input-focus" placeholder="Поиск по имени..." />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {filtered.map(s => (
          <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all"
            onClick={() => { onSetSelected(s); onSetModal('studentDetail'); }}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white font-semibold">
              {getInitials(s.name)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">{s.grade} &bull; {s.email}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{getAttendancePercent(s.attendance)}% посещ.</div>
              <div className="text-sm text-gray-500">{s.testResult || 'Тест не пройден'}</div>
            </div>
            <I.Right />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuratorStudents;
