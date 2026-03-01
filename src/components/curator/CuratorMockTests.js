import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const CuratorMockTests = ({ mockTests, onSetModal, onSetForm, onSetSelected, onDelMockTest }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Пробные тесты</h1>
      <button onClick={() => { onSetForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); onSetModal('addMockTest'); }}
        className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
        <I.Plus /><span>Добавить</span>
      </button>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {mockTests.map(t => (
        <div key={t.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all">
          <span className={`px-3 py-1 rounded-full text-sm uppercase ${t.type === 'ielts' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{t.type}</span>
          <div className="flex-1">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-gray-500">{formatDate(t.date)} в {t.time} &bull; Каб. {t.room}</div>
          </div>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{t.students?.length || 0} студ.</div>
          <div className="flex gap-2">
            <button onClick={() => { onSetForm(t); onSetSelected(t); onSetModal('editMockTest'); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
            <button onClick={() => { if (window.confirm('Удалить?')) onDelMockTest(t.id); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CuratorMockTests;
