import React, { useState, useEffect, useRef, useCallback } from 'react';

// 30 English proficiency questions with difficulty levels
const ENGLISH_QUESTIONS = [
  // A1-A2 (Beginner) - questions 1-10
  { id: 1, level: 'A1', question: 'Choose the correct option: "She ___ a student."', options: ['am', 'is', 'are', 'be'], answer: 1 },
  { id: 2, level: 'A1', question: 'What is the plural of "child"?', options: ['childs', 'childrens', 'children', 'childes'], answer: 2 },
  { id: 3, level: 'A1', question: '"I ___ breakfast every morning."', options: ['has', 'have', 'having', 'had'], answer: 1 },
  { id: 4, level: 'A2', question: 'Choose the correct past tense: "Yesterday I ___ to school."', options: ['go', 'goes', 'went', 'goed'], answer: 2 },
  { id: 5, level: 'A2', question: '"There ___ many people at the party last night."', options: ['was', 'were', 'is', 'are'], answer: 1 },
  { id: 6, level: 'A2', question: 'Which sentence is correct?', options: ['He don\'t like coffee', 'He doesn\'t likes coffee', 'He doesn\'t like coffee', 'He not like coffee'], answer: 2 },
  { id: 7, level: 'A2', question: '"I\'m looking forward ___ you."', options: ['see', 'seeing', 'to seeing', 'to see'], answer: 2 },
  { id: 8, level: 'A2', question: '"This is ___ book I\'ve ever read."', options: ['the best', 'the most good', 'the better', 'most best'], answer: 0 },
  { id: 9, level: 'A2', question: '"Can you tell me where ___?"', options: ['is the bank', 'the bank is', 'the bank', 'bank is'], answer: 1 },
  { id: 10, level: 'A2', question: '"She has been living here ___ 2015."', options: ['for', 'since', 'from', 'during'], answer: 1 },
  // B1 (Intermediate) - questions 11-18
  { id: 11, level: 'B1', question: '"If I ___ rich, I would travel the world."', options: ['am', 'was', 'were', 'will be'], answer: 2 },
  { id: 12, level: 'B1', question: '"She suggested ___ to the cinema."', options: ['go', 'to go', 'going', 'goes'], answer: 2 },
  { id: 13, level: 'B1', question: '"The report ___ by the time the manager arrived."', options: ['was finished', 'had been finished', 'has finished', 'finished'], answer: 1 },
  { id: 14, level: 'B1', question: '"He asked me if I ___ the news."', options: ['heard', 'had heard', 'have heard', 'hear'], answer: 1 },
  { id: 15, level: 'B1', question: '"___ the weather was bad, we went for a walk."', options: ['Despite', 'Although', 'However', 'Because'], answer: 1 },
  { id: 16, level: 'B1', question: '"I wish I ___ more time to study."', options: ['have', 'had', 'would have', 'will have'], answer: 1 },
  { id: 17, level: 'B1', question: '"The project needs ___ by Friday."', options: ['to complete', 'completing', 'to be completed', 'completed'], answer: 2 },
  { id: 18, level: 'B1', question: '"Not only ___ the test, but she also got the highest score."', options: ['she passed', 'did she pass', 'she did pass', 'passed she'], answer: 1 },
  // B2 (Upper-Intermediate) - questions 19-24
  { id: 19, level: 'B2', question: '"Had I known about the delay, I ___ earlier."', options: ['would leave', 'would have left', 'had left', 'will leave'], answer: 1 },
  { id: 20, level: 'B2', question: '"The news came as a shock; ___, nobody had expected it."', options: ['nevertheless', 'moreover', 'indeed', 'whereas'], answer: 2 },
  { id: 21, level: 'B2', question: '"She couldn\'t help ___ when she heard the joke."', options: ['to laugh', 'laughing', 'laugh', 'laughed'], answer: 1 },
  { id: 22, level: 'B2', question: '"By this time next year, I ___ my degree."', options: ['will complete', 'will have completed', 'complete', 'am completing'], answer: 1 },
  { id: 23, level: 'B2', question: '"The phenomenon, ___ has puzzled scientists for decades, remains unexplained."', options: ['that', 'which', 'what', 'whose'], answer: 1 },
  { id: 24, level: 'B2', question: '"It\'s high time we ___ a decision."', options: ['make', 'made', 'will make', 'have made'], answer: 1 },
  // C1-C2 (Advanced) - questions 25-30
  { id: 25, level: 'C1', question: '"Scarcely ___ the house when it started to rain."', options: ['I had left', 'had I left', 'I left', 'did I leave'], answer: 1 },
  { id: 26, level: 'C1', question: '"The proposal was ___ that even the opposition agreed."', options: ['so compelling', 'such compelling', 'so compelled', 'so compellingly'], answer: 0 },
  { id: 27, level: 'C1', question: '"She acted as if she ___ the answer all along."', options: ['knows', 'knew', 'had known', 'has known'], answer: 2 },
  { id: 28, level: 'C2', question: '"The theory ___ credence in light of recent discoveries."', options: ['lends', 'gains', 'takes', 'holds'], answer: 1 },
  { id: 29, level: 'C2', question: '"His argument, while ostensibly ___, lacked empirical support."', options: ['cogent', 'coherent', 'poignant', 'lucid'], answer: 0 },
  { id: 30, level: 'C2', question: '"The committee ___ the decision pending further review."', options: ['deferred', 'inferred', 'conferred', 'referred'], answer: 0 },
];

