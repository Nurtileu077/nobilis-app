import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const CuratorInternships = ({ internships, onSetModal, onSetForm, onSetSelected, onDelInternship }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Стажировки</h1>
      <button onClick={() => { onSetForm({ name: '', country: '', type: '', requirements: '', deadline: '', link: '', description: '' }); onSetModal('addInternship'); }}
        className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
        <I.Plus /><span>Добавить</span>
      </button>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {internships.map(i => (
        <div key={i.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all">
          <div className="flex-1">
            <div className="font-medium">{i.name}</div>
            <div className="text-sm text-gray-500">{i.country} &bull; {i.type}</div>
          </div>
          <div className="text-sm text-gray-500">Дедлайн: {formatDate(i.deadline)}</div>
          {i.link && <a href={i.link} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Link /></a>}
          <div className="flex gap-2">
            <button onClick={() => { onSetForm(i); onSetSelected(i); onSetModal('editInternship'); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
            <button onClick={() => { if (window.confirm('Удалить?')) onDelInternship(i.id); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CuratorInternships;
