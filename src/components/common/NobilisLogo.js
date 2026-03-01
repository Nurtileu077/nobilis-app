import React from 'react';

const NobilisLogo = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0d861"/>
        <stop offset="50%" stopColor="#c9a227"/>
        <stop offset="100%" stopColor="#a68620"/>
      </linearGradient>
      <linearGradient id="darkGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2d5a4a"/>
        <stop offset="100%" stopColor="#1a3a32"/>
      </linearGradient>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a3a32"/>
        <stop offset="60%" stopColor="#0f2a22"/>
        <stop offset="100%" stopColor="#1a3a32"/>
      </linearGradient>
    </defs>
    {/* Shield shape */}
    <path d="M50 4 L90 20 L90 55 Q90 80 50 96 Q10 80 10 55 L10 20 Z" fill="url(#shieldGrad)" stroke="url(#goldGrad)" strokeWidth="2.5"/>
    {/* Inner shield border */}
    <path d="M50 10 L84 24 L84 54 Q84 76 50 90 Q16 76 16 54 L16 24 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5"/>
    {/* Horizontal divider */}
    <line x1="22" y1="42" x2="78" y2="42" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.6"/>
    {/* Letter N */}
    <text x="50" y="38" textAnchor="middle" fill="url(#goldGrad)" fontSize="30" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="2">N</text>
    {/* NOBILIS text */}
    <text x="50" y="56" textAnchor="middle" fill="url(#goldGrad)" fontSize="8" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="3">NOBILIS</text>
    {/* ACADEMY text */}
    <text x="50" y="66" textAnchor="middle" fill="#c9a227" fontSize="5.5" fontFamily="Arial, sans-serif" letterSpacing="4" opacity="0.8">ACADEMY</text>
    {/* Decorative stars */}
    <circle cx="28" cy="50" r="1.5" fill="#c9a227" opacity="0.7"/>
    <circle cx="72" cy="50" r="1.5" fill="#c9a227" opacity="0.7"/>
    {/* Bottom laurel hints */}
    <path d="M35 72 Q42 68 50 74 Q58 68 65 72" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export default NobilisLogo;
