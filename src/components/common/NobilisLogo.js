import React, { useId } from 'react';

const NobilisLogo = ({ size = 40 }) => {
  const uid = useId().replace(/:/g, '');
  const gId = (n) => `nl${uid}${n}`;

  return (
  <svg viewBox="0 0 100 110" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
    <defs>
      <linearGradient id={gId('g')} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8c252"/>
        <stop offset="40%" stopColor="#c8963e"/>
        <stop offset="100%" stopColor="#a37728"/>
      </linearGradient>
      <linearGradient id={gId('gl')} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f0d86a"/>
        <stop offset="100%" stopColor="#c8963e"/>
      </linearGradient>
      <clipPath id={gId('c')}>
        <ellipse cx="50" cy="55" rx="38" ry="48"/>
      </clipPath>
    </defs>

    {/* Outer oval border */}
    <ellipse cx="50" cy="55" rx="42" ry="52" fill="none" stroke={`url(#${gId('g')})`} strokeWidth="2.5"/>
    {/* Inner oval border */}
    <ellipse cx="50" cy="55" rx="38" ry="48" fill="none" stroke={`url(#${gId('g')})`} strokeWidth="1"/>

    {/* Profile face — classical cameo style, facing left */}
    <g clipPath={`url(#${gId('c')})`}>
      {/* Forehead & skull */}
      <path d="M58,58 C58,38 56,32 48,28 C42,25 38,28 36,32 C34,36 33,40 33,46 C33,50 34,54 36,56"
        fill={`url(#${gId('g')})`} stroke="none"/>
      {/* Face profile — forehead, nose, lips, chin */}
      <path d="M36,56 C36,56 35,58 35.5,60 C36,62 38,63 38,63 L37,65 C37,65 36,66 36.5,67.5 C37,69 38,69 38,69 L37.5,71 C37,73 38,75 40,78 C42,81 44,83 48,85 C52,87 56,87 58,86 C60,85 58,80 58,58 Z"
        fill={`url(#${gId('g')})`} stroke="none"/>
      {/* Ear */}
      <path d="M58,52 C60,52 62,54 62,58 C62,62 60,64 58,64"
        fill={`url(#${gId('gl')})`} stroke="#a37728" strokeWidth="0.5"/>
      {/* Eye */}
      <ellipse cx="41" cy="54" rx="2.5" ry="1.2" fill="#8a6520" opacity="0.7"/>
      {/* Eyebrow */}
      <path d="M38,51 C40,49.5 43,49.5 45,50.5" fill="none" stroke="#a37728" strokeWidth="0.8"/>
      {/* Nostril hint */}
      <circle cx="36.5" cy="63.5" r="0.8" fill="#a37728" opacity="0.5"/>
      {/* Lip line */}
      <path d="M37,67 C38,67.5 39,67 39,67" fill="none" stroke="#a37728" strokeWidth="0.4"/>
      {/* Neck */}
      <path d="M48,85 C48,87 46,92 44,98 L56,98 C56,92 56,88 56,86"
        fill={`url(#${gId('g')})`} stroke="none"/>
      {/* Collar/shoulder hint */}
      <path d="M44,98 C38,100 30,104 28,108 L72,108 C70,104 62,100 56,98"
        fill={`url(#${gId('g')})`} stroke="none" opacity="0.8"/>
    </g>

    {/* Graduation cap */}
    <polygon points="30,30 50,20 70,30 50,38" fill={`url(#${gId('g')})`}/>
    <path d="M40,38 L40,30 L60,30 L60,38" fill={`url(#${gId('gl')})`} opacity="0.6"/>
    {/* Cap button */}
    <circle cx="50" cy="19.5" r="2" fill="#f0d86a"/>
    {/* Tassel */}
    <path d="M50,19.5 C50,19.5 64,22 66,28 C67,31 67,36 66,38" fill="none" stroke="#c8963e" strokeWidth="1"/>
    <ellipse cx="66" cy="39.5" rx="2" ry="3" fill="#e8c252"/>

    {/* 4-pointed star */}
    <g transform="translate(50, 9)">
      <polygon points="0,-7 1.5,-2 7,0 1.5,2 0,7 -1.5,2 -7,0 -1.5,-2" fill="#f0d86a"/>
      <circle cx="0" cy="0" r="1.5" fill="#fff" opacity="0.4"/>
    </g>
  </svg>
  );
};

export default NobilisLogo;
