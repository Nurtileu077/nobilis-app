import React from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const StudentResults = ({ student, onSetSelected, onSetModal }) => {
  const official = student.examResults?.filter(e => !e.type.startsWith('mock_')) || [];
  const mocks = student.examResults?.filter(e => e.type.startsWith('mock_')) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Мои результаты</h1>

      <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><I.Target /> Мои цели</h3>
        <div className="grid grid-cols-2 gap-4">
          {student.targetIelts && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-white/70">IELTS цель</div>
              <div className="text-2xl font-bold">{student.targetIelts}</div>
            </div>
          )}
          {student.targetSat && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-white/70">SAT цель</div>
              <div className="text-2xl font-bold">{student.targetSat}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Официальные экзамены</h3>
        {official.length > 0 ? (
          <div className="space-y-3">
            {official.map(e => (
              <div key={e.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected(e); onSetModal('examDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(e.date)}</div>
                  </div>
                  <div className="text-2xl font-bold text-[#1a3a32]">{e.score}</div>
                </div>
                {e.breakdown && (
                  <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
                    {Object.entries(e.breakdown).map(([k, v]) => (
                      <div key={k} className="text-center p-2 bg-white rounded-lg">
                        <div className="text-gray-500 capitalize">{k}</div>
                        <div className="font-semibold">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет результатов</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Пробные тесты</h3>
        {mocks.length > 0 ? (
          <div className="space-y-2">
            {mocks.map(e => (
              <div key={e.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-sm text-gray-500">{formatDate(e.date)}</div>
                </div>
                <div className="text-xl font-bold text-[#c9a227]">{e.score}</div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет результатов</p>}
      </div>
    </div>
  );
};

export default StudentResults;