const LEVELS = {
  A1: { name: 'A1 - Beginner', color: '#ef4444', min: 0, max: 4, desc: 'Начальный уровень. Вы знаете базовые фразы и конструкции.' },
  A2: { name: 'A2 - Elementary', color: '#f97316', min: 5, max: 10, desc: 'Элементарный уровень. Вы можете общаться в простых бытовых ситуациях.' },
  B1: { name: 'B1 - Intermediate', color: '#eab308', min: 11, max: 17, desc: 'Средний уровень. Вы можете поддержать разговор на знакомые темы.' },
  B2: { name: 'B2 - Upper-Intermediate', color: '#22c55e', min: 18, max: 23, desc: 'Выше среднего. Вы уверенно общаетесь на большинство тем.' },
  C1: { name: 'C1 - Advanced', color: '#3b82f6', min: 24, max: 27, desc: 'Продвинутый уровень. Свободное владение языком в академической и профессиональной среде.' },
  C2: { name: 'C2 - Proficiency', color: '#8b5cf6', min: 28, max: 30, desc: 'Уровень носителя. Вы владеете языком на экспертном уровне.' },
};

function getLevel(score) {
  for (const [key, level] of Object.entries(LEVELS)) {
    if (score >= level.min && score <= level.max) return { key, ...level };
  }
  return { key: 'A1', ...LEVELS.A1 };
}

const TIMER_SECONDS = 30 * 60; // 30 minutes

