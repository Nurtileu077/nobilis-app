import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';
import { DOCUMENT_TYPES } from '../../data/constants';

const StudentDocuments = ({ student, onSetSelected, onSetModal }) => {
  const docs = student.documents || [];
  const grouped = docs.reduce((acc, d) => {
    const cat = DOCUMENT_TYPES[d.type]?.isExam ? 'exams'
      : (d.type === 'contract' || d.type === 'receipt') ? 'admin'
      : 'other';
    acc[cat] = [...(acc[cat] || []), d];
    return acc;
  }, {});

  const categoryLabels = { admin: 'Административные', exams: 'Экзамены', other: 'Другие' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Документы</h1>
      {['admin', 'exams', 'other'].map(cat => grouped[cat]?.length > 0 && (
        <div key={cat} className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{categoryLabels[cat]}</h3>
          <div className="space-y-2">
            {grouped[cat].map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected({ ...d, studentId: student.id }); onSetModal('documentDetail'); }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{DOCUMENT_TYPES[d.type]?.icon || '\u{1F4C4}'}</span>
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(d.date)} {d.score && `\u2022 Балл: ${d.score}`}</div>
                  </div>
                </div>
                <I.Right />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentDocuments;
