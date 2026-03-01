import React from 'react';

const NobilisLogo = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
    <defs>
      <linearGradient id="nGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0d861"/>
        <stop offset="50%" stopColor="#c9a227"/>
        <stop offset="100%" stopColor="#a68620"/>
      </linearGradient>
      <linearGradient id="nDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a3a32"/>
        <stop offset="100%" stopColor="#0f2a22"/>
      </linearGradient>
    </defs>
    {/* Background circle */}
    <circle cx="50" cy="50" r="49" fill="url(#nDark)"/>
    {/* Gold oval border */}
    <ellipse cx="50" cy="50" rx="36" ry="42" fill="none" stroke="url(#nGold)" strokeWidth="1.5"/>
    <ellipse cx="50" cy="50" rx="33" ry="39" fill="none" stroke="url(#nGold)" strokeWidth="0.5" opacity="0.3"/>
    {/* Profile head */}
    <circle cx="50" cy="42" r="12" fill="url(#nGold)" opacity="0.9"/>
    {/* Graduation cap */}
    <polygon points="36,30 50,22 64,30 50,37" fill="url(#nGold)"/>
    {/* Cap button */}
    <circle cx="50" cy="21" r="2" fill="#f0d861"/>
    {/* Tassel */}
    <line x1="64" y1="30" x2="68" y2="38" stroke="#c9a227" strokeWidth="0.8"/>
    <circle cx="68" cy="39" r="1.5" fill="#f0d861"/>
    {/* Star */}
    <polygon points="50,8 51.5,12 56,12 52.5,14.5 53.5,18.5 50,16 46.5,18.5 47.5,14.5 44,12 48.5,12" fill="#f0d861"/>
    {/* NOBILIS text */}
    <text x="50" y="72" textAnchor="middle" fill="url(#nGold)" fontSize="7" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="2.5">NOBILIS</text>
    {/* ACADEMY text */}
    <text x="50" y="80" textAnchor="middle" fill="#c9a227" fontSize="4" fontFamily="Arial, sans-serif" letterSpacing="3" opacity="0.7">ACADEMY</text>
  </svg>
);

export default NobilisLogo;
