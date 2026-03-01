import React from 'react';
import I from '../common/Icons';
import { getInitials, getAttendancePercent, getPackageProgress } from '../../data/utils';
import { STUDENT_STATUSES, PACKAGE_TYPES, SUPPORT_STAGES } from '../../data/constants';

const CuratorStudents = ({
  students, search, onSetSearch, onSetModal, onSetForm, onSetSelected,
  cityFilter, statusFilter, onSetCityFilter, onSetStatusFilter
}) => {
  // Get unique cities
  const cities = [...new Set(students.map(s => s.city).filter(Boolean))].sort();

  // Apply filters
  const filtered = students.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (cityFilter && s.city !== cityFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  // Group by status
  const groups = {};
  filtered.forEach(s => {
    const status = s.status || 'active';
    if (!groups[status]) groups[status] = [];
    groups[status].push(s);
  });

  const statusOrder = ['active', 'process', 'graduated_2025', 'graduated_2026', 'paused'];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Студенты ({filtered.length})</h1>
        <button onClick={() => {
          onSetForm({ name: '', email: '', phone: '', age: '', grade: '', parentName: '', parentPhone: '', contractEndDate: '', targetIelts: '', targetSat: '', city: '', status: 'active', graduationYear: '' });
          onSetModal('addStudent');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2 self-start">
          <I.Plus /><span>Добавить</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input type="text" value={search} onChange={e => onSetSearch(e.target.value)}
            className="w-full p-3 border rounded-xl input-focus" placeholder="Поиск по имени..." />
        </div>
        <select value={cityFilter || ''} onChange={e => onSetCityFilter(e.target.value)}
          className="p-3 border rounded-xl input-focus">
          <option value="">Все города</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter || ''} onChange={e => onSetStatusFilter(e.target.value)}
          className="p-3 border rounded-xl input-focus">
          <option value="">Все статусы</option>
          {Object.entries(STUDENT_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Student groups */}
      {statusOrder.filter(s => groups[s]?.length > 0).map(statusKey => {
        const statusInfo = STUDENT_STATUSES[statusKey] || { name: statusKey, color: '#6b7280', bg: '#f3f4f6' };
        return (
          <div key={statusKey}>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                {statusInfo.name} ({groups[statusKey].length})
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {groups[statusKey].map(s => (
                <div key={s.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b hover:bg-gray-50 cursor-pointer transition-all"
                  onClick={() => { onSetSelected(s); onSetModal('studentDetail'); }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {s.grade}{s.city ? ` \u2022 ${s.city}` : ''}{s.email ? ` \u2022 ${s.email}` : ''}
                    </div>
                    {/* Package progress pills */}
                    {s.packages?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.packages.map(pkg => {
                          const typeInfo = PACKAGE_TYPES[pkg.type] || {};
                          const prog = getPackageProgress(pkg, SUPPORT_STAGES);
                          return (
                            <span key={pkg.id} className="text-xs px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: typeInfo.color || '#6b7280' }}>
                              {typeInfo.name || pkg.type} {prog.percent}%
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-sm font-medium">{getAttendancePercent(s.attendance)}% посещ.</div>
                    <div className="text-sm text-gray-500 truncate max-w-[140px]">{s.testResult || 'Тест не пройден'}</div>
                  </div>
                  <I.Right />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">Нет студентов по заданным фильтрам</div>
      )}
    </div>
  );
};

export default CuratorStudents;
