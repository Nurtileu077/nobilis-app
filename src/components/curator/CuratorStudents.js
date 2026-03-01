import React from 'react';
import I from '../common/Icons';
import { getInitials, getAttendancePercent } from '../../data/utils';
import { PACKAGE_TYPES } from '../../data/constants';

const CuratorStudents = ({ students, search, onSetSearch, onSetModal, onSetForm, onSetSelected, onSetView }) => {
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Студенты</h1>
        <button onClick={() => {
          onSetForm({ name: '', email: '', phone: '', age: '', grade: '', parentName: '', parentPhone: '', city: '', targetIelts: '', targetSat: '', packages: [] });
          onSetModal('addStudent');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      <div className="relative">
        <input type="text" value={search} onChange={e => onSetSearch(e.target.value)}
          className="w-full p-3 pl-4 border rounded-xl input-focus" placeholder="Поиск по имени..." />
      </div>

      <div className="grid gap-4">
        {filtered.map(s => {
          const isFrozen = !!s.freeze;
          return (
            <div key={s.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isFrozen ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-4 p-4">
                <div className="relative">
                  {s.avatar ? (
                    <img src={s.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials(s.name)}
                    </div>
                  )}
                  {isFrozen && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <I.Pause />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{s.name}</div>
                  <div className="text-sm text-gray-500">{s.grade} | {s.city || '—'} | {s.email}</div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium">{getAttendancePercent(s.attendance)}% посещ.</div>
                  <div className="text-sm text-gray-500">{s.testResult || 'Тест не пройден'}</div>
                </div>
              </div>

              {/* Package badges */}
              {(s.packages?.length > 0) && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {(s.packages || []).map(pkg => {
                    const type = PACKAGE_TYPES[pkg.type] || { label: pkg.type, color: 'bg-gray-100 text-gray-700' };
                    const remaining = pkg.totalLessons - pkg.completedLessons;
                    const days = Math.ceil((new Date(pkg.dateTo) - new Date()) / 86400000);
                    const isExpiring = days <= 14 && days > 0;
                    const isExpired = days <= 0;
                    return (
                      <span key={pkg.id} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-700' : isExpiring ? 'bg-yellow-100 text-yellow-700' : type.color}`}>
                        {type.label}: {remaining} ост.
                        {isExpiring && ` (${days}дн)`}
                        {isExpired && ' (истек)'}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex border-t">
                <button
                  onClick={() => { onSetSelected(s); onSetModal('studentPreview'); }}
                  className="flex-1 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1.5"
                >
                  <I.Eye /><span>Быстрый просмотр</span>
                </button>
                <div className="w-px bg-gray-200" />
                <button
                  onClick={() => { onSetSelected(s); if (onSetView) onSetView('studentPage'); }}
                  className="flex-1 py-2.5 text-sm text-[#1a3a32] hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-1.5"
                >
                  <I.Open /><span>Открыть подробно</span>
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-8">Студенты не найдены</div>
        )}
      </div>
    </div>
  );
};

export default CuratorStudents;
