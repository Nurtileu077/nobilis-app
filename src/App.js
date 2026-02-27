import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// NOBILIS ACADEMY v2.1 - ИСПРАВЛЕНИЯ + АНИМАЦИИ
// ============================================================

// НОВЫЙ ЛОГОТИП - Академическая шапка с книгой
const NobilisLogo = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0d861"/>
        <stop offset="50%" stopColor="#c9a227"/>
        <stop offset="100%" stopColor="#a68620"/>
      </linearGradient>
      <linearGradient id="darkGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2d5a4a"/>
        <stop offset="100%" stopColor="#1a3a32"/>
      </linearGradient>
    </defs>
    {/* Круг фон */}
    <circle cx="50" cy="50" r="48" fill="url(#darkGreen)" stroke="url(#goldGrad)" strokeWidth="2"/>
    {/* Академическая шапка */}
    <polygon points="50,18 15,38 50,50 85,38" fill="url(#goldGrad)"/>
    <polygon points="50,50 85,38 85,45 50,57" fill="#a68620"/>
    <polygon points="50,50 15,38 15,45 50,57" fill="#c9a227"/>
    {/* Кисточка */}
    <line x1="85" y1="38" x2="90" y2="55" stroke="#c9a227" strokeWidth="2"/>
    <circle cx="90" cy="58" r="4" fill="#f0d861"/>
    {/* Книга */}
    <path d="M30 62 L50 72 L70 62 L70 82 L50 92 L30 82 Z" fill="#1a3a32" stroke="url(#goldGrad)" strokeWidth="1.5"/>
    <line x1="50" y1="72" x2="50" y2="92" stroke="url(#goldGrad)" strokeWidth="1"/>
    {/* Страницы */}
    <path d="M32 64 L50 73 L50 90 L32 81 Z" fill="#2d5a4a"/>
    <path d="M68 64 L50 73 L50 90 L68 81 Z" fill="#3d6a5a"/>
  </svg>
);

