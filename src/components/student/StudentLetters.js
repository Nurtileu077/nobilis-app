import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const StudentLetters = ({ student, onSetModal, onSetForm, onSetSelected }) => {
  const mot = student.letters?.filter(l => l.type === 'motivation') || [];
  const rec = student.letters?.filter(l => l.type === 'recommendation') || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Письма</h1>
        <button onClick={() => { onSetForm({ type: 'motivation', university: '', status: 'draft', content: '' }); onSetModal('addLetter'); }}
          className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
          <I.Plus /><span>Создать</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Мотивационные</h3>
        {mot.length > 0 ? (
          <div className="space-y-3">
            {mot.map(l => (
              <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected({ ...l, studentId: student.id }); onSetModal('letterDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{l.university || 'Без названия'}</div>
                    <div className="text-sm text-gray-500">Изменено: {formatDate(l.lastEdit)}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {l.status === 'completed' ? 'Готово' : 'Черновик'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет писем</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Рекомендательные</h3>
        {rec.length > 0 ? (
          <div className="space-y-3">
            {rec.map(l => (
              <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected({ ...l, studentId: student.id }); onSetModal('letterDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{l.author}</div>
                    <div className="text-sm text-gray-500">{l.subject}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {l.status === 'completed' ? 'Получено' : 'Запрошено'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет писем</p>}
      </div>
    </div>
  );
};

export default StudentLetters;
