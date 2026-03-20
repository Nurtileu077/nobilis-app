'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Heart, CheckCircle, X, Zap } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    question: 'Choose the correct word: The company _____ a new product next month.',
    options: ['will launch', 'is launching', 'launches', 'Both A and B'],
    correctAnswer: 3,
    explanation: 'Both "will launch" and "is launching" are correct. "Will launch" is a simple future prediction, while "is launching" describes a planned/scheduled event.',
  },
  {
    id: '2',
    question: 'Which sentence is grammatically correct?',
    options: [
      'If I was you, I would study harder.',
      'If I were you, I would study harder.',
      'If I am you, I will study harder.',
      'If I be you, I would study harder.',
    ],
    correctAnswer: 1,
    explanation: 'The subjunctive mood requires "were" for all subjects in the "if" clause of second conditional sentences.',
  },
  {
    id: '3',
    question: 'The prefix "anti-" means:',
    options: ['Before', 'Against', 'After', 'With'],
    correctAnswer: 1,
    explanation: '"Anti-" is a prefix meaning "against" or "opposing." Examples: antibiotic, antisocial, antidote.',
  },
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);

  const question = MOCK_QUESTIONS[currentQ];

  // Timer
  useEffect(() => {
    if (showResult || finished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1); // Time's up
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQ, showResult, finished]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === question.correctAnswer) {
      setScore((s) => s + 1);
    } else {
      setLives((l) => l - 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= MOCK_QUESTIONS.length || lives <= 0) {
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    }
  };

  if (finished) {
    const xpEarned = score * 25;
    const coinsEarned = score >= MOCK_QUESTIONS.length ? 20 : score * 5;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">{score === MOCK_QUESTIONS.length ? '🎉' : score > 0 ? '👍' : '😔'}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {score === MOCK_QUESTIONS.length ? 'Отлично!' : 'Квиз завершён'}
          </h2>
          <p className="text-gray-500 mb-6">
            {score} из {MOCK_QUESTIONS.length} правильных ответов
          </p>

          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-500">+{xpEarned}</div>
              <div className="text-xs text-gray-400">XP</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-nobilis-gold">+{coinsEarned}</div>
              <div className="text-xs text-gray-400">Coins</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setCurrentQ(0);
                setScore(0);
                setLives(5);
                setFinished(false);
                setShowResult(false);
                setSelectedAnswer(null);
                setTimeLeft(30);
              }}
              className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium"
            >
              Попробовать снова
            </button>
            <button
              onClick={() => router.push('/prep')}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium"
            >
              К дереву навыков
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/prep')} className="p-2 text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock size={16} />
              <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-500' : ''}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  size={14}
                  className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {MOCK_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-xs text-gray-400 mb-2">
              Вопрос {currentQ + 1} из {MOCK_QUESTIONS.length}
            </p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, i) => {
                let style = 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200';
                if (showResult) {
                  if (i === question.correctAnswer) {
                    style = 'bg-green-50 dark:bg-green-500/10 border-green-400 text-green-700 dark:text-green-400';
                  } else if (i === selectedAnswer && i !== question.correctAnswer) {
                    style = 'bg-red-50 dark:bg-red-500/10 border-red-400 text-red-700 dark:text-red-400';
                  }
                } else if (selectedAnswer === i) {
                  style = 'bg-primary-50 dark:bg-primary-500/10 border-primary-400 text-primary-700';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{option}</span>
                      {showResult && i === question.correctAnswer && (
                        <CheckCircle size={18} className="ml-auto text-green-500" />
                      )}
                      {showResult && i === selectedAnswer && i !== question.correctAnswer && (
                        <X size={18} className="ml-auto text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && (
              <motion.div
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-blue-800 dark:text-blue-300">{question.explanation}</p>
              </motion.div>
            )}

            {/* Next button */}
            {showResult && (
              <motion.button
                onClick={nextQuestion}
                className="w-full mt-6 py-3.5 rounded-xl bg-primary-500 text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {currentQ + 1 >= MOCK_QUESTIONS.length ? 'Завершить' : 'Следующий вопрос'}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
