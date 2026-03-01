import React from 'react';
import I from '../common/Icons';
import { getInitials } from '../../data/utils';

const CuratorTeachers = ({ teachers, onSetModal, onSetForm, onSetSelected, onDelTeacher }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Преподаватели</h1>
      <button onClick={() => { onSetForm({ name: '', email: '', phone: '', subject: '', hourlyRate: 2500 }); onSetModal('addTeacher'); }}
        className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
        <I.Plus /><span>Добавить</span>
      </button>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {teachers.map(t => (
        <div key={t.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a68620] flex items-center justify-center text-white font-semibold">
            {getInitials(t.name)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-gray-500">{t.subject}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">{t.hourlyRate} \u20B8/час</div>
            <div className="text-sm text-gray-500">{t.hoursWorked} часов</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { onSetForm(t); onSetSelected(t); onSetModal('editTeacher'); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button>
            <button onClick={() => { if (window.confirm('Уволить?')) onDelTeacher(t.id); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CuratorTeachers;
