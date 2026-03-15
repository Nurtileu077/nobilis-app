import React from 'react';
import { DAYS_RU } from '../../data/constants';

const CuratorAttendance = ({ data, attDate, attSchedule, onSetAttDate, onSetAttSchedule, onMarkAtt }) => {
  const dayName = DAYS_RU[new Date(attDate).getDay()];
  const todaySchedule = data.schedule.filter(s => s.day === dayName);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Посещаемость</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="date" value={attDate} onChange={e => { onSetAttDate(e.target.value); onSetAttSchedule(null); }}
          className="px-4 py-2 border rounded-xl input-focus" />
        <span className="px-4 py-2 bg-gray-100 rounded-xl text-center">{dayName}</span>
      </div>

      {todaySchedule.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Занятия</h3>
            <div className="space-y-2">
              {todaySchedule.map(s => (
                <button key={s.id} onClick={() => onSetAttSchedule(s)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    attSchedule?.id === s.id ? 'bg-nobilis-green text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                  <div className="font-medium">{s.subject}</div>
                  <div className={`text-sm ${attSchedule?.id === s.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {s.time} &bull; Каб. {s.room}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {attSchedule && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Отметить</h3>
              <div className="space-y-3">
                {attSchedule.students?.map(sid => {
                  const st = data.students.find(x => x.id === sid);
                  const k = `${attSchedule.id}_${attDate}`;
                  const attEntry = data.attendance[k]?.[sid];
                  const status = typeof attEntry === 'object' ? attEntry.status : attEntry;
                  const homework = typeof attEntry === 'object' ? attEntry.homework : null;
                  return st && (
                    <div key={sid} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{st.name}</span>
                        <div className="flex gap-1">
                          {['present', 'absent', 'late'].map(stat => (
                            <button key={stat}
                              onClick={() => onMarkAtt(attSchedule.id, sid, attDate, stat)}
                              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                                status === stat
                                  ? (stat === 'present' ? 'bg-green-600 text-white' : stat === 'absent' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white')
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}>
                              {stat === 'present' ? '\u2713' : stat === 'absent' ? '\u2717' : 'П'}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Homework field */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ДЗ:</span>
                        <input type="text" placeholder="Оценка / комментарий"
                          value={homework || ''}
                          onChange={e => onMarkAtt(attSchedule.id, sid, attDate, status || 'present', e.target.value)}
                          className="flex-1 text-xs p-1 border rounded input-focus" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : <p className="text-gray-500">Нет занятий в этот день</p>}
    </div>
  );
};

export default CuratorAttendance;
