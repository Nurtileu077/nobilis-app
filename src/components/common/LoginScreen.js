import React, { useState } from 'react';
import NobilisLogo from './NobilisLogo';

const DEMO_ACCOUNTS = [
  { login: 'curator', password: 'curator2024', label: 'Куратор', emoji: '\u{1F468}\u{200D}\u{1F4BC}' },
  { login: 'alexey.pet47', password: 'Nobilis2024!', label: 'Студент', emoji: '\u{1F393}' },
  { login: 'smirnova.ann', password: 'Teacher2024!', label: 'Препод', emoji: '\u{1F469}\u{200D}\u{1F3EB}' },
];

const LoginScreen = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    const error = onLogin(loginForm.login, loginForm.password);
    if (error) setLoginError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 login-bg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 border border-[#c9a227]/20 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-48 h-48 border border-[#c9a227]/15 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 border border-[#c9a227]/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-[#c9a227]/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#c9a227]/30 rounded-full"
            style={{ top: `${(i * 37 + 13) % 100}%`, left: `${(i * 53 + 7) % 100}%`, animationDelay: `${(i * 0.15) % 3}s` }}
          />
        ))}
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-[#c9a227]/30 shadow-2xl animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-pulse-slow">
            <NobilisLogo size={90} />
          </div>
          <h1 className="text-4xl font-serif text-white tracking-wide">NOBILIS</h1>
          <p className="text-[#c9a227] text-sm tracking-[0.3em] mt-1 font-medium">ACADEMY</p>
          <p className="text-white/50 text-xs mt-3">Образовательная платформа нового поколения</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#c9a227]/80 mb-2 font-medium">Логин</label>
            <input
              type="text"
              value={loginForm.login}
              onChange={e => { setLoginForm(p => ({ ...p, login: e.target.value })); setLoginError(''); }}
              className="w-full p-4 bg-white/5 border border-[#c9a227]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] focus:bg-white/10 transition-all input-focus"
              placeholder="Введите логин"
              autoComplete="off"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="block text-sm text-[#c9a227]/80 mb-2 font-medium">Пароль</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={e => { setLoginForm(p => ({ ...p, password: e.target.value })); setLoginError(''); }}
              className="w-full p-4 bg-white/5 border border-[#c9a227]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#c9a227] focus:bg-white/10 transition-all input-focus"
              placeholder="Введите пароль"
              autoComplete="off"
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
        <div className="mt-8 pt-6 border-t border-[#c9a227]/20">
          <p className="text-xs text-[#c9a227]/60 text-center mb-4">Демонстрационный доступ</p>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.login}
                onClick={() => setLoginForm({ login: acc.login, password: acc.password })}
                className="p-3 bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-xl text-[#c9a227] transition-all hover:scale-105"
              >
                <div className="text-xl mb-1">{acc.emoji}</div>
                <div className="text-xs font-medium">{acc.label}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">&copy; 2024 Nobilis Academy. Все права защищены.</p>
      </div>
    </div>
  );
};

export default LoginScreen;