// CSS Анимации
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .btn-primary {
    background: linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(26, 58, 50, 0.4);
  }
  .btn-primary:active {
    transform: translateY(0);
  }
  .btn-gold {
    background: linear-gradient(135deg, #c9a227 0%, #e8c547 100%);
    transition: all 0.3s ease;
  }
  .btn-gold:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(201, 162, 39, 0.4);
  }
  .btn-outline {
    transition: all 0.2s ease;
  }
  .btn-outline:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
  .card-hover {
    transition: all 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .nav-item {
    transition: all 0.2s ease;
  }
  .nav-item:hover {
    transform: translateX(4px);
  }
  .input-focus {
    transition: all 0.2s ease;
  }
  .input-focus:focus {
    border-color: #c9a227;
    box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.2);
  }
  .login-bg {
    background: linear-gradient(135deg, #1a3a32 0%, #0f2a22 50%, #1a3a32 100%);
    background-size: 200% 200%;
    animation: shimmer 15s ease infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// УТИЛИТЫ
const generatePassword = (len = 12) => Array.from({ length: len }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'[Math.floor(Math.random() * 60)]).join('');
const generateLogin = (name) => {
  const map = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ы':'y','э':'e','ю':'yu','я':'ya'};
  const tr = s => s.split('').map(c => map[c] || c).join('').replace(/[ьъ]/g, '');
  const p = (name || 'user').toLowerCase().split(' ');
  return tr(p[0]) + '.' + tr(p[1] || '').slice(0, 3) + Math.floor(Math.random() * 100);
};
const formatDate = d => d ? new Date(d).toLocaleDateString('ru-RU') : '';
const daysBetween = (d1, d2) => Math.ceil((new Date(d2) - new Date(d1)) / 86400000);

// ТИПЫ ДОКУМЕНТОВ
const documentTypes = {
  contract: { icon: '📄', label: 'Договор' }, receipt: { icon: '🧾', label: 'Чек об оплате' },
  ielts: { icon: '📊', label: 'IELTS сертификат', isExam: true }, sat: { icon: '📈', label: 'SAT сертификат', isExam: true },
  toefl: { icon: '📋', label: 'TOEFL сертификат', isExam: true }, invitation: { icon: '✉️', label: 'Приглашение из университета' },
  motivation: { icon: '💌', label: 'Мотивационное письмо' }, recommendation: { icon: '📝', label: 'Рекомендательное письмо' },
  certificate: { icon: '🏆', label: 'Сертификат/Диплом' }, passport: { icon: '🛂', label: 'Паспорт/ID' },
  transcript: { icon: '📚', label: 'Транскрипт оценок' }, mock_ielts: { icon: '📝', label: 'Пробный IELTS', isExam: true }, mock_sat: { icon: '📝', label: 'Пробный SAT', isExam: true }
};

// GALLUP ТЕСТ
const gallupQuestions = [
  { id: 1, text: "Я предпочитаю работать с данными и цифрами", cat: "analytical" },
  { id: 2, text: "Мне нравится придумывать новые идеи", cat: "creative" },
  { id: 3, text: "Я комфортно руковожу группой людей", cat: "leader" },
  { id: 4, text: "Помощь другим приносит мне удовлетворение", cat: "social" },
  { id: 5, text: "Я люблю разбираться в технологиях", cat: "technical" },
  { id: 6, text: "Я предпочитаю структурированную работу", cat: "organized" },
  { id: 7, text: "Мне интересно исследовать новые темы", cat: "research" },
  { id: 8, text: "Я легко нахожу общий язык с людьми", cat: "social" },
  { id: 9, text: "Мне важен финансовый успех", cat: "finance" },
  { id: 10, text: "Я готов брать ответственность за решения", cat: "leader" },
  { id: 11, text: "Мне нравится работать руками", cat: "technical" },
  { id: 12, text: "Я часто вижу нестандартные решения", cat: "creative" },
  { id: 13, text: "Я предпочитаю глубоко изучить одну тему", cat: "research" },
  { id: 14, text: "Мне комфортно выступать перед аудиторией", cat: "leader" },
  { id: 15, text: "Я обращаю внимание на детали", cat: "analytical" },
  { id: 16, text: "Командная работа мне нравится больше", cat: "social" },
  { id: 17, text: "Я быстро адаптируюсь к новым технологиям", cat: "technical" },
  { id: 18, text: "Мне важно, чтобы работа была полезна обществу", cat: "social" },
  { id: 19, text: "Я умею планировать и организовывать", cat: "organized" },
  { id: 20, text: "Я принимаю решения на основе логики", cat: "analytical" }
];

const careerProfiles = {
  "Аналитик-Исследователь": { cats: ["analytical", "research"], color: "#3B82F6", desc: "Сильное аналитическое мышление.", careers: ["Data Scientist", "Учёный", "Аналитик"], unis: ["MIT", "Stanford", "ETH Zurich"], countries: ["США", "Германия"] },
  "Творческий Визионер": { cats: ["creative"], color: "#8B5CF6", desc: "Креативность и воображение.", careers: ["Дизайнер", "Архитектор", "Маркетолог"], unis: ["RISD", "Parsons"], countries: ["Нидерланды", "Италия"] },
  "Лидер-Организатор": { cats: ["leader", "organized"], color: "#F59E0B", desc: "Прирождённый лидер.", careers: ["Менеджер", "Предприниматель", "CEO"], unis: ["Harvard", "INSEAD"], countries: ["США", "ОАЭ"] },
  "Социальный Помощник": { cats: ["social"], color: "#10B981", desc: "Эмпатия и работа с людьми.", careers: ["Психолог", "Врач", "Учитель"], unis: ["Toronto", "Melbourne"], countries: ["Канада", "Австралия"] },
  "Технический Специалист": { cats: ["technical"], color: "#EF4444", desc: "Техническая подкованность.", careers: ["Инженер", "IT-специалист"], unis: ["TU Munich", "KAIST"], countries: ["Германия", "Корея"] }
};

// ИКОНКИ
const I = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Test: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Results: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Documents: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Briefcase: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Support: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  Right: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Target: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Money: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Letters: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  MockTest: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Save: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
};

// НАЧАЛЬНЫЕ ДАННЫЕ
const getInitialData = () => {
  const saved = localStorage.getItem('nobilis_v2');
  if (saved) try { return JSON.parse(saved); } catch(e) {}
  return {
    students: [
      { id: '1', name: "Алексей Петров", login: "alexey.pet47", password: "Nobilis2024!", email: "alex@mail.com", phone: "+7 999 123-45-67", age: 16, grade: "10 класс", joinDate: "2024-09-15", contractEndDate: "2025-09-15", parentName: "Петров Игорь", parentPhone: "+7 999 765-43-21", testResult: null, testScores: null, targetIelts: "7.5", targetSat: "1500", selectedCountries: ["США", "Германия"], targetUniversities: ["MIT", "TU Munich"], deadlines: { ielts: "2025-03-01", sat: "2025-04-15" }, examResults: [{ id: 'e1', type: "ielts", name: "IELTS", score: "7.0", date: "2024-11-20", breakdown: { listening: 7.5, reading: 7.0, writing: 6.5, speaking: 7.0 } }, { id: 'e2', type: "mock_ielts", name: "Пробный IELTS #1", score: "6.5", date: "2024-09-20" }], attendance: { total: 24, attended: 22 }, documents: [{ id: 'd1', type: "contract", name: "Договор", date: "2024-09-15" }, { id: 'd2', type: "ielts", name: "IELTS Certificate", date: "2024-11-20", score: "7.0" }], letters: [{ id: 'l1', type: "motivation", university: "MIT", status: "draft", content: "Dear Admissions...", lastEdit: "2024-12-10" }], internships: [{ internshipId: '1', status: "applied", appliedDate: "2024-12-01" }] },
      { id: '2', name: "Мария Иванова", login: "maria.iva23", password: "Nobilis2024@", email: "maria@mail.com", phone: "+7 999 234-56-78", age: 17, grade: "11 класс", joinDate: "2024-08-01", contractEndDate: "2025-08-01", parentName: "Иванова Елена", parentPhone: "+7 999 876-54-32", testResult: "Творческий Визионер", testScores: { creative: 28, social: 18 }, targetIelts: "7.5", targetSat: null, selectedCountries: ["Нидерланды"], targetUniversities: ["TU Delft"], deadlines: { ielts: "2025-02-15" }, examResults: [{ id: 'e4', type: "ielts", name: "IELTS", score: "7.5", date: "2024-10-10", breakdown: { listening: 8.0, reading: 7.5, writing: 7.0, speaking: 7.5 } }], attendance: { total: 30, attended: 29 }, documents: [{ id: 'd3', type: "contract", name: "Договор", date: "2024-08-01" }], letters: [{ id: 'l3', type: "motivation", university: "TU Delft", status: "completed", content: "My name is Maria...", lastEdit: "2024-11-20" }], internships: [{ internshipId: '3', status: "accepted", appliedDate: "2024-10-15" }] },
      { id: '3', name: "Дмитрий Козлов", login: "dmitry.koz15", password: "Nobilis2024#", email: "dmitry@mail.com", phone: "+7 999 345-67-89", age: 15, grade: "9 класс", joinDate: "2024-12-01", contractEndDate: "2026-06-01", parentName: "Козлов Андрей", parentPhone: "+7 999 987-65-43", testResult: null, testScores: null, targetIelts: "7.0", targetSat: "1400", selectedCountries: [], targetUniversities: [], deadlines: { ielts: "2025-12-01" }, examResults: [{ id: 'e5', type: "mock_ielts", name: "Пробный IELTS", score: "5.0", date: "2024-10-25" }], attendance: { total: 12, attended: 10 }, documents: [{ id: 'd5', type: "contract", name: "Договор", date: "2024-10-01" }], letters: [], internships: [] }
    ],
    teachers: [
      { id: '1', name: "Смирнова Анна Владимировна", login: "smirnova.ann", password: "Teacher2024!", email: "smirnova@nobilis.edu", phone: "+7 999 111-22-33", subject: "Английский / IELTS", hourlyRate: 2500, hoursWorked: 48, totalLessons: 32, lessons: [{ id: 'tl1', date: "2024-12-09", scheduleId: '1', status: "conducted", hours: 1.5, confirmed: true }, { id: 'tl2', date: "2024-12-12", scheduleId: '1', status: "cancelled", hours: 0, note: "Больничный", confirmed: false }], syllabus: [{ id: 's1', course: "IELTS Prep", weeks: 12, topics: ["Listening", "Reading", "Writing", "Speaking"], progress: 75, students: ['1', '2'] }] },
      { id: '2', name: "Петров Иван Константинович", login: "petrov.iva", password: "Teacher2024@", email: "petrov@nobilis.edu", phone: "+7 999 222-33-44", subject: "Математика / SAT", hourlyRate: 2800, hoursWorked: 36, totalLessons: 24, lessons: [{ id: 'tl4', date: "2024-12-13", scheduleId: '3', status: "conducted", hours: 1.5, confirmed: true }], syllabus: [{ id: 's3', course: "SAT Math", weeks: 16, topics: ["Algebra", "Geometry", "Statistics"], progress: 60, students: ['1', '3'] }] },
      { id: '3', name: "Дизайнова Анна Сергеевна", login: "anna.dsgn", password: "Teacher2024#", email: "anna@nobilis.edu", phone: "+7 999 333-44-55", subject: "Портфолио / Дизайн", hourlyRate: 3000, hoursWorked: 24, totalLessons: 12, lessons: [], syllabus: [{ id: 's4', course: "Portfolio", weeks: 10, topics: ["Concept", "Execution"], progress: 40, students: ['2'] }] }
    ],
    schedule: [
      { id: '1', subject: "Подготовка к IELTS", teacherId: '1', day: "Понедельник", time: "16:00", duration: 90, room: "201", students: ['1', '2'] },
      { id: '2', subject: "Профориентация", teacherId: null, day: "Среда", time: "15:00", duration: 60, room: "105", students: ['1', '2', '3'], isCurator: true },
      { id: '3', subject: "SAT Math", teacherId: '2', day: "Пятница", time: "17:00", duration: 90, room: "203", students: ['1', '3'] },
      { id: '4', subject: "Portfolio Workshop", teacherId: '3', day: "Вторник", time: "16:00", duration: 120, room: "Studio", students: ['2'] },
      { id: '5', subject: "Academic Writing", teacherId: '1', day: "Четверг", time: "15:30", duration: 90, room: "201", students: ['1', '2', '3'] }
    ],
    mockTests: [
      { id: '1', type: "ielts", name: "Пробный IELTS Январь", date: "2025-01-11", time: "10:00", room: "301", students: ['1', '2', '3'] },
      { id: '2', type: "sat", name: "Пробный SAT Январь", date: "2025-01-18", time: "09:00", room: "302", students: ['1', '3'] }
    ],
    internships: [
      { id: '1', name: "Google Summer of Code", country: "США", type: "IT", requirements: "IELTS 7.0+", deadline: "2025-03-15", link: "https://summerofcode.withgoogle.com", description: "Программа для разработчиков" },
      { id: '2', name: "CERN Summer Student", country: "Швейцария", type: "Наука", requirements: "IELTS 6.5+", deadline: "2025-01-25", link: "https://careers.cern.ch", description: "Летняя программа в ЦЕРН" },
      { id: '3', name: "Design Week Milan", country: "Италия", type: "Дизайн", requirements: "Portfolio", deadline: "2025-02-28", link: "https://designweek.it", description: "Стажировка на неделе дизайна" }
    ],
    supportTickets: [{ id: '1', studentId: '3', studentName: "Дмитрий Козлов", message: "Не могу зайти в ЛК", priority: "high", created: "2024-12-10T10:30:00", deadline: "2024-12-12T10:30:00", status: "open" }],
    attendance: {}
  };
};

// МОДАЛЬНОЕ ОКНО
const Modal = ({ title, children, onClose, size = 'md' }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-2xl ${size === 'lg' ? 'max-w-4xl' : 'max-w-lg'} w-full max-h-[90vh] overflow-hidden animate-slideIn`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a]">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><I.Close /></button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
    </div>
  </div>
);

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================
export default function NobilisAcademy() {
  const [data, setData] = useState(getInitialData);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({});
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [testAnswers, setTestAnswers] = useState({});
  const [testQ, setTestQ] = useState(0);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attSchedule, setAttSchedule] = useState(null);
  const [sylSearch, setSylSearch] = useState('');

  useEffect(() => { localStorage.setItem('nobilis_v2', JSON.stringify(data)); }, [data]);

  const upd = useCallback((k, v) => setData(p => ({ ...p, [k]: v })), []);

  // AUTH
  const handleLogin = () => {
    const { login, password } = loginForm;
    if (login === 'curator' && password === 'curator2024') { setUser({ role: 'curator', id: 'c', name: 'Куратор Мария' }); return; }
    const s = data.students.find(x => x.login === login && x.password === password);
    if (s) { setUser({ role: 'student', ...s }); return; }
    const t = data.teachers.find(x => x.login === login && x.password === password);
    if (t) { setUser({ role: 'teacher', ...t }); return; }
    setLoginError('Неверный логин или пароль');
  };

  const logout = () => { setUser(null); setLoginForm({ login: '', password: '' }); setLoginError(''); setView('dashboard'); setModal(null); };

  // CRUD
  const getStudent = () => data.students.find(s => s.id === user?.id) || user;
  const getTeacher = () => data.teachers.find(t => t.id === user?.id) || user;

  const addStudent = d => { const n = { id: Date.now().toString(), ...d, joinDate: new Date().toISOString().split('T')[0], testResult: null, examResults: [], attendance: { total: 0, attended: 0 }, documents: [{ id: Date.now().toString(), type: 'contract', name: 'Договор', date: new Date().toISOString().split('T')[0] }], letters: [], internships: [] }; upd('students', [...data.students, n]); return n; };
  const updStudent = (id, u) => upd('students', data.students.map(s => s.id === id ? { ...s, ...u } : s));
  const delStudent = id => upd('students', data.students.filter(s => s.id !== id));

  const addTeacher = d => { const n = { id: Date.now().toString(), ...d, hoursWorked: 0, totalLessons: 0, lessons: [], syllabus: [] }; upd('teachers', [...data.teachers, n]); return n; };
  const updTeacher = (id, u) => upd('teachers', data.teachers.map(t => t.id === id ? { ...t, ...u } : t));
  const delTeacher = id => { upd('teachers', data.teachers.filter(t => t.id !== id)); upd('schedule', data.schedule.map(s => s.teacherId === id ? { ...s, teacherId: null } : s)); };

  const addSchedule = d => { const n = { id: Date.now().toString(), ...d }; upd('schedule', [...data.schedule, n]); return n; };
  const updSchedule = (id, u) => upd('schedule', data.schedule.map(s => s.id === id ? { ...s, ...u } : s));
  const delSchedule = id => upd('schedule', data.schedule.filter(s => s.id !== id));

  const addMockTest = d => { const n = { id: Date.now().toString(), ...d }; upd('mockTests', [...data.mockTests, n]); return n; };
  const updMockTest = (id, u) => upd('mockTests', data.mockTests.map(t => t.id === id ? { ...t, ...u } : t));
  const delMockTest = id => upd('mockTests', data.mockTests.filter(t => t.id !== id));

  const addInternship = d => { const n = { id: Date.now().toString(), ...d }; upd('internships', [...data.internships, n]); return n; };
  const updInternship = (id, u) => upd('internships', data.internships.map(i => i.id === id ? { ...i, ...u } : i));
  const delInternship = id => upd('internships', data.internships.filter(i => i.id !== id));

  const addDoc = (sid, doc) => { const d = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...doc }; upd('students', data.students.map(s => s.id === sid ? { ...s, documents: [...s.documents, d] } : s)); if (documentTypes[doc.type]?.isExam && doc.score) { const e = { id: Date.now().toString(), type: doc.type, name: documentTypes[doc.type].label, score: doc.score, date: d.date }; upd('students', data.students.map(s => s.id === sid ? { ...s, examResults: [...s.examResults, e] } : s)); } };
  const delDoc = (sid, did) => upd('students', data.students.map(s => s.id === sid ? { ...s, documents: s.documents.filter(d => d.id !== did) } : s));

  const addLetter = (sid, l) => { const n = { id: Date.now().toString(), lastEdit: new Date().toISOString().split('T')[0], ...l }; upd('students', data.students.map(s => s.id === sid ? { ...s, letters: [...s.letters, n] } : s)); };
  const updLetter = (sid, lid, u) => upd('students', data.students.map(s => s.id === sid ? { ...s, letters: s.letters.map(l => l.id === lid ? { ...l, ...u, lastEdit: new Date().toISOString().split('T')[0] } : l) } : s));
  const delLetter = (sid, lid) => upd('students', data.students.map(s => s.id === sid ? { ...s, letters: s.letters.filter(l => l.id !== lid) } : s));

  const addSyllabus = (tid, syl) => { const t = data.teachers.find(x => x.id === tid); if (t) { const n = { id: Date.now().toString(), progress: 0, students: [], ...syl }; updTeacher(tid, { syllabus: [...t.syllabus, n] }); } };
  const updSyllabus = (tid, sid, u) => { const t = data.teachers.find(x => x.id === tid); if (t) updTeacher(tid, { syllabus: t.syllabus.map(s => s.id === sid ? { ...s, ...u } : s) }); };
  const delSyllabus = (tid, sid) => { const t = data.teachers.find(x => x.id === tid); if (t) updTeacher(tid, { syllabus: t.syllabus.filter(s => s.id !== sid) }); };

  const markAtt = (schId, stuId, date, status) => { const k = `${schId}_${date}`; upd('attendance', { ...data.attendance, [k]: { ...(data.attendance[k] || {}), [stuId]: status } }); };

  const markLesson = (tid, lesson) => { const t = data.teachers.find(x => x.id === tid); if (t) updTeacher(tid, { lessons: [...t.lessons, { id: Date.now().toString(), ...lesson, confirmed: false }] }); };
  const confirmLesson = (tid, lid) => { const t = data.teachers.find(x => x.id === tid); if (t) { const lessons = t.lessons.map(l => l.id === lid ? { ...l, confirmed: true } : l); const hrs = lessons.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0); updTeacher(tid, { lessons, hoursWorked: hrs, totalLessons: lessons.filter(l => l.confirmed && l.status === 'conducted').length }); } };

  const applyInternship = (sid, iid) => upd('students', data.students.map(s => s.id === sid ? { ...s, internships: [...s.internships, { internshipId: iid, status: 'applied', appliedDate: new Date().toISOString().split('T')[0] }] } : s));
  const resolveTicket = id => upd('supportTickets', data.supportTickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  const addTicket = (sid, msg) => { const s = data.students.find(x => x.id === sid); upd('supportTickets', [...data.supportTickets, { id: Date.now().toString(), studentId: sid, studentName: s?.name || '', message: msg, priority: 'normal', created: new Date().toISOString(), deadline: new Date(Date.now() + 48 * 3600000).toISOString(), status: 'open' }]); };

  // TEST
  const calcTest = () => { const scores = {}; Object.entries(testAnswers).forEach(([q, v]) => { const cat = gallupQuestions.find(x => x.id === +q)?.cat; if (cat) scores[cat] = (scores[cat] || 0) + v; }); let best = null, bs = 0; Object.entries(careerProfiles).forEach(([n, p]) => { const sc = p.cats.reduce((s, c) => s + (scores[c] || 0), 0); if (sc > bs) { bs = sc; best = n; } }); return { profile: best, scores }; };
  const submitTest = () => { if (Object.keys(testAnswers).length < 20) { alert('Ответьте на все вопросы'); return; } const r = calcTest(); if (user?.role === 'student') { updStudent(user.id, { testResult: r.profile, testScores: r.scores }); setUser(p => ({ ...p, testResult: r.profile, testScores: r.scores })); } setTestAnswers({}); setTestQ(0); setView('results'); };

  // NAV
  const navItems = user?.role === 'student' ? [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard }, { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'test', label: 'Профориентация', icon: I.Test }, { id: 'results', label: 'Результаты', icon: I.Results },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest }, { id: 'letters', label: 'Письма', icon: I.Letters },
    { id: 'internships', label: 'Стажировки', icon: I.Briefcase }, { id: 'documents', label: 'Документы', icon: I.Documents }
  ] : user?.role === 'curator' ? [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard }, { id: 'students', label: 'Студенты', icon: I.Users },
    { id: 'attendance', label: 'Посещаемость', icon: I.Check }, { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest }, { id: 'teachers', label: 'Преподаватели', icon: I.Users },
    { id: 'salary', label: 'Зарплаты', icon: I.Money }, { id: 'support', label: 'Поддержка', icon: I.Support },
    { id: 'internships', label: 'Стажировки', icon: I.Briefcase }
  ] : [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard }, { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'students', label: 'Студенты', icon: I.Users }, { id: 'syllabus', label: 'Силлабус', icon: I.Book },
    { id: 'lessons', label: 'Уроки', icon: I.Check }
  ];

  // ============================================================
  // ЭКРАН ВХОДА - КРАСИВЫЙ ДИЗАЙН
  // ============================================================
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-4 login-bg relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 border border-[#c9a227]/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-48 h-48 border border-[#c9a227]/15 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 border border-[#c9a227]/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 border border-[#c9a227]/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        {/* Звёзды/точки */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-[#c9a227]/30 rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}></div>
        ))}
      </div>
      
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-[#c9a227]/30 shadow-2xl animate-fadeIn">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 animate-pulse-slow">
            <NobilisLogo size={90} />
          </div>
          <h1 className="text-4xl font-serif text-white tracking-wide">NOBILIS</h1>
          <p className="text-[#c9a227] text-sm tracking-[0.3em] mt-1 font-medium">ACADEMY</p>
          <p className="text-white/50 text-xs mt-3">Образовательная платформа нового поколения</p>
        </div>
        
        {/* Форма */}
        <div className="space-y-4">
          <div className="relative">
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
          <div className="relative">
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
          
          <button 
            onClick={handleLogin}
            className="w-full py-4 rounded-xl font-semibold text-[#1a3a32] text-lg btn-gold mt-2"
          >
            Войти в систему
          </button>
        </div>
        
        {/* Демо доступ */}
        <div className="mt-8 pt-6 border-t border-[#c9a227]/20">
          <p className="text-xs text-[#c9a227]/60 text-center mb-4">Демонстрационный доступ</p>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setLoginForm({ login: 'curator', password: 'curator2024' })}
              className="p-3 bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-xl text-[#c9a227] transition-all hover:scale-105"
            >
              <div className="text-xl mb-1">👨‍💼</div>
              <div className="text-xs font-medium">Куратор</div>
            </button>
            <button 
              onClick={() => setLoginForm({ login: 'alexey.pet47', password: 'Nobilis2024!' })}
              className="p-3 bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-xl text-[#c9a227] transition-all hover:scale-105"
            >
              <div className="text-xl mb-1">🎓</div>
              <div className="text-xs font-medium">Студент</div>
            </button>
            <button 
              onClick={() => setLoginForm({ login: 'smirnova.ann', password: 'Teacher2024!' })}
              className="p-3 bg-[#c9a227]/10 hover:bg-[#c9a227]/20 border border-[#c9a227]/30 rounded-xl text-[#c9a227] transition-all hover:scale-105"
            >
              <div className="text-xl mb-1">👩‍🏫</div>
              <div className="text-xs font-medium">Препод</div>
            </button>
          </div>
        </div>
        
        {/* Футер */}
        <p className="text-center text-white/30 text-xs mt-6">© 2024 Nobilis Academy. Все права защищены.</p>
      </div>
    </div>
  );

  // ============================================================
  // РЕНДЕР КОНТЕНТА
  // ============================================================
  const renderContent = () => {
    // STUDENT DASHBOARD
    if (user.role === 'student' && view === 'dashboard') {
      const s = getStudent(); const days = daysBetween(s.joinDate, new Date());
      const mySchedule = data.schedule.filter(x => x.students?.includes(s.id));
      const daysRu = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
      const today = daysRu[new Date().getDay()];
      const todayClasses = mySchedule.filter(x => x.day === today);
      const deadlines = Object.entries(s.deadlines || {}).map(([k, v]) => ({ type: k, date: v, d: daysBetween(new Date(), v) })).filter(x => x.d > 0 && x.d <= 60).sort((a, b) => a.d - b.d);
      const lastExam = s.examResults?.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-800">Привет, {s.name.split(' ')[0]}! 👋</h1><p className="text-gray-500">{days === 0 ? 'Добро пожаловать!' : `${days} дней с нами`}</p></div>
            <button onClick={() => { setModal('support'); setForm({}); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Support /><span>Поддержка</span></button></div>
          {todayClasses.length > 0 && <div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-4 text-white"><div className="flex items-center gap-2 mb-2"><I.Bell /><span className="font-semibold">Сегодня занятия:</span></div><div className="space-y-2">{todayClasses.map(c => { const t = data.teachers.find(x => x.id === c.teacherId); return <div key={c.id} className="bg-white/10 rounded-xl p-3 flex justify-between cursor-pointer hover:bg-white/20 transition-all card-hover" onClick={() => { setSelected(c); setModal('scheduleDetail'); }}><div><div className="font-medium">{c.subject}</div><div className="text-sm text-white/70">{c.time} • Каб. {c.room} {t ? `• ${t.name.split(' ')[0]}` : ''}</div></div><I.Right /></div>; })}</div></div>}
          {deadlines.length > 0 && <div className={`rounded-2xl p-4 ${deadlines[0].d <= 30 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}><h3 className="font-semibold mb-2">{deadlines[0].d <= 30 ? '⚠️' : '📅'} Ближайшие дедлайны</h3><div className="space-y-2">{deadlines.slice(0, 3).map(x => <div key={x.type} className="flex justify-between"><span>{x.type.toUpperCase()}</span><span className={`font-medium ${x.d <= 30 ? 'text-red-600' : 'text-yellow-600'}`}>{formatDate(x.date)} ({x.d} дн)</span></div>)}</div></div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#1a3a32]">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}%</div><div className="text-sm text-gray-500">Посещаемость</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#c9a227]">{lastExam?.score || '—'}</div><div className="text-sm text-gray-500">Последний экзамен</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-emerald-600">{s.testResult ? '✓' : '—'}</div><div className="text-sm text-gray-500">Профориентация</div></div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-xl font-bold text-blue-600 truncate">{s.targetUniversities?.[0] || '—'}</div><div className="text-sm text-gray-500">Целевой ВУЗ</div></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Моё расписание</h3><div className="space-y-2">{mySchedule.length > 0 ? mySchedule.map(x => { const t = data.teachers.find(y => y.id === x.teacherId); return <div key={x.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all card-hover" onClick={() => { setSelected(x); setModal('scheduleDetail'); }}><div className="w-24 text-sm text-gray-500">{x.day}</div><div className="w-16 font-medium">{x.time}</div><div className="flex-1">{x.subject}</div><div className="text-sm text-gray-500">Каб. {x.room}</div><I.Right /></div>; }) : <p className="text-gray-500 text-center py-4">Нет занятий</p>}</div></div>
        </div>
      );
    }

    // STUDENT SCHEDULE
    if (user.role === 'student' && view === 'schedule') {
      const s = getStudent(); const mySchedule = data.schedule.filter(x => x.students?.includes(s.id));
      const daysOrder = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
      const sorted = [...mySchedule].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Моё расписание</h1><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{sorted.map(x => { const t = data.teachers.find(y => y.id === x.teacherId); return <div key={x.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all" onClick={() => { setSelected(x); setModal('scheduleDetail'); }}><div className="w-28 font-medium text-[#1a3a32]">{x.day}</div><div className="w-20 text-lg font-semibold">{x.time}</div><div className="flex-1"><div className="font-medium">{x.subject}</div><div className="text-sm text-gray-500">{t?.name || (x.isCurator ? 'Куратор' : '—')}</div></div><div className="text-sm bg-gray-100 px-3 py-1 rounded-full">Каб. {x.room}</div><I.Right /></div>; })}</div></div>;
    }

    // STUDENT TEST
    if (user.role === 'student' && view === 'test') {
      const s = getStudent();
      if (s.testResult) { const p = careerProfiles[s.testResult]; return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Результаты профориентации</h1><div className="bg-white rounded-2xl p-6 shadow-sm border"><div className="text-center mb-6"><div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4" style={{ backgroundColor: p?.color + '20' }}>🎯</div><h2 className="text-2xl font-bold" style={{ color: p?.color }}>{s.testResult}</h2><p className="text-gray-600 mt-2">{p?.desc}</p></div><div className="grid md:grid-cols-2 gap-6"><div><h4 className="font-semibold mb-3">Профессии:</h4><div className="flex flex-wrap gap-2">{p?.careers.map(c => <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{c}</span>)}</div></div><div><h4 className="font-semibold mb-3">ВУЗы:</h4><div className="flex flex-wrap gap-2">{p?.unis.map(u => <span key={u} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{u}</span>)}</div></div></div><button onClick={() => { updStudent(s.id, { testResult: null, testScores: null }); setUser(prev => ({ ...prev, testResult: null, testScores: null })); }} className="mt-6 px-4 py-2 border border-gray-300 rounded-xl btn-outline">Пройти заново</button></div></div>; }
      const q = gallupQuestions[testQ]; const progress = (Object.keys(testAnswers).length / 20) * 100;
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Тест профориентации</h1><div className="bg-white rounded-2xl p-6 shadow-sm border"><div className="mb-6"><div className="flex justify-between text-sm text-gray-500 mb-2"><span>Вопрос {testQ + 1}/20</span><span>{Math.round(progress)}%</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-[#c9a227] rounded-full transition-all" style={{ width: `${progress}%` }}></div></div></div><p className="text-xl font-medium text-center mb-8">{q.text}</p><div className="space-y-3">{[1,2,3,4,5,6,7].map(v => <button key={v} onClick={() => setTestAnswers(p => ({ ...p, [q.id]: v }))} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${testAnswers[q.id] === v ? 'border-[#c9a227] bg-[#c9a227]/10' : 'border-gray-200 hover:border-gray-300'}`}><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${testAnswers[q.id] === v ? 'border-[#c9a227] bg-[#c9a227]' : 'border-gray-300'}`}>{testAnswers[q.id] === v && <div className="w-2 h-2 bg-white rounded-full"></div>}</div><span>{['Совсем нет','Нет','Скорее нет','Нейтрально','Скорее да','Да','Полностью да'][v-1]}</span></div></button>)}</div><div className="flex justify-between mt-8"><button onClick={() => setTestQ(p => Math.max(0, p - 1))} disabled={testQ === 0} className="px-6 py-2 border border-gray-300 rounded-xl btn-outline disabled:opacity-50">Назад</button>{testQ < 19 ? <button onClick={() => setTestQ(p => Math.min(19, p + 1))} disabled={!testAnswers[q.id]} className="px-6 py-2 btn-primary text-white rounded-xl disabled:opacity-50">Далее</button> : <button onClick={submitTest} disabled={Object.keys(testAnswers).length < 20} className="px-6 py-2 btn-gold text-[#1a3a32] rounded-xl disabled:opacity-50">Завершить</button>}</div></div></div>;
    }

    // STUDENT RESULTS
    if (user.role === 'student' && view === 'results') {
      const s = getStudent(); const off = s.examResults?.filter(e => !e.type.startsWith('mock_')) || []; const mocks = s.examResults?.filter(e => e.type.startsWith('mock_')) || [];
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Мои результаты</h1><div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-6 text-white"><h3 className="font-semibold mb-4 flex items-center gap-2"><I.Target /> Мои цели</h3><div className="grid grid-cols-2 gap-4">{s.targetIelts && <div className="bg-white/10 rounded-xl p-4"><div className="text-sm text-white/70">IELTS цель</div><div className="text-2xl font-bold">{s.targetIelts}</div></div>}{s.targetSat && <div className="bg-white/10 rounded-xl p-4"><div className="text-sm text-white/70">SAT цель</div><div className="text-2xl font-bold">{s.targetSat}</div></div>}</div></div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Официальные экзамены</h3>{off.length > 0 ? <div className="space-y-3">{off.map(e => <div key={e.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected(e); setModal('examDetail'); }}><div className="flex justify-between"><div><div className="font-medium">{e.name}</div><div className="text-sm text-gray-500">{formatDate(e.date)}</div></div><div className="text-2xl font-bold text-[#1a3a32]">{e.score}</div></div>{e.breakdown && <div className="mt-3 grid grid-cols-4 gap-2 text-sm">{Object.entries(e.breakdown).map(([k, v]) => <div key={k} className="text-center p-2 bg-white rounded-lg"><div className="text-gray-500 capitalize">{k}</div><div className="font-semibold">{v}</div></div>)}</div>}</div>)}</div> : <p className="text-gray-500 text-center py-4">Нет результатов</p>}</div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Пробные тесты</h3>{mocks.length > 0 ? <div className="space-y-2">{mocks.map(e => <div key={e.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{e.name}</div><div className="text-sm text-gray-500">{formatDate(e.date)}</div></div><div className="text-xl font-bold text-[#c9a227]">{e.score}</div></div>)}</div> : <p className="text-gray-500 text-center py-4">Нет результатов</p>}</div></div>;
    }

    // STUDENT MOCK TESTS
    if (user.role === 'student' && view === 'mockTests') {
      const s = getStudent(); const my = data.mockTests.filter(t => t.students?.includes(s.id));
      const upcoming = my.filter(t => new Date(t.date) >= new Date()); const past = my.filter(t => new Date(t.date) < new Date());
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Пробные тесты</h1><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Предстоящие</h3>{upcoming.length > 0 ? <div className="space-y-3">{upcoming.map(t => <div key={t.id} className="p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 card-hover" onClick={() => { setSelected(t); setModal('mockTestDetail'); }}><div className="flex justify-between"><div><div className="font-medium">{t.name}</div><div className="text-sm text-gray-600">{formatDate(t.date)} в {t.time} • Каб. {t.room}</div></div><span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm uppercase">{t.type}</span></div></div>)}</div> : <p className="text-gray-500 text-center py-4">Нет тестов</p>}</div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Прошедшие</h3>{past.length > 0 ? <div className="space-y-2">{past.map(t => { const r = s.examResults?.find(e => e.name === t.name); return <div key={t.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{formatDate(t.date)}</div></div><div className="text-lg font-bold">{r?.score || '—'}</div></div>; })}</div> : <p className="text-gray-500 text-center py-4">Нет тестов</p>}</div></div>;
    }

    // STUDENT LETTERS
    if (user.role === 'student' && view === 'letters') {
      const s = getStudent(); const mot = s.letters?.filter(l => l.type === 'motivation') || []; const rec = s.letters?.filter(l => l.type === 'recommendation') || [];
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Письма</h1><button onClick={() => { setForm({ type: 'motivation', university: '', status: 'draft', content: '' }); setModal('addLetter'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Создать</span></button></div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Мотивационные</h3>{mot.length > 0 ? <div className="space-y-3">{mot.map(l => <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected({ ...l, studentId: s.id }); setModal('letterDetail'); }}><div className="flex justify-between"><div><div className="font-medium">{l.university || 'Без названия'}</div><div className="text-sm text-gray-500">Изменено: {formatDate(l.lastEdit)}</div></div><span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'completed' ? 'Готово' : 'Черновик'}</span></div></div>)}</div> : <p className="text-gray-500 text-center py-4">Нет писем</p>}</div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Рекомендательные</h3>{rec.length > 0 ? <div className="space-y-3">{rec.map(l => <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected({ ...l, studentId: s.id }); setModal('letterDetail'); }}><div className="flex justify-between"><div><div className="font-medium">{l.author}</div><div className="text-sm text-gray-500">{l.subject}</div></div><span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'completed' ? 'Получено' : 'Запрошено'}</span></div></div>)}</div> : <p className="text-gray-500 text-center py-4">Нет писем</p>}</div></div>;
    }

    // STUDENT INTERNSHIPS
    if (user.role === 'student' && view === 'internships') {
      const s = getStudent(); const applied = s.internships?.map(i => ({ ...i, det: data.internships.find(x => x.id === i.internshipId) })).filter(i => i.det) || [];
      const avail = data.internships.filter(i => !s.internships?.some(x => x.internshipId === i.id));
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Стажировки</h1>{applied.length > 0 && <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Мои заявки</h3><div className="space-y-3">{applied.map(i => <div key={i.internshipId} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected(i.det); setModal('internshipDetail'); }}><div className="flex justify-between"><div><div className="font-medium">{i.det.name}</div><div className="text-sm text-gray-500">{i.det.country} • Подана: {formatDate(i.appliedDate)}</div></div><span className={`px-3 py-1 rounded-full text-sm ${i.status === 'accepted' ? 'bg-green-100 text-green-700' : i.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{i.status === 'accepted' ? 'Принята' : i.status === 'rejected' ? 'Отклонена' : 'На рассмотрении'}</span></div></div>)}</div></div>}<div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Доступные</h3><div className="space-y-3">{avail.map(i => <div key={i.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected(i); setModal('internshipDetail'); }}><div className="flex justify-between mb-2"><div className="font-medium">{i.name}</div><span className="text-sm text-gray-500">{i.country}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">{i.type}</span><span className={`font-medium ${daysBetween(new Date(), i.deadline) <= 30 ? 'text-red-600' : 'text-gray-600'}`}>Дедлайн: {formatDate(i.deadline)}</span></div></div>)}</div></div></div>;
    }

    // STUDENT DOCUMENTS
    if (user.role === 'student' && view === 'documents') {
      const s = getStudent(); const docs = s.documents || [];
      const grouped = docs.reduce((acc, d) => { const cat = documentTypes[d.type]?.isExam ? 'exams' : d.type === 'contract' || d.type === 'receipt' ? 'admin' : 'other'; acc[cat] = [...(acc[cat] || []), d]; return acc; }, {});
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Документы</h1>{['admin', 'exams', 'other'].map(cat => grouped[cat]?.length > 0 && <div key={cat} className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">{cat === 'admin' ? 'Административные' : cat === 'exams' ? 'Экзамены' : 'Другие'}</h3><div className="space-y-2">{grouped[cat].map(d => <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover" onClick={() => { setSelected({ ...d, studentId: s.id }); setModal('documentDetail'); }}><div className="flex items-center gap-3"><span className="text-2xl">{documentTypes[d.type]?.icon || '📄'}</span><div><div className="font-medium">{d.name}</div><div className="text-sm text-gray-500">{formatDate(d.date)} {d.score && `• Балл: ${d.score}`}</div></div></div><I.Right /></div>)}</div></div>)}</div>;
    }

    // ==================== CURATOR ====================

    // CURATOR DASHBOARD
    if (user.role === 'curator' && view === 'dashboard') {
      const openTix = data.supportTickets.filter(t => t.status === 'open');
      const urgent = openTix.filter(t => new Date(t.deadline) <= new Date());
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Панель куратора</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#1a3a32]">{data.students.length}</div><div className="text-sm text-gray-500">Студентов</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#c9a227]">{data.teachers.length}</div><div className="text-sm text-gray-500">Преподавателей</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-blue-600">{data.schedule.length}</div><div className="text-sm text-gray-500">Занятий</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className={`text-3xl font-bold ${urgent.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{openTix.length}</div><div className="text-sm text-gray-500">Заявок</div></div></div>{urgent.length > 0 && <div className="bg-red-50 border border-red-200 rounded-2xl p-4"><h3 className="font-semibold text-red-700 mb-3">⚠️ Просроченные заявки</h3><div className="space-y-2">{urgent.map(t => <div key={t.id} className="flex justify-between p-3 bg-white rounded-xl"><div><div className="font-medium">{t.studentName}</div><div className="text-sm text-gray-500">{t.message}</div></div><button onClick={() => resolveTicket(t.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Решить</button></div>)}</div></div>}<div className="grid md:grid-cols-2 gap-6"><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Быстрые действия</h3><div className="grid grid-cols-2 gap-3"><button onClick={() => { setForm({}); setModal('addStudent'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Студент</button><button onClick={() => { setForm({}); setModal('addTeacher'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Преподаватель</button><button onClick={() => { setForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); setModal('addSchedule'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Расписание</button><button onClick={() => { setForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); setModal('addMockTest'); }} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover">+ Пробный тест</button></div></div><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Предстоящие тесты</h3><div className="space-y-2">{data.mockTests.filter(t => new Date(t.date) >= new Date()).slice(0, 3).map(t => <div key={t.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{formatDate(t.date)}</div></div><span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{t.students?.length || 0} студ.</span></div>)}</div></div></div></div>;
    }

    // CURATOR STUDENTS
    if (user.role === 'curator' && view === 'students') {
      const filtered = data.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Студенты</h1><button onClick={() => { setForm({ name: '', email: '', phone: '', age: '', grade: '', parentName: '', parentPhone: '', contractEndDate: '', targetIelts: '', targetSat: '' }); setModal('addStudent'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить</span></button></div><div className="relative"><I.Search /><input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 pl-10 border rounded-xl input-focus" placeholder="Поиск по имени..." /></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{filtered.map(s => <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all" onClick={() => { setSelected(s); setModal('studentDetail'); }}><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white font-semibold">{s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div className="flex-1"><div className="font-medium">{s.name}</div><div className="text-sm text-gray-500">{s.grade} • {s.email}</div></div><div className="text-right"><div className="text-sm font-medium">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}% посещ.</div><div className="text-sm text-gray-500">{s.testResult || 'Тест не пройден'}</div></div><I.Right /></div>)}</div></div>;
    }

    // CURATOR ATTENDANCE
    if (user.role === 'curator' && view === 'attendance') {
      const daysRu = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
      const dayName = daysRu[new Date(attDate).getDay()];
      const todaySchedule = data.schedule.filter(s => s.day === dayName);
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Посещаемость</h1><div className="flex gap-4"><input type="date" value={attDate} onChange={e => { setAttDate(e.target.value); setAttSchedule(null); }} className="px-4 py-2 border rounded-xl input-focus" /><span className="px-4 py-2 bg-gray-100 rounded-xl">{dayName}</span></div>{todaySchedule.length > 0 ? <div className="grid md:grid-cols-2 gap-6"><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Занятия</h3><div className="space-y-2">{todaySchedule.map(s => <button key={s.id} onClick={() => setAttSchedule(s)} className={`w-full p-3 rounded-xl text-left transition-all ${attSchedule?.id === s.id ? 'bg-[#1a3a32] text-white' : 'bg-gray-50 hover:bg-gray-100'}`}><div className="font-medium">{s.subject}</div><div className={`text-sm ${attSchedule?.id === s.id ? 'text-white/70' : 'text-gray-500'}`}>{s.time} • Каб. {s.room}</div></button>)}</div></div>{attSchedule && <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Отметить</h3><div className="space-y-2">{attSchedule.students?.map(sid => { const st = data.students.find(x => x.id === sid); const k = `${attSchedule.id}_${attDate}`; const status = data.attendance[k]?.[sid]; return st && <div key={sid} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><span className="font-medium">{st.name}</span><div className="flex gap-2">{['present', 'absent', 'late'].map(stat => <button key={stat} onClick={() => markAtt(attSchedule.id, sid, attDate, stat)} className={`px-3 py-1 rounded-lg text-sm transition-all ${status === stat ? (stat === 'present' ? 'bg-green-600 text-white' : stat === 'absent' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white') : 'bg-gray-200 hover:bg-gray-300'}`}>{stat === 'present' ? '✓' : stat === 'absent' ? '✗' : 'П'}</button>)}</div></div>; })}</div></div>}</div> : <p className="text-gray-500">Нет занятий</p>}</div>;
    }

    // CURATOR SCHEDULE
    if (user.role === 'curator' && view === 'schedule') {
      const daysOrder = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
      const sorted = [...data.schedule].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day) || a.time.localeCompare(b.time));
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Расписание</h1><button onClick={() => { setForm({ subject: '', teacherId: '', day: 'Понедельник', time: '16:00', duration: 90, room: '', students: [] }); setModal('addSchedule'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить</span></button></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{sorted.map(s => { const t = data.teachers.find(x => x.id === s.teacherId); return <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all"><div className="w-28 font-medium text-[#1a3a32]">{s.day}</div><div className="w-16 font-semibold">{s.time}</div><div className="flex-1"><div className="font-medium">{s.subject}</div><div className="text-sm text-gray-500">{t?.name || (s.isCurator ? 'Куратор' : '—')}</div></div><div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{s.students?.length || 0} студ.</div><div className="flex gap-2"><button onClick={() => { setForm(s); setSelected(s); setModal('editSchedule'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button><button onClick={() => { if (window.confirm('Удалить?')) delSchedule(s.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button></div></div>; })}</div></div>;
    }

    // CURATOR MOCK TESTS
    if (user.role === 'curator' && view === 'mockTests') {
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Пробные тесты</h1><button onClick={() => { setForm({ type: 'ielts', name: '', date: '', time: '10:00', room: '', students: [] }); setModal('addMockTest'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить</span></button></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{data.mockTests.map(t => <div key={t.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all"><span className={`px-3 py-1 rounded-full text-sm uppercase ${t.type === 'ielts' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{t.type}</span><div className="flex-1"><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{formatDate(t.date)} в {t.time} • Каб. {t.room}</div></div><div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{t.students?.length || 0} студ.</div><div className="flex gap-2"><button onClick={() => { setForm(t); setSelected(t); setModal('editMockTest'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button><button onClick={() => { if (window.confirm('Удалить?')) delMockTest(t.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button></div></div>)}</div></div>;
    }

    // CURATOR TEACHERS
    if (user.role === 'curator' && view === 'teachers') {
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Преподаватели</h1><button onClick={() => { setForm({ name: '', email: '', phone: '', subject: '', hourlyRate: 2500 }); setModal('addTeacher'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить</span></button></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{data.teachers.map(t => <div key={t.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a227] to-[#a68620] flex items-center justify-center text-white font-semibold">{t.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div className="flex-1"><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{t.subject}</div></div><div className="text-right"><div className="font-medium">{t.hourlyRate} ₸/час</div><div className="text-sm text-gray-500">{t.hoursWorked} часов</div></div><div className="flex gap-2"><button onClick={() => { setForm(t); setSelected(t); setModal('editTeacher'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button><button onClick={() => { if (window.confirm('Уволить?')) delTeacher(t.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button></div></div>)}</div></div>;
    }

    // CURATOR SALARY
    if (user.role === 'curator' && view === 'salary') {
      const total = data.teachers.reduce((sum, t) => { const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0; return sum + conf * t.hourlyRate; }, 0);
      const pending = data.teachers.flatMap(t => t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').map(l => ({ ...l, teacher: t })) || []);
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Зарплаты</h1><div className="bg-gradient-to-r from-[#1a3a32] to-[#2d5a4a] rounded-2xl p-6 text-white"><div className="text-sm text-white/70">Общий фонд за месяц</div><div className="text-3xl font-bold">{total.toLocaleString()} ₸</div></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-4">Преподаватель</th><th className="text-right p-4">Ставка</th><th className="text-right p-4">Часы (подтв.)</th><th className="text-right p-4">К выплате</th></tr></thead><tbody>{data.teachers.map(t => { const conf = t.lessons?.filter(l => l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0; const pend = t.lessons?.filter(l => !l.confirmed && l.status === 'conducted').reduce((s, l) => s + (l.hours || 0), 0) || 0; return <tr key={t.id} className="border-t hover:bg-gray-50 transition-colors"><td className="p-4"><div className="font-medium">{t.name}</div><div className="text-sm text-gray-500">{t.subject}</div></td><td className="p-4 text-right">{t.hourlyRate} ₸</td><td className="p-4 text-right">{conf} ч {pend > 0 && <span className="text-yellow-600">(+{pend} ожид.)</span>}</td><td className="p-4 text-right font-bold text-[#1a3a32]">{(conf * t.hourlyRate).toLocaleString()} ₸</td></tr>; })}</tbody></table></div>{pending.length > 0 && <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">На подтверждение</h3><div className="space-y-2">{pending.map(l => <div key={l.id} className="flex justify-between p-3 bg-yellow-50 rounded-xl"><div><div className="font-medium">{l.teacher.name}</div><div className="text-sm text-gray-500">{formatDate(l.date)} • {l.hours} ч</div></div><button onClick={() => confirmLesson(l.teacher.id, l.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Подтвердить</button></div>)}</div></div>}</div>;
    }

    // CURATOR SUPPORT
    if (user.role === 'curator' && view === 'support') {
      const open = data.supportTickets.filter(t => t.status === 'open');
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Поддержка</h1><div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Открытые ({open.length})</h3>{open.length > 0 ? <div className="space-y-3">{open.map(t => { const overdue = new Date(t.deadline) <= new Date(); return <div key={t.id} className={`p-4 rounded-xl ${overdue ? 'bg-red-50 border border-red-200' : 'bg-yellow-50'}`}><div className="flex justify-between mb-2"><div className="font-medium">{t.studentName}</div><span className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-yellow-600'}`}>{overdue ? 'Просрочено!' : `До: ${formatDate(t.deadline)}`}</span></div><p className="text-gray-600 mb-3">{t.message}</p><button onClick={() => resolveTicket(t.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Решить</button></div>; })}</div> : <p className="text-gray-500 text-center py-4">Нет открытых заявок 🎉</p>}</div></div>;
    }

    // CURATOR INTERNSHIPS
    if (user.role === 'curator' && view === 'internships') {
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Стажировки</h1><button onClick={() => { setForm({ name: '', country: '', type: '', requirements: '', deadline: '', link: '', description: '' }); setModal('addInternship'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить</span></button></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{data.internships.map(i => <div key={i.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-all"><div className="flex-1"><div className="font-medium">{i.name}</div><div className="text-sm text-gray-500">{i.country} • {i.type}</div></div><div className="text-sm text-gray-500">Дедлайн: {formatDate(i.deadline)}</div>{i.link && <a href={i.link} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Link /></a>}<div className="flex gap-2"><button onClick={() => { setForm(i); setSelected(i); setModal('editInternship'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button><button onClick={() => { if (window.confirm('Удалить?')) delInternship(i.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button></div></div>)}</div></div>;
    }

    // ==================== TEACHER ====================

    // TEACHER DASHBOARD
    if (user.role === 'teacher' && view === 'dashboard') {
      const t = getTeacher(); const mySchedule = data.schedule.filter(s => s.teacherId === t.id);
      const pending = t.lessons?.filter(l => !l.confirmed) || [];
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Привет, {t.name.split(' ')[0]}!</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#1a3a32]">{t.hoursWorked}</div><div className="text-sm text-gray-500">Часов (подтв.)</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-[#c9a227]">{t.totalLessons}</div><div className="text-sm text-gray-500">Уроков</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-blue-600">{mySchedule.length}</div><div className="text-sm text-gray-500">Занятий/нед</div></div><div className="bg-white rounded-2xl p-4 shadow-sm border card-hover"><div className="text-3xl font-bold text-green-600">{t.hourlyRate}</div><div className="text-sm text-gray-500">₸/час</div></div></div>{pending.length > 0 && <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4"><h3 className="font-semibold text-yellow-700 mb-2">Ожидают подтверждения: {pending.length} уроков</h3></div>}<div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="text-lg font-semibold mb-4">Расписание</h3>{mySchedule.length > 0 ? <div className="space-y-2">{mySchedule.map(s => <div key={s.id} className="flex justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover transition-all" onClick={() => { setSelected(s); setModal('scheduleDetail'); }}><div><div className="font-medium">{s.day} {s.time}</div><div className="text-sm text-gray-500">{s.subject} • Каб. {s.room}</div></div><span className="text-sm bg-gray-200 px-3 py-1 rounded-full">{s.students?.length || 0} студ.</span></div>)}</div> : <p className="text-gray-500 text-center py-4">Нет занятий</p>}</div></div>;
    }

    // TEACHER SCHEDULE
    if (user.role === 'teacher' && view === 'schedule') {
      const t = getTeacher(); const mySchedule = data.schedule.filter(s => s.teacherId === t.id);
      const daysOrder = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
      const sorted = [...mySchedule].sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Моё расписание</h1><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{sorted.map(s => { const students = s.students?.map(id => data.students.find(st => st.id === id)).filter(Boolean) || []; return <div key={s.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-all" onClick={() => { setSelected(s); setModal('scheduleDetail'); }}><div className="flex justify-between mb-2"><div className="font-medium">{s.day} {s.time}</div><span className="text-sm bg-gray-100 px-3 py-1 rounded-full">Каб. {s.room}</span></div><div className="text-lg font-semibold text-[#1a3a32] mb-2">{s.subject}</div><div className="flex flex-wrap gap-2">{students.map(st => <span key={st.id} className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">{st.name.split(' ')[0]}</span>)}</div></div>; })}</div></div>;
    }

    // TEACHER STUDENTS
    if (user.role === 'teacher' && view === 'students') {
      const t = getTeacher(); const myStudentIds = [...new Set(data.schedule.filter(s => s.teacherId === t.id).flatMap(s => s.students || []))];
      const myStudents = myStudentIds.map(id => data.students.find(s => s.id === id)).filter(Boolean);
      return <div className="space-y-6 animate-fadeIn"><h1 className="text-2xl font-bold text-gray-800">Мои студенты</h1><div className="bg-white rounded-2xl shadow-sm border overflow-hidden">{myStudents.map(s => { const lastMock = s.examResults?.filter(e => e.type.startsWith('mock_')).sort((a, b) => new Date(b.date) - new Date(a.date))[0]; return <div key={s.id} className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-all" onClick={() => { setSelected(s); setModal('studentDetailTeacher'); }}><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white font-semibold">{s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div className="flex-1"><div className="font-medium">{s.name}</div><div className="text-sm text-gray-500">{s.grade}</div></div><div className="text-right"><div className="text-sm">Посещ: <span className="font-medium">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}%</span></div><div className="text-sm">Пробный: <span className="font-medium text-[#c9a227]">{lastMock?.score || '—'}</span></div></div><div className="text-right">{s.targetIelts && <div className="text-sm">Цель IELTS: <span className="font-medium text-blue-600">{s.targetIelts}</span></div>}{s.targetSat && <div className="text-sm">Цель SAT: <span className="font-medium text-purple-600">{s.targetSat}</span></div>}</div><I.Right /></div>; })}</div></div>;
    }

    // TEACHER SYLLABUS
    if (user.role === 'teacher' && view === 'syllabus') {
      const t = getTeacher();
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Силлабус</h1><button onClick={() => { setForm({ course: '', weeks: 12, topics: '', students: [] }); setSylSearch(''); setModal('addSyllabus'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Добавить курс</span></button></div>{t.syllabus?.length > 0 ? <div className="grid md:grid-cols-2 gap-6">{t.syllabus.map(s => { const students = s.students?.map(id => data.students.find(st => st.id === id)).filter(Boolean) || []; return <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border card-hover"><div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">{s.course}</h3><div className="flex gap-2"><button onClick={() => { setForm({ ...s, topics: s.topics?.join(', ') || '' }); setSelected(s); setSylSearch(''); setModal('editSyllabus'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><I.Edit /></button><button onClick={() => { if (window.confirm('Удалить курс?')) delSyllabus(t.id, s.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><I.Trash /></button></div></div><div className="mb-4"><div className="flex justify-between text-sm mb-1"><span>Прогресс</span><span>{s.progress}%</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-[#c9a227] rounded-full transition-all" style={{ width: `${s.progress}%` }}></div></div></div><div className="text-sm text-gray-500 mb-3">{s.weeks} недель</div><div className="mb-4"><div className="text-sm font-medium mb-2">Темы:</div><div className="flex flex-wrap gap-1">{s.topics?.map((t, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{t}</span>)}</div></div><div><div className="text-sm font-medium mb-2">Студенты ({students.length}):</div><div className="flex flex-wrap gap-1">{students.map(st => <span key={st.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{st.name.split(' ')[0]}</span>)}</div></div></div>; })}</div> : <p className="text-gray-500 text-center py-8">Нет курсов</p>}</div>;
    }

    // TEACHER LESSONS
    if (user.role === 'teacher' && view === 'lessons') {
      const t = getTeacher(); const mySchedule = data.schedule.filter(s => s.teacherId === t.id);
      return <div className="space-y-6 animate-fadeIn"><div className="flex justify-between"><h1 className="text-2xl font-bold text-gray-800">Мои уроки</h1><button onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], scheduleId: mySchedule[0]?.id || '', status: 'conducted', hours: 1.5, note: '' }); setModal('addLesson'); }} className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2"><I.Plus /><span>Отметить урок</span></button></div><div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left p-4">Дата</th><th className="text-left p-4">Занятие</th><th className="text-left p-4">Статус</th><th className="text-right p-4">Часы</th><th className="text-center p-4">Подтв.</th></tr></thead><tbody>{t.lessons?.sort((a, b) => new Date(b.date) - new Date(a.date)).map(l => { const sch = data.schedule.find(s => s.id === l.scheduleId); return <tr key={l.id} className="border-t hover:bg-gray-50 transition-colors"><td className="p-4">{formatDate(l.date)}</td><td className="p-4">{sch?.subject || '—'}</td><td className="p-4"><span className={`px-2 py-1 rounded text-sm ${l.status === 'conducted' ? 'bg-green-100 text-green-700' : l.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'conducted' ? 'Проведён' : l.status === 'cancelled' ? 'Отменён' : 'Перенесён'}</span>{l.note && <div className="text-xs text-gray-500 mt-1">{l.note}</div>}</td><td className="p-4 text-right">{l.hours} ч</td><td className="p-4 text-center">{l.confirmed ? <span className="text-green-600">✓</span> : <span className="text-yellow-600">⏳</span>}</td></tr>; })}</tbody></table></div></div>;
    }

    return <div className="text-center py-20 text-gray-500">Раздел: {view}</div>;
  };

  // ============================================================
  // МОДАЛКИ
  // ============================================================
  const renderModal = () => {
    if (!modal) return null;

    // SCHEDULE DETAIL - С КНОПКОЙ СОХРАНИТЬ ДЛЯ КУРАТОРА
    if (modal === 'scheduleDetail' && selected) {
      const s = selected; const t = data.teachers.find(x => x.id === s.teacherId);
      const students = s.students?.map(id => data.students.find(st => st.id === id)).filter(Boolean) || [];
      
      // Для куратора - редактируемая форма
      if (user.role === 'curator') {
        return <Modal title="Редактировать занятие" onClose={() => { setModal(null); setSelected(null); setForm({}); }}>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1">Предмет</label><input type="text" value={form.subject ?? s.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Преподаватель</label><select value={form.teacherId ?? s.teacherId ?? ''} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Куратор —</option>{data.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">День</label><select value={form.day ?? s.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'].map(d => <option key={d}>{d}</option>)}</select></div>
              <div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time ?? s.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Длительность (мин)</label><input type="number" value={form.duration ?? s.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room ?? s.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Студенты</label>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-2 input-focus" placeholder="Поиск студентов..." />
              <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                {data.students.filter(st => st.name.toLowerCase().includes(search.toLowerCase())).map(st => {
                  const currentStudents = form.students ?? s.students ?? [];
                  return <label key={st.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={currentStudents.includes(st.id)} onChange={e => {
                      setForm(p => ({ ...p, students: e.target.checked ? [...currentStudents, st.id] : currentStudents.filter(x => x !== st.id) }));
                    }} className="w-4 h-4" />
                    <span>{st.name}</span>
                  </label>;
                })}
              </div>
            </div>
            <button onClick={() => {
              updSchedule(s.id, {
                subject: form.subject ?? s.subject,
                teacherId: form.teacherId ?? s.teacherId,
                day: form.day ?? s.day,
                time: form.time ?? s.time,
                duration: form.duration ?? s.duration,
                room: form.room ?? s.room,
                students: form.students ?? s.students,
                isCurator: !(form.teacherId ?? s.teacherId)
              });
              setModal(null); setSelected(null); setForm({}); setSearch('');
            }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2">
              <I.Save /><span>Сохранить изменения</span>
            </button>
          </div>
        </Modal>;
      }
      
      // Для студента/препода - только просмотр
      return <Modal title={s.subject} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">День</div><div className="font-medium">{s.day}</div></div><div><div className="text-sm text-gray-500">Время</div><div className="font-medium">{s.time}</div></div><div><div className="text-sm text-gray-500">Длительность</div><div className="font-medium">{s.duration} мин</div></div><div><div className="text-sm text-gray-500">Кабинет</div><div className="font-medium">{s.room}</div></div></div><div><div className="text-sm text-gray-500 mb-2">Преподаватель</div><div className="font-medium">{t?.name || (s.isCurator ? 'Куратор' : '—')}</div></div><div><div className="text-sm text-gray-500 mb-2">Студенты ({students.length})</div><div className="flex flex-wrap gap-2">{students.map(st => <span key={st.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{st.name}</span>)}</div></div></div></Modal>;
    }

    // INTERNSHIP DETAIL
    if (modal === 'internshipDetail' && selected) {
      const i = selected; const s = getStudent(); const applied = s?.internships?.some(x => x.internshipId === i.id);
      return <Modal title={i.name} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><p className="text-gray-600">{i.description}</p><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Страна</div><div className="font-medium">{i.country}</div></div><div><div className="text-sm text-gray-500">Тип</div><div className="font-medium">{i.type}</div></div><div><div className="text-sm text-gray-500">Требования</div><div className="font-medium">{i.requirements}</div></div><div><div className="text-sm text-gray-500">Дедлайн</div><div className="font-medium">{formatDate(i.deadline)}</div></div></div>{i.link && <a href={i.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><I.Link /><span>Перейти на сайт</span></a>}{user?.role === 'student' && !applied && <button onClick={() => { applyInternship(s.id, i.id); setModal(null); setSelected(null); }} className="w-full py-3 btn-primary text-white rounded-xl">Подать заявку</button>}</div></Modal>;
    }

    // MOCK TEST DETAIL
    if (modal === 'mockTestDetail' && selected) {
      const t = selected; const students = t.students?.map(id => data.students.find(s => s.id === id)).filter(Boolean) || [];
      return <Modal title={t.name} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Тип</div><div className="font-medium uppercase">{t.type}</div></div><div><div className="text-sm text-gray-500">Дата</div><div className="font-medium">{formatDate(t.date)}</div></div><div><div className="text-sm text-gray-500">Время</div><div className="font-medium">{t.time}</div></div><div><div className="text-sm text-gray-500">Кабинет</div><div className="font-medium">{t.room}</div></div></div><div><div className="text-sm text-gray-500 mb-2">Участники ({students.length})</div><div className="flex flex-wrap gap-2">{students.map(s => <span key={s.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s.name}</span>)}</div></div></div></Modal>;
    }

    // LETTER DETAIL
    if (modal === 'letterDetail' && selected) {
      const l = selected;
      return <Modal title={l.type === 'motivation' ? 'Мотивационное письмо' : 'Рекомендательное письмо'} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4">{l.university && <div><div className="text-sm text-gray-500">Университет</div><div className="font-medium">{l.university}</div></div>}{l.author && <div><div className="text-sm text-gray-500">Автор</div><div className="font-medium">{l.author} ({l.subject})</div></div>}<div><div className="text-sm text-gray-500">Статус</div><div className={`inline-block px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'completed' ? 'Готово' : 'Черновик'}</div></div><div><div className="text-sm text-gray-500 mb-2">Содержание</div><div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap">{l.content || 'Пусто'}</div></div>{user?.role === 'student' && l.type === 'motivation' && <div className="flex gap-3"><button onClick={() => { setForm(l); setModal('editLetter'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Редактировать</button><button onClick={() => { if (window.confirm('Удалить?')) { delLetter(l.studentId, l.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Удалить</button></div>}</div></Modal>;
    }

    // DOCUMENT DETAIL
    if (modal === 'documentDetail' && selected) {
      const d = selected;
      return <Modal title={documentTypes[d.type]?.label || 'Документ'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div className="text-center text-6xl mb-4">{documentTypes[d.type]?.icon || '📄'}</div><div><div className="text-sm text-gray-500">Название</div><div className="font-medium">{d.name}</div></div><div><div className="text-sm text-gray-500">Дата</div><div className="font-medium">{formatDate(d.date)}</div></div>{d.score && <div><div className="text-sm text-gray-500">Балл</div><div className="font-medium text-2xl text-[#1a3a32]">{d.score}</div></div>}<div className="flex gap-3"><button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"><I.Download /><span>Скачать</span></button>{user?.role === 'curator' && <button onClick={() => { if (window.confirm('Удалить?')) { delDoc(d.studentId, d.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><I.Trash /></button>}</div></div></Modal>;
    }

    // ADD STUDENT
    if (modal === 'addStudent') {
      return <Modal title="Добавить студента" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Иванов Иван Иванович" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Возраст</label><input type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Класс</label><input type="text" value={form.grade || ''} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="10 класс" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Родитель</label><input type="text" value={form.parentName || ''} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон родителя</label><input type="tel" value={form.parentPhone || ''} onChange={e => setForm(p => ({ ...p, parentPhone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Конец договора</label><input type="date" value={form.contractEndDate || ''} onChange={e => setForm(p => ({ ...p, contractEndDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Цель IELTS</label><input type="text" value={form.targetIelts || ''} onChange={e => setForm(p => ({ ...p, targetIelts: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" /></div><div><label className="block text-sm text-gray-600 mb-1">Цель SAT</label><input type="text" value={form.targetSat || ''} onChange={e => setForm(p => ({ ...p, targetSat: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="1500" /></div></div><button onClick={() => { if (!form.name) { alert('Введите ФИО'); return; } const login = generateLogin(form.name); const password = generatePassword(); addStudent({ ...form, login, password, age: parseInt(form.age) || 0 }); alert(`Студент создан!\nЛогин: ${login}\nПароль: ${password}`); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Создать</button></div></Modal>;
    }

    // ADD/EDIT TEACHER
    if (modal === 'addTeacher' || modal === 'editTeacher') {
      const isEdit = modal === 'editTeacher';
      return <Modal title={isEdit ? 'Редактировать преподавателя' : 'Добавить преподавателя'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Предмет *</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Английский / IELTS" /></div><div><label className="block text-sm text-gray-600 mb-1">Ставка (₸/час)</label><input type="number" value={form.hourlyRate || 2500} onChange={e => setForm(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><button onClick={() => { if (!form.name || !form.subject) { alert('Заполните поля'); return; } if (isEdit) { updTeacher(selected.id, form); } else { const login = generateLogin(form.name); const password = generatePassword(); addTeacher({ ...form, login, password }); alert(`Преподаватель создан!\nЛогин: ${login}\nПароль: ${password}`); } setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT SCHEDULE
    if (modal === 'addSchedule' || modal === 'editSchedule') {
      const isEdit = modal === 'editSchedule';
      return <Modal title={isEdit ? 'Редактировать занятие' : 'Добавить занятие'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Предмет *</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Преподаватель</label><select value={form.teacherId || ''} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Куратор —</option>{data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">День</label><select value={form.day || 'Понедельник'} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time || '16:00'} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Длительность (мин)</label><input type="number" value={form.duration || 90} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room || ''} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Студенты</label><input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-2 input-focus" placeholder="Поиск..." /><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.subject) { alert('Введите предмет'); return; } if (isEdit) updSchedule(selected.id, { ...form, isCurator: !form.teacherId }); else addSchedule({ ...form, isCurator: !form.teacherId }); setModal(null); setSelected(null); setForm({}); setSearch(''); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT MOCK TEST
    if (modal === 'addMockTest' || modal === 'editMockTest') {
      const isEdit = modal === 'editMockTest';
      return <Modal title={isEdit ? 'Редактировать пробный тест' : 'Добавить пробный тест'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Тип *</label><select value={form.type || 'ielts'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="ielts">IELTS</option><option value="sat">SAT</option><option value="toefl">TOEFL</option></select></div><div><label className="block text-sm text-gray-600 mb-1">Название</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Пробный IELTS Январь" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Дата *</label><input type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time || '10:00'} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room || ''} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Студенты</label><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.date) { alert('Выберите дату'); return; } const name = form.name || `Пробный ${form.type?.toUpperCase()}`; if (isEdit) updMockTest(selected.id, { ...form, name }); else addMockTest({ ...form, name }); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT INTERNSHIP
    if (modal === 'addInternship' || modal === 'editInternship') {
      const isEdit = modal === 'editInternship';
      return <Modal title={isEdit ? 'Редактировать стажировку' : 'Добавить стажировку'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Название *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Страна</label><input type="text" value={form.country || ''} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Тип</label><input type="text" value={form.type || ''} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="IT / Дизайн" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Требования</label><input type="text" value={form.requirements || ''} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="IELTS 7.0+" /></div><div><label className="block text-sm text-gray-600 mb-1">Дедлайн</label><input type="date" value={form.deadline || ''} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Ссылка</label><input type="url" value={form.link || ''} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="https://..." /></div><div><label className="block text-sm text-gray-600 mb-1">Описание</label><textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={3}></textarea></div><button onClick={() => { if (!form.name) { alert('Введите название'); return; } if (isEdit) updInternship(selected.id, form); else addInternship(form); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT SYLLABUS - С ПОИСКОМ СТУДЕНТОВ И КНОПКОЙ СОХРАНИТЬ
    if (modal === 'addSyllabus' || modal === 'editSyllabus') {
      const isEdit = modal === 'editSyllabus'; const t = getTeacher();
      return <Modal title={isEdit ? 'Редактировать курс' : 'Добавить курс'} onClose={() => { setModal(null); setSelected(null); setSylSearch(''); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Название *</label><input type="text" value={form.course || ''} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Недель</label><input type="number" value={form.weeks || 12} onChange={e => setForm(p => ({ ...p, weeks: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Темы (через запятую)</label><input type="text" value={form.topics || ''} onChange={e => setForm(p => ({ ...p, topics: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Тема 1, Тема 2" /></div>{isEdit && <div><label className="block text-sm text-gray-600 mb-1">Прогресс (%)</label><input type="number" value={form.progress || 0} onChange={e => setForm(p => ({ ...p, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))} className="w-full p-3 border rounded-xl input-focus" min="0" max="100" /></div>}<div><label className="block text-sm text-gray-600 mb-1">Студенты</label><div className="relative mb-2"><I.Search /><input type="text" value={sylSearch} onChange={e => setSylSearch(e.target.value)} className="w-full p-3 pl-10 border rounded-xl input-focus" placeholder="Поиск студентов..." /></div><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.filter(s => s.name.toLowerCase().includes(sylSearch.toLowerCase())).map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.course) { alert('Введите название'); return; } const topics = typeof form.topics === 'string' ? form.topics.split(',').map(x => x.trim()).filter(Boolean) : form.topics; if (isEdit) updSyllabus(t.id, selected.id, { ...form, topics }); else addSyllabus(t.id, { ...form, topics }); setModal(null); setSelected(null); setForm({}); setSylSearch(''); }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2"><I.Save /><span>{isEdit ? 'Сохранить изменения' : 'Создать курс'}</span></button></div></Modal>;
    }

    // ADD LESSON
    if (modal === 'addLesson') {
      const t = getTeacher(); const mySchedule = data.schedule.filter(s => s.teacherId === t.id);
      return <Modal title="Отметить урок" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Дата *</label><input type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Занятие</label><select value={form.scheduleId || ''} onChange={e => setForm(p => ({ ...p, scheduleId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Выберите —</option>{mySchedule.map(s => <option key={s.id} value={s.id}>{s.day} {s.time} — {s.subject}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Статус *</label><select value={form.status || 'conducted'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="conducted">Проведён</option><option value="cancelled">Отменён</option><option value="rescheduled">Перенесён</option></select></div>{form.status === 'conducted' && <div><label className="block text-sm text-gray-600 mb-1">Часы</label><input type="number" step="0.5" value={form.hours || 1.5} onChange={e => setForm(p => ({ ...p, hours: parseFloat(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div>}<div><label className="block text-sm text-gray-600 mb-1">Примечание</label><input type="text" value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Причина отмены..." /></div><button onClick={() => { if (!form.date) { alert('Выберите дату'); return; } markLesson(t.id, { ...form, hours: form.status === 'conducted' ? (form.hours || 1.5) : 0 }); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Сохранить</button></div></Modal>;
    }

    // SUPPORT
    if (modal === 'support') {
      const s = getStudent();
      return <Modal title="Написать в поддержку" onClose={() => setModal(null)}><div className="space-y-4"><p className="text-gray-600">Опишите проблему. Ответим в течение 48 часов.</p><textarea value={form.message || ''} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={5} placeholder="Ваше сообщение..."></textarea><button onClick={() => { if (!form.message) { alert('Введите сообщение'); return; } addTicket(s.id, form.message); alert('Заявка отправлена!'); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Отправить</button></div></Modal>;
    }

    // ADD LETTER
    if (modal === 'addLetter') {
      const s = getStudent();
      return <Modal title="Создать письмо" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Университет</label><input type="text" value={form.university || ''} onChange={e => setForm(p => ({ ...p, university: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="MIT, Stanford..." /></div><div><label className="block text-sm text-gray-600 mb-1">Содержание</label><textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={8}></textarea></div><button onClick={() => { addLetter(s.id, { ...form, type: 'motivation', status: 'draft' }); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Создать</button></div></Modal>;
    }

    // EDIT LETTER
    if (modal === 'editLetter') {
      const s = getStudent();
      return <Modal title="Редактировать письмо" onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Университет</label><input type="text" value={form.university || ''} onChange={e => setForm(p => ({ ...p, university: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Статус</label><select value={form.status || 'draft'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="draft">Черновик</option><option value="completed">Готово</option></select></div><div><label className="block text-sm text-gray-600 mb-1">Содержание</label><textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={12}></textarea></div><button onClick={() => { updLetter(s.id, selected.id, form); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2"><I.Save /><span>Сохранить</span></button></div></Modal>;
    }

    // STUDENT DETAIL (curator)
    if (modal === 'studentDetail' && selected) {
      const s = selected;
      return <Modal title={s.name} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Логин</div><div className="font-medium">{s.login}</div></div><div><div className="text-sm text-gray-500">Пароль</div><div className="font-medium">{s.password}</div></div><div><div className="text-sm text-gray-500">Email</div><div className="font-medium">{s.email}</div></div><div><div className="text-sm text-gray-500">Телефон</div><div className="font-medium">{s.phone}</div></div><div><div className="text-sm text-gray-500">Класс</div><div className="font-medium">{s.grade}</div></div><div><div className="text-sm text-gray-500">Возраст</div><div className="font-medium">{s.age}</div></div><div><div className="text-sm text-gray-500">Родитель</div><div className="font-medium">{s.parentName}</div></div><div><div className="text-sm text-gray-500">Тел. родителя</div><div className="font-medium">{s.parentPhone}</div></div></div><div><div className="text-sm text-gray-500 mb-2">Цели</div><div className="flex gap-4">{s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">IELTS: {s.targetIelts}</span>}{s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">SAT: {s.targetSat}</span>}</div></div><div className="flex gap-3"><button onClick={() => { setForm({ type: 'contract', name: '', score: '' }); setModal('addDocument'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">+ Документ</button><button onClick={() => { if (window.confirm('Удалить студента?')) { delStudent(s.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Удалить</button></div></div></Modal>;
    }

    // ADD DOCUMENT
    if (modal === 'addDocument' && selected) {
      return <Modal title="Добавить документ" onClose={() => { setModal('studentDetail'); setForm({}); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Тип *</label><select value={form.type || 'contract'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{Object.entries(documentTypes).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Название</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>{documentTypes[form.type]?.isExam && <div><label className="block text-sm text-gray-600 mb-1">Балл</label><input type="text" value={form.score || ''} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" /></div>}<button onClick={() => { addDoc(selected.id, { ...form, name: form.name || documentTypes[form.type]?.label || 'Документ' }); setModal('studentDetail'); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Добавить</button></div></Modal>;
    }

    // STUDENT DETAIL (teacher)
    if (modal === 'studentDetailTeacher' && selected) {
      const s = selected; const mocks = s.examResults?.filter(e => e.type.startsWith('mock_')).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
      return <Modal title={s.name} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Класс</div><div className="font-medium">{s.grade}</div></div><div><div className="text-sm text-gray-500">Посещаемость</div><div className="font-medium">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}%</div></div></div><div><div className="text-sm text-gray-500 mb-2">Цели</div><div className="flex gap-4">{s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">IELTS: {s.targetIelts}</span>}{s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">SAT: {s.targetSat}</span>}</div></div><div><div className="text-sm text-gray-500 mb-2">История пробных тестов</div>{mocks.length > 0 ? <div className="space-y-2">{mocks.map(e => <div key={e.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{e.name}</div><div className="text-sm text-gray-500">{formatDate(e.date)}</div></div><div className="text-xl font-bold text-[#c9a227]">{e.score}</div></div>)}</div> : <p className="text-gray-500">Нет результатов</p>}</div></div></Modal>;
    }

    return null;
  };

  // ============================================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Сайдбар */}
      <div className="w-64 bg-white border-r flex flex-col shadow-sm">
        <div className="p-5 border-b"><div className="flex items-center gap-3"><NobilisLogo size={40} /><div><div className="font-serif font-bold text-[#1a3a32] text-lg">NOBILIS</div><div className="text-xs tracking-wider text-[#c9a227]">ACADEMY</div></div></div></div>
        <nav className="flex-1 p-3 overflow-y-auto"><div className="space-y-1">{navItems.map(item => <button key={item.id} onClick={() => { setView(item.id); setSelected(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all nav-item ${view === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`} style={view === item.id ? { background: 'linear-gradient(135deg, #1a3a32 0%, #2d5a4a 100%)' } : {}}><item.icon /><span className="font-medium text-sm">{item.label}</span></button>)}</div></nav>
        <div className="p-4 border-t"><div className="flex items-center gap-3 mb-4 px-2"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}>{user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div><div className="flex-1 min-w-0"><div className="font-medium text-sm truncate text-gray-800">{user.name}</div><div className="text-xs text-gray-400">{user.role === 'student' ? 'Студент' : user.role === 'curator' ? 'Куратор' : 'Преподаватель'}</div></div></div><button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"><I.Logout /><span className="text-sm">Выйти</span></button></div>
      </div>
      
      {/* Контент */}
      <div className="flex-1 overflow-hidden flex flex-col"><div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div></div>
      
      {/* Модалки */}
      {renderModal()}
    </div>
  );
}
