import React from 'react';
import I from '../common/Icons';

const TeacherSyllabus = ({ teacher, students, onSetModal, onSetForm, onSetSelected, onSetSylSearch, onDelSyllabus }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Силлабус</h1>
      <button onClick={() => { onSetForm({ course: '', weeks: 12, topics: '', students: [] }); onSetSylSearch(''); onSetModal('addSyllabus'); }}
        className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
        <I.Plus /><span>Добавить курс</span>
      </button>
    </div>

    {teacher.syllabus?.length > 0 ? (
      <div className="grid md:grid-cols-2 gap-6">
        {teacher.syllabus.map(s => {
          const studs = s.students?.map(id => students.find(st => st.id === id)).filter(Boolean) || [];
          return (
            <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border card-hover">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">{s.course}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { onSetForm({ ...s, topics: s.topics?.join(', ') || '' }); onSetSelected(s); onSetSylSearch(''); onSetModal('editSyllabus'); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
                  <button onClick={() => { if (window.confirm('Удалить курс?')) onDelSyllabus(teacher.id, s.id); }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1"><span>Прогресс</span><span>{s.progress}%</span></div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-[#c9a227] rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">{s.weeks} недель</div>
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Темы:</div>
                <div className="flex flex-wrap gap-1">
                  {s.topics?.map((t, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Студенты ({studs.length}):</div>
                <div className="flex flex-wrap gap-1">
                  {studs.map(st => <span key={st.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{st.name.split(' ')[0]}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : <p className="text-gray-500 text-center py-8">Нет курсов</p>}
  </div>
);

export default TeacherSyllabus;
