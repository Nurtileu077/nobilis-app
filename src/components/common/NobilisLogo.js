import React from 'react';

const NobilisLogo = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
    <defs>
      <linearGradient id="nblGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0d861"/>
        <stop offset="50%" stopColor="#c9a227"/>
        <stop offset="100%" stopColor="#a68620"/>
      </linearGradient>
      <linearGradient id="nblGreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2d5a4a"/>
        <stop offset="100%" stopColor="#1a3a32"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#nblGreen)" />
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#nblGold)" strokeWidth="1.5"/>
    <path d="M50 15 L75 28 L75 55 Q75 72 50 85 Q25 72 25 55 L25 28 Z" fill="none" stroke="url(#nblGold)" strokeWidth="2"/>
    <path d="M50 20 L70 31 L70 53 Q70 67 50 78 Q30 67 30 53 L30 31 Z" fill="#1a3a32" stroke="url(#nblGold)" strokeWidth="0.5"/>
    <text x="50" y="58" textAnchor="middle" fill="url(#nblGold)" fontFamily="serif" fontWeight="bold" fontSize="36">N</text>
    <polygon points="50,18 51.5,23 56,23 52.5,26 54,31 50,28 46,31 47.5,26 44,23 48.5,23" fill="#f0d861" />
  </svg>
);

export default NobilisLogo;