const StudentEnglishTest = ({ student, onSubmitEnglishTest, onResetEnglishTest, onRequestRetake }) => {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  const hasResult = student?.englishTestResult;

  const doSubmit = useCallback((currentAnswers) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    let correct = 0;
    ENGLISH_QUESTIONS.forEach(q => {
      if (currentAnswers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setShowResult(true);
    const level = getLevel(correct);
    onSubmitEnglishTest(student.id, {
      score: correct,
      total: 30,
      level: level.key,
      levelName: level.name,
      answers: { ...currentAnswers },
      date: new Date().toISOString(),
    });
  }, [student?.id, onSubmitEnglishTest]);

  // Timer effect
  useEffect(() => {
    if (!started || hasResult || showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, hasResult, showResult]);

  // Auto-submit when timer runs out
  const answersRef = useRef(answers);
  answersRef.current = answers;
  useEffect(() => {
    if (timeLeft === 0 && started && !submittedRef.current) {
      doSubmit(answersRef.current);
    }
  }, [timeLeft, started, doSubmit]);

  const handleAnswer = (qId, optIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < 30) {
      if (!window.confirm(`Вы ответили только на ${Object.keys(answers).length} из 30 вопросов. Отправить как есть?`)) return;
    }
    doSubmit(answers);
  };

  const handleRequestRetake = () => {
    if (onRequestRetake) onRequestRetake(student.id, 'english');
  };

  const handleReset = () => {
    onResetEnglishTest(student.id);
    setAnswers({});
    setCurrentQ(0);
    setShowResult(false);
    setScore(0);
    setStarted(false);
    setTimeLeft(TIMER_SECONDS);
    submittedRef.current = false;
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Show previous result
  if (hasResult && !showResult) {
    const result = student.englishTestResult;
    const level = LEVELS[result.level] || LEVELS.A1;
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Тест на знание английского</h1>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${level.color}15, ${level.color}05)` }}>
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4" style={{ backgroundColor: level.color }}>
              {result.level}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{level.name}</h2>
            <p className="text-gray-600 max-w-md mx-auto">{level.desc}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-[#1a3a32]">{result.score}</div>
                <div className="text-xs text-gray-500 mt-1">Правильных</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-400">{result.total - result.score}</div>
                <div className="text-xs text-gray-500 mt-1">Ошибок</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold" style={{ color: level.color }}>{Math.round(result.score / result.total * 100)}%</div>
                <div className="text-xs text-gray-500 mt-1">Результат</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                {Object.entries(LEVELS).map(([key, lv]) => (
                  <div key={key} className="h-full" style={{
                    width: `${((lv.max - lv.min + 1) / 30) * 100}%`,
                    backgroundColor: result.score >= lv.min ? lv.color : '#e5e7eb',
                    opacity: result.score >= lv.min ? (result.level === key ? 1 : 0.4) : 0.2,
                  }} />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500 text-center mb-4">
              Дата прохождения: {new Date(result.date).toLocaleDateString('ru-RU')}
            </div>
            {/* Retake flow */}
            {student.englishRetakeRequested ? (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center text-yellow-700">
                Запрос на пересдачу отправлен. Ожидайте одобрения куратора.
              </div>
            ) : student.englishRetakeAllowed ? (
              <button onClick={handleReset}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1a3a32] hover:text-[#1a3a32] transition-colors">
                Пройти заново
              </button>
            ) : (
              <button onClick={handleRequestRetake}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#c9a227] hover:text-[#c9a227] transition-colors">
                Запросить пересдачу
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show result after submission
  if (showResult) {
    const level = getLevel(score);
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Результат теста</h1>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${level.color}20, ${level.color}05)` }}>
            <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg" style={{ backgroundColor: level.color }}>
              {level.key}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Ваш уровень: {level.name}</h2>
            <p className="text-gray-600 max-w-md mx-auto text-lg">{level.desc}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-500 mt-1">Правильных</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-500">{30 - score}</div>
                <div className="text-sm text-gray-500 mt-1">Ошибок</div>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${level.color}10` }}>
                <div className="text-3xl font-bold" style={{ color: level.color }}>{Math.round(score / 30 * 100)}%</div>
                <div className="text-sm text-gray-500 mt-1">Результат</div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">Результаты по уровням:</div>
              {Object.entries(LEVELS).map(([key, lv]) => {
                const questions = ENGLISH_QUESTIONS.filter(q => q.level === key);
                const correct = questions.filter(q => answers[q.id] === q.answer).length;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-8 h-6 rounded text-xs font-bold text-white flex items-center justify-center" style={{ backgroundColor: lv.color }}>{key}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${(correct / questions.length) * 100}%`, backgroundColor: lv.color }} />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{correct}/{questions.length}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setShowResult(false); }}
              className="w-full py-3 btn-primary text-white rounded-xl">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Тест на знание английского</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
          <div className="text-6xl mb-4">{'\u{1F4DD}'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Готовы начать?</h2>
          <div className="max-w-md mx-auto text-left space-y-3 mb-8">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-lg">{'\u{1F4CB}'}</span>
              <div><span className="font-medium">30 вопросов</span><span className="text-gray-500 text-sm"> — от A1 до C2</span></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-lg">{'\u{23F0}'}</span>
              <div><span className="font-medium">30 минут</span><span className="text-gray-500 text-sm"> — таймер запустится сразу</span></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-lg">{'\u{1F6AB}'}</span>
              <div><span className="font-medium">Одна попытка</span><span className="text-gray-500 text-sm"> — пересдача после одобрения куратора</span></div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
              <span className="text-lg">{'\u26A0\uFE0F'}</span>
              <div><span className="font-medium text-red-700">Авто-отправка</span><span className="text-red-500 text-sm"> — по истечении времени тест отправится автоматически</span></div>
            </div>
          </div>
          <button onClick={() => setStarted(true)}
            className="px-8 py-3 btn-gold text-[#1a3a32] font-bold rounded-xl text-lg">
            Начать тест
          </button>
        </div>
      </div>
    );
  }

  // Test questions with timer
  const q = ENGLISH_QUESTIONS[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / 30) * 100;
  const timerWarning = timeLeft <= 60;
  const timerCaution = timeLeft <= 300 && !timerWarning;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Тест на знание английского</h1>
        <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold ${
          timerWarning ? 'bg-red-100 text-red-700 animate-pulse' :
          timerCaution ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {'\u{23F0}'} {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Прогресс</span>
          <span>{answeredCount}/30 ответов</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-gradient-to-r from-[#1a3a32] to-[#c9a227] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ENGLISH_QUESTIONS.map((qq, i) => (
            <button key={qq.id} onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                i === currentQ ? 'bg-[#1a3a32] text-white scale-110' :
                answers[qq.id] !== undefined ? 'bg-green-500 text-white' :
                'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: LEVELS[q.level]?.color || '#6b7280' }}>{q.level}</span>
          <span className="text-sm text-gray-400">Вопрос {currentQ + 1} из 30</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">{q.question}</h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(q.id, idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[q.id] === idx
                  ? 'border-[#1a3a32] bg-[#1a3a32]/5 text-[#1a3a32] font-medium'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-bold mr-3 ${
                answers[q.id] === idx ? 'bg-[#1a3a32] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
          className="flex-1 py-3 bg-white border rounded-xl text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          Назад
        </button>
        {currentQ < 29 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 py-3 btn-primary text-white rounded-xl">
            Далее
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={answeredCount < 1}
            className="flex-1 py-3 bg-[#c9a227] text-[#1a3a32] font-bold rounded-xl hover:bg-[#e8c547] transition-colors disabled:opacity-50">
            Завершить тест
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentEnglishTest;
