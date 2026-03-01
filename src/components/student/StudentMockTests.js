import React from 'react';
import { formatDate } from '../../data/utils';

const StudentMockTests = ({ student, mockTests, onSetSelected, onSetModal }) => {
  const my = mockTests.filter(t => t.students?.includes(student.id));
  const upcoming = my.filter(t => new Date(t.date) >= new Date());
  const past = my.filter(t => new Date(t.date) < new Date());

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Пробные тесты</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Предстоящие</h3>
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map(t => (
              <div key={t.id} className="p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 card-hover"
                onClick={() => { onSetSelected(t); onSetModal('mockTestDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-gray-600">{formatDate(t.date)} в {t.time} &bull; Каб. {t.room}</div>
                  </div>
                  <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm uppercase">{t.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет тестов</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Прошедшие</h3>
        {past.length > 0 ? (
          <div className="space-y-2">
            {past.map(t => {
              const r = student.examResults?.find(e => e.name === t.name);
              return (
                <div key={t.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(t.date)}</div>
                  </div>
                  <div className="text-lg font-bold">{r?.score || '\u2014'}</div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет тестов</p>}
      </div>
    </div>
  );
};

export default StudentMockTests;
