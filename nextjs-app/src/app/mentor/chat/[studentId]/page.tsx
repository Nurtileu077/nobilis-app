'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Paperclip, CheckCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: 'mentor', content: 'Привет! Как продвигается сбор документов для UofT?', createdAt: '2025-03-08T10:00:00', read: true },
  { id: '2', senderId: 'student', content: 'Привет! Транскрипт уже загрузила, осталось рекомендательное письмо', createdAt: '2025-03-08T10:05:00', read: true },
  { id: '3', senderId: 'mentor', content: 'Отлично! Не забудь про дедлайн 15 марта. Кстати, эссе уже готово?', createdAt: '2025-03-08T10:07:00', read: true },
  { id: '4', senderId: 'student', content: 'Эссе в процессе, использую AI генерацию + потом очеловечу', createdAt: '2025-03-08T10:10:00', read: true },
  { id: '5', senderId: 'student', content: 'Загрузила транскрипт! 📄', createdAt: '2025-03-08T14:00:00', read: false },
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        senderId: 'mentor',
        content: input,
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-nobilis-dark flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => router.push('/mentor')} className="p-1 text-gray-400">
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-lg">
          👩
        </div>
        <div>
          <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Алия Нурланова</h2>
          <p className="text-xs text-green-500">Онлайн</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMentor = msg.senderId === 'mentor';
          return (
            <div key={msg.id} className={`flex ${isMentor ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMentor
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-slate-700'
                }`}
              >
                <p>{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMentor ? 'text-white/60 justify-end' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  {isMentor && <CheckCheck size={12} className={msg.read ? 'text-blue-300' : 'text-white/40'} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Написать сообщение..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-primary-500 text-white disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
