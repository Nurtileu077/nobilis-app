'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';

function ParentInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [accepted, setAccepted] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-nobilis-dark">
        <p className="text-gray-500">Недействительная ссылка приглашения</p>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-nobilis-dark text-center px-4">
        <div>
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Приглашение принято!</h1>
          <p className="text-gray-500">Теперь вы можете отслеживать прогресс вашего ребёнка</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-nobilis-dark px-4">
      <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 text-center">
        <Shield size={48} className="text-primary-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Приглашение в Nobilis Academy
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Ваш ребёнок пригласил вас отслеживать процесс поступления в зарубежный вуз
        </p>

        <button
          onClick={() => setAccepted(true)}
          className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Принять приглашение
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Вы получите доступ только к просмотру данных
        </p>
      </div>
    </div>
  );
}

export default function ParentInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <ParentInviteContent />
    </Suspense>
  );
}
