import React, { useState } from 'react';
import NobilisLogo from './NobilisLogo';

const DEMO_ACCOUNTS = [
  { login: 'curator', password: 'curator2024', label: 'Куратор', icon: 'C' },
  { login: 'alexey.pet47', password: 'Nobilis2024!', label: 'Студент', icon: 'S' },
  { login: 'smirnova.ann', password: 'Teacher2024!', label: 'Препод', icon: 'T' },
];

const LoginScreen = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    const error = onLogin(loginForm.login, loginForm.password);
    if (error) setLoginError(error);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side - decorative background */}
      <div className="hidden lg:flex lg:w-1/2 relative login-bg-left">
        {/* Geometric patterns */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle */}
          <div className="absolute -top-20 -left-20 w-96 h-96 border-2 border-[#c9a227]/15 rounded-full animate-float" />
          <div className="absolute top-1/4 right-10 w-64 h-64 border border-[#c9a227]/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-20 w-48 h-48 border border-[#c9a227]/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />

          {/* Grid dots */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i}
              className="absolute w-1 h-1 bg-[#c9a227]/20 rounded-full"
              style={{ top: `${(i * 31 + 11) % 100}%`, left: `${(i * 47 + 13) % 100}%` }}
            />
          ))}

          {/* Diagonal lines */}
          <div className="absolute top-0 right-0 w-full h-full">
            <svg className="w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100" x2="100" y2="0" stroke="#c9a227" strokeWidth="0.3" />
              <line x1="20" y1="100" x2="100" y2="20" stroke="#c9a227" strokeWidth="0.2" />
              <line x1="0" y1="80" x2="80" y2="0" stroke="#c9a227" strokeWidth="0.2" />
            </svg>
          </div>
        </div>

        {/* Content on left side */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="animate-fadeIn">
            <NobilisLogo size={160} />
          </div>
          <h1 className="text-5xl font-serif text-white mt-8 tracking-wide">NOBILIS</h1>
          <p className="text-[#c9a227] text-lg tracking-[0.5em] mt-2 font-medium">ACADEMY</p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent mt-6" />
          <p className="text-white/40 text-sm mt-6 max-w-sm text-center leading-relaxed">
            Образовательная платформа нового поколения для подготовки к IELTS, SAT и поступлению в лучшие университеты мира
          </p>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4 w-full max-w-sm">
            {[
              { label: 'IELTS & SAT подготовка', desc: 'Индивидуальные программы' },
              { label: 'Сопровождение', desc: 'От профориентации до визы' },
              { label: 'Лучшие ВУЗы мира', desc: 'MIT, Oxford, TU Munich...' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 animate-fadeIn" style={{ animationDelay: `${(i + 1) * 0.2}s` }}>
                <div className="w-10 h-10 rounded-lg bg-[#c9a227]/20 flex items-center justify-center text-[#c9a227] flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium">{f.label}</div>
                  <div className="text-white/40 text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-6 login-bg-right relative">
        {/* Mobile background patterns */}
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute top-10 left-10 w-72 h-72 border border-[#c9a227]/10 rounded-full animate-float" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-[#c9a227]/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex justify-center mb-3">
              <NobilisLogo size={120} />
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide">NOBILIS</h1>
            <p className="text-[#c9a227] text-sm tracking-[0.3em] mt-1">ACADEMY</p>
          </div>

          {/* Form card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Добро пожаловать</h2>
              <p className="text-white/50 text-sm mt-1">Войдите в свой аккаунт</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#c9a227]/80 mb-2 font-medium">Логин</label>
                <input
                  type="text"
                  value={loginForm.login}
                  onChange={e => { setLoginForm(p => ({ ...p, login: e.target.value })); setLoginError(''); }}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] focus:bg-white/10 transition-all"
                  placeholder="Введите логин"
                  autoComplete="username"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div>
                <label className="block text-sm text-[#c9a227]/80 mb-2 font-medium">Пароль</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginError(''); }}
                  className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] focus:bg-white/10 transition-all"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl animate-fadeIn">
                  <p className="text-red-300 text-sm text-center">{loginError}</p>
                </div>
              )}

              <button onClick={handleLogin} className="w-full py-4 rounded-xl font-semibold text-[#1a3a32] text-lg btn-gold mt-2">
                Войти в систему
              </button>
            </div>

            {/* Demo access */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center mb-4">Демо-доступ</p>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.login}
                    onClick={() => setLoginForm({ login: acc.login, password: acc.password })}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-white/70 transition-all hover:scale-105 hover:border-[#c9a227]/50"
                  >
                    <div className="w-8 h-8 mx-auto mb-1.5 rounded-full bg-[#c9a227]/20 flex items-center justify-center text-[#c9a227] text-sm font-bold">
                      {acc.icon}
                    </div>
                    <div className="text-xs font-medium">{acc.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-white/20 text-xs mt-6">&copy; 2024 Nobilis Academy. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
