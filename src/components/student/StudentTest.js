import React from 'react';
import { HOLLAND_QUESTIONS, HOLLAND_PROFILES, ANSWER_LABELS } from '../../data/constants';

const StudentTest = ({ student, testAnswers, testQ, onSetTestAnswers, onSetTestQ, onSubmitTest, onResetTest, onRequestRetake }) => {
  if (student.testResult) {
    const typeKey = student.testProfile || 'R';
    const p = HOLLAND_PROFILES[typeKey] || HOLLAND_PROFILES.R;
    const secondKey = student.testRiasecCode?.[1];
    const secondary = secondKey ? HOLLAND_PROFILES[secondKey] : null;
    const scores = student.testScores || {};
    const maxScore = 35; // 7 questions × 5 max

    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Результаты профориентации</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{p.emoji}</div>
            <h2 className="text-2xl font-bold" style={{ color: p.color }}>{p.name}</h2>
            {student.testRiasecCode && (
              <div className="mt-1 text-sm text-gray-500">Код RIASEC: <span className="font-mono font-bold">{student.testRiasecCode}</span></div>
            )}
            <p className="text-gray-600 mt-3 max-w-lg mx-auto">{p.desc}</p>
          </div>

          {/* RIASEC Bar Chart */}
          <div className="mb-6 space-y-2">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Ваш профиль RIASEC:</h4>
            {Object.entries(HOLLAND_PROFILES).map(([key, prof]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-6 text-center">{prof.emoji}</span>
                <span className="w-32 text-sm truncate">{prof.name}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${((scores[key] || 0) / maxScore) * 100}%`,
                    backgroundColor: prof.color,
                    opacity: key === typeKey ? 1 : 0.6,
                  }} />
                </div>
                <span className="w-8 text-right text-sm font-medium">{scores[key] || 0}</span>
              </div>
            ))}
          </div>

          {/* Recommended careers */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-3">Рекомендуемые профессии:</h4>
              <div className="flex flex-wrap gap-2">
                {(student.testCareers || p.careers).map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-full text-sm font-medium text-white" style={{ backgroundColor: p.color }}>{c}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Подходящие факультеты:</h4>
              <div className="flex flex-wrap gap-2">
                {p.faculties.map(f => (
                  <span key={f} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary type */}
          {secondary && (
            <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: secondary.color + '10' }}>
              <div className="flex items-center gap-2 mb-1">
                <span>{secondary.emoji}</span>
                <span className="font-semibold" style={{ color: secondary.color }}>Дополнительный тип: {secondary.name}</span>
              </div>
              <p className="text-sm text-gray-600">{secondary.desc}</p>
            </div>
          )}

          {/* Retake button */}
          {student.retakeRequested ? (
            <div className="mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center text-yellow-700">
              Запрос на пересдачу отправлен. Ожидайте одобрения куратора.
            </div>
          ) : student.retakeAllowed ? (
            <button onClick={onResetTest} className="mt-4 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1a3a32] hover:text-[#1a3a32] transition-colors">
              Пройти заново
            </button>
          ) : (
            <button onClick={() => onRequestRetake(student.id, 'career')} className="mt-4 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#c9a227] hover:text-[#c9a227] transition-colors">
              Запросить пересдачу
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = HOLLAND_QUESTIONS[testQ];
  const total = HOLLAND_QUESTIONS.length;
  const progress = (Object.keys(testAnswers).length / total) * 100;

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Тест профориентации (Метод Холланда)</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Вопрос {testQ + 1}/{total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-[#c9a227] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {/* Quick nav dots */}
          <div className="flex flex-wrap gap-1 mt-3">
            {HOLLAND_QUESTIONS.map((qq, i) => (
              <button key={qq.id} onClick={() => onSetTestQ(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-medium transition-all ${
                  i === testQ ? 'bg-[#1a3a32] text-white scale-110' :
                  testAnswers[qq.id] !== undefined ? 'bg-[#c9a227] text-white' :
                  'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xl font-medium text-center mb-8">{q.text}</p>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(v => (
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
          {testQ < total - 1
            ? <button onClick={() => onSetTestQ(p => Math.min(total - 1, p + 1))} disabled={!testAnswers[q.id]}
                className="px-6 py-2 btn-primary text-white rounded-xl disabled:opacity-50">Далее</button>
            : <button onClick={onSubmitTest} disabled={Object.keys(testAnswers).length < total}
                className="px-6 py-2 btn-gold text-[#1a3a32] rounded-xl disabled:opacity-50">Завершить</button>
          }
        </div>
      </div>
    </div>
  );
};

export default StudentTest;
