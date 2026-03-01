import React, { useState } from 'react';
import I from '../common/Icons';
import { formatDate, getInitials } from '../../data/utils';

const TeacherLessons = ({ teacher, schedule, students, onSetModal, onSetForm, onUpdLesson }) => {
  const mySchedule = schedule.filter(s => s.teacherId === teacher.id);
  const [expandedLesson, setExpandedLesson] = useState(null);

  const getStudentsForLesson = (lesson) => {
    const sch = schedule.find(s => s.id === lesson.scheduleId);
    if (!sch) return [];
    return (sch.students || []).map(id => (students || []).find(st => st.id === id)).filter(Boolean);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Мои уроки</h1>
        <button onClick={() => {
          onSetForm({ date: new Date().toISOString().split('T')[0], scheduleId: mySchedule[0]?.id || '', status: 'conducted', hours: 1.5, note: '', homework: '', comment: '', studentAttendance: {} });
          onSetModal('addLesson');
        }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Отметить урок</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-[#1a3a32]">{teacher.totalLessons}</div>
          <div className="text-sm text-gray-500">Проведено</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-[#c9a227]">{teacher.hoursWorked} ч</div>
          <div className="text-sm text-gray-500">Отработано</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">{teacher.lessons?.filter(l => !l.confirmed).length || 0}</div>
          <div className="text-sm text-gray-500">Ожидают подтв.</div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        {teacher.lessons?.sort((a, b) => new Date(b.date) - new Date(a.date)).map(l => {
          const sch = schedule.find(s => s.id === l.scheduleId);
          const lessonStudents = getStudentsForLesson(l);
          const isExpanded = expandedLesson === l.id;

          return (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedLesson(isExpanded ? null : l.id)}>
                <div className={`w-3 h-3 rounded-full ${
                  l.status === 'conducted' ? 'bg-green-500'
                    : l.status === 'cancelled' ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium">{sch?.subject || '—'}</div>
                  <div className="text-sm text-gray-500">{formatDate(l.date)}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  l.status === 'conducted' ? 'bg-green-100 text-green-700'
                    : l.status === 'cancelled' ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {l.status === 'conducted' ? 'Проведен' : l.status === 'cancelled' ? 'Отменен' : 'Перенесен'}
                </span>
                <div className="text-sm text-gray-500">{l.hours} ч</div>
                <div className="flex items-center gap-2">
                  {l.confirmed ? <span className="text-green-600 text-sm">Подтв.</span> : <span className="text-yellow-600 text-sm">Ожидает</span>}
                  <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}><I.Down /></span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t p-4 bg-gray-50 space-y-4">
                  {l.note && <div className="text-sm text-gray-600">Примечание: {l.note}</div>}

                  {/* Student attendance */}
                  {lessonStudents.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Посещаемость студентов</div>
                      <div className="space-y-2">
                        {lessonStudents.map(st => {
                          const attended = l.studentAttendance?.[st.id];
                          return (
                            <div key={st.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white text-xs font-semibold">
                                {getInitials(st.name)}
                              </div>
                              <span className="flex-1 text-sm">{st.name}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (onUpdLesson) onUpdLesson(teacher.id, l.id, { studentAttendance: { ...(l.studentAttendance || {}), [st.id]: true } }); }}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${attended === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-100'}`}
                                >Был</button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); if (onUpdLesson) onUpdLesson(teacher.id, l.id, { studentAttendance: { ...(l.studentAttendance || {}), [st.id]: false } }); }}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${attended === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-100'}`}
                                >Не был</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Homework */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Домашнее задание</div>
                    <textarea
                      value={l.homework || ''}
                      onChange={(e) => { if (onUpdLesson) onUpdLesson(teacher.id, l.id, { homework: e.target.value }); }}
                      className="w-full p-2.5 border rounded-lg text-sm input-focus resize-none"
                      rows={2}
                      placeholder="Введите ДЗ..."
                      onClick={e => e.stopPropagation()}
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Комментарий по уроку</div>
                    <textarea
                      value={l.comment || ''}
                      onChange={(e) => { if (onUpdLesson) onUpdLesson(teacher.id, l.id, { comment: e.target.value }); }}
                      className="w-full p-2.5 border rounded-lg text-sm input-focus resize-none"
                      rows={2}
                      placeholder="Комментарий..."
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {(!teacher.lessons || teacher.lessons.length === 0) && (
          <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow-sm border">Нет отмеченных уроков</div>
        )}
      </div>
    </div>
  );
};

export default TeacherLessons;
