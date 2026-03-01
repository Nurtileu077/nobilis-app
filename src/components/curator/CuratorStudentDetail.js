import React from 'react';
import I from '../common/Icons';
import { formatDate, getAttendancePercent } from '../../data/utils';
import { PACKAGE_TYPES } from '../../data/constants';

const CuratorStudentDetail = ({
  student, schedule, teachers,
  onBack, onSetModal, onSetForm, onSetSelected,
  onDelStudent, onAddPackage, onRemovePackage,
  onFreezeStudent, onUnfreezeStudent, onUpdStudent, onSetAvatar
}) => {
  const mySchedule = schedule.filter(x => x.students?.includes(student.id));
  const daysLeft = (dateTo) => {
    const d = Math.ceil((new Date(dateTo) - new Date()) / 86400000);
    return d;
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSetAvatar('student', student.id, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <I.Left />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Профиль студента</h1>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] p-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {student.avatar ? (
                <img src={student.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-3 border-white/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                  {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <I.Camera />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-white/70">{student.grade} | {student.city || 'Город не указан'} | {student.email}</p>
              <p className="text-white/60 text-sm">С нами с {formatDate(student.joinDate)}</p>
            </div>
            {student.freeze && (
              <div className="ml-auto bg-blue-500/20 border border-blue-300/30 text-blue-100 px-4 py-2 rounded-xl text-sm">
                Заморожен до {student.freeze.dateTo ? formatDate(student.freeze.dateTo) : 'неопр. срока'}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#1a3a32]">{getAttendancePercent(student.attendance)}%</div>
            <div className="text-sm text-gray-500">Посещаемость</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#c9a227]">{student.examResults?.length || 0}</div>
            <div className="text-sm text-gray-500">Экзаменов</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{student.packages?.length || 0}</div>
            <div className="text-sm text-gray-500">Пакетов</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-600">{student.documents?.length || 0}</div>
            <div className="text-sm text-gray-500">Документов</div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Пакеты услуг</h3>
          <button onClick={() => { onSetForm({ type: 'ielts', dateFrom: '', dateTo: '', totalLessons: '' }); onSetModal('addPackage'); }}
            className="px-3 py-1.5 bg-[#1a3a32] text-white rounded-lg text-sm hover:bg-[#2d5a4a] transition-colors flex items-center gap-1">
            <I.Plus /><span>Добавить</span>
          </button>
        </div>
        {student.packages?.length > 0 ? (
          <div className="space-y-3">
            {student.packages.map(pkg => {
              const type = PACKAGE_TYPES[pkg.type] || { label: pkg.type, color: 'bg-gray-100 text-gray-700' };
              const remaining = pkg.totalLessons - pkg.completedLessons;
              const days = daysLeft(pkg.dateTo);
              const isExpiring = days <= 14 && days > 0;
              const isExpired = days <= 0;
              return (
                <div key={pkg.id} className={`p-4 rounded-xl border ${isExpired ? 'bg-red-50 border-red-200' : isExpiring ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${type.color}`}>{type.label}</span>
                      {isExpired && <span className="text-red-600 text-sm font-medium">Истек</span>}
                      {isExpiring && <span className="text-yellow-600 text-sm font-medium">Скоро истекает ({days} дн)</span>}
                    </div>
                    <button onClick={() => { if (window.confirm('Удалить пакет?')) onRemovePackage(student.id, pkg.id); }}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"><I.Trash /></button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Период</div>
                      <div className="font-medium">{formatDate(pkg.dateFrom)} - {formatDate(pkg.dateTo)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Всего занятий</div>
                      <div className="font-medium">{pkg.totalLessons}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Проведено</div>
                      <div className="font-medium text-green-600">{pkg.completedLessons}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Осталось</div>
                      <div className={`font-medium ${remaining <= 5 ? 'text-red-600' : 'text-blue-600'}`}>{remaining}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(100, (pkg.completedLessons / pkg.totalLessons) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Нет пакетов</p>
        )}
      </div>

      {/* Info grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Личные данные</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Логин</span><span className="font-medium font-mono">{student.login}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Пароль</span><span className="font-medium font-mono">{student.password}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Телефон</span><span className="font-medium">{student.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Возраст</span><span className="font-medium">{student.age}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Город</span>
              <span className="font-medium">{student.city || '—'}</span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Родитель</span><span className="font-medium">{student.parentName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Тел. родителя</span><span className="font-medium">{student.parentPhone}</span></div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Цели и результаты</h3>
          <div className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              {student.targetIelts && <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">IELTS: {student.targetIelts}</span>}
              {student.targetSat && <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">SAT: {student.targetSat}</span>}
            </div>
            {student.examResults?.length > 0 && (
              <div className="space-y-2 mt-3">
                <div className="text-sm text-gray-500">Последние результаты</div>
                {student.examResults.slice(-3).reverse().map(e => (
                  <div key={e.id} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{e.name}</span>
                    <span className="font-medium text-[#c9a227]">{e.score}</span>
                  </div>
                ))}
              </div>
            )}
            {student.testResult && (
              <div className="p-3 bg-emerald-50 rounded-xl mt-2">
                <div className="text-sm text-gray-500">Профориентация</div>
                <div className="font-medium text-emerald-700">{student.testResult}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Расписание</h3>
        {mySchedule.length > 0 ? (
          <div className="space-y-2">
            {mySchedule.map(x => {
              const t = teachers.find(y => y.id === x.teacherId);
              return (
                <div key={x.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-28 text-sm font-medium text-[#1a3a32]">{x.day}</div>
                  <div className="w-16 font-semibold">{x.time}</div>
                  <div className="flex-1">{x.subject}</div>
                  <div className="text-sm text-gray-500">{t?.name || (x.isCurator ? 'Куратор' : '—')}</div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет занятий</p>}
      </div>

      {/* Freeze section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Заморозка</h3>
        {student.freeze ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-blue-800">Студент заморожен</div>
                <div className="text-sm text-blue-600 mt-1">
                  С {formatDate(student.freeze.dateFrom)}
                  {student.freeze.dateTo ? ` до ${formatDate(student.freeze.dateTo)}` : ' на неопределенный срок'}
                </div>
                {student.freeze.reason && <div className="text-sm text-blue-600 mt-1">Причина: {student.freeze.reason}</div>}
              </div>
              <button onClick={() => { if (window.confirm('Разморозить студента?')) onUnfreezeStudent(student.id); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Разморозить
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => { onSetForm({ dateFrom: new Date().toISOString().split('T')[0], dateTo: '', reason: '' }); onSetModal('freezeStudent'); }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2">
            <I.Pause /><span>Заморозить студента</span>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => { onSetForm({ type: 'contract', name: '', score: '' }); onSetSelected(student); onSetModal('addDocument'); }}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <I.Plus /><span>Добавить документ</span>
        </button>
        <button onClick={() => { if (window.confirm('Удалить студента?')) { onDelStudent(student.id); onBack(); } }}
          className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center gap-2">
          <I.Trash /><span>Удалить</span>
        </button>
      </div>
    </div>
  );
};

export default CuratorStudentDetail;
