import React from 'react';
import { GALLUP_QUESTIONS, CAREER_PROFILES, ANSWER_LABELS } from '../../data/constants';

const StudentTest = ({ student, testAnswers, testQ, onSetTestAnswers, onSetTestQ, onSubmitTest, onResetTest }) => {
  if (student.testResult) {
    const p = CAREER_PROFILES[student.testResult];
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Результаты профориентации</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
              style={{ backgroundColor: p?.color + '20' }}>{'\u{1F3AF}'}</div>
            <h2 className="text-2xl font-bold" style={{ color: p?.color }}>{student.testResult}</h2>
            <p className="text-gray-600 mt-2">{p?.desc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Профессии:</h4>
              <div className="flex flex-wrap gap-2">
                {p?.careers.map(c => <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{c}</span>)}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">ВУЗы:</h4>
              <div className="flex flex-wrap gap-2">
                {p?.unis.map(u => <span key={u} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{u}</span>)}
              </div>
            </div>
          </div>
          <button onClick={onResetTest} className="mt-6 px-4 py-2 border border-gray-300 rounded-xl btn-outline">
            Пройти заново
          </button>
        </div>
      </div>
    );
  }

  const q = GALLUP_QUESTIONS[testQ];
  const progress = (Object.keys(testAnswers).length / 20) * 100;

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Тест профориентации</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Вопрос {testQ + 1}/20</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-[#c9a227] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="text-xl font-medium text-center mb-8">{q.text}</p>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map(v => (
            <button
              key={v}
              onClick={() => onSetTestAnswers(p => ({ ...p, [q.id]: v }))}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                testAnswers[q.id] === v ? 'border-[#c9a227] bg-[#c9a227]/10' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  testAnswers[q.id] === v ? 'border-[#c9a227] bg-[#c9a227]' : 'border-gray-300'
                }`}>
                  {testAnswers[q.id] === v && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span>{ANSWER_LABELS[v - 1]}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={() => onSetTestQ(p => Math.max(0, p - 1))} disabled={testQ === 0}
            className="px-6 py-2 border border-gray-300 rounded-xl btn-outline disabled:opacity-50">Назад</button>
          {testQ < 19
            ? <button onClick={() => onSetTestQ(p => Math.min(19, p + 1))} disabled={!testAnswers[q.id]}
                className="px-6 py-2 btn-primary text-white rounded-xl disabled:opacity-50">Далее</button>
            : <button onClick={onSubmitTest} disabled={Object.keys(testAnswers).length < 20}
                className="px-6 py-2 btn-gold text-[#1a3a32] rounded-xl disabled:opacity-50">Завершить</button>
          }
        </div>
      </div>
    </div>
  );
};

export default StudentTest;
