import React from 'react';

const NobilisLogo = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
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
    <circle cx="50" cy="50" r="48" fill="url(#darkGreen)" stroke="url(#goldGrad)" strokeWidth="2"/>
    <polygon points="50,18 15,38 50,50 85,38" fill="url(#goldGrad)"/>
    <polygon points="50,50 85,38 85,45 50,57" fill="#a68620"/>
    <polygon points="50,50 15,38 15,45 50,57" fill="#c9a227"/>
    <line x1="85" y1="38" x2="90" y2="55" stroke="#c9a227" strokeWidth="2"/>
    <circle cx="90" cy="58" r="4" fill="#f0d861"/>
    <path d="M30 62 L50 72 L70 62 L70 82 L50 92 L30 82 Z" fill="#1a3a32" stroke="url(#goldGrad)" strokeWidth="1.5"/>
    <line x1="50" y1="72" x2="50" y2="92" stroke="url(#goldGrad)" strokeWidth="1"/>
    <path d="M32 64 L50 73 L50 90 L32 81 Z" fill="#2d5a4a"/>
    <path d="M68 64 L50 73 L50 90 L68 81 Z" fill="#3d6a5a"/>
  </svg>
);

export default NobilisLogo;
