import React, { useId } from 'react';

const NobilisLogo = ({ size = 40 }) => {
  const uid = useId().replace(/:/g, '');
  const gId = (n) => `nl${uid}${n}`;

  return (
    <svg viewBox="0 0 200 220" style={{ width: size, height: size }} aria-label="Nobilis Academy Logo">
      <defs>
        <linearGradient id={gId('gold')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d86a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#a37728" />
        </linearGradient>
        <linearGradient id={gId('gold2')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8c252" />
          <stop offset="100%" stopColor="#b8922a" />
        </linearGradient>
        <linearGradient id={gId('dark')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3a32" />
          <stop offset="100%" stopColor="#0f2a22" />
        </linearGradient>
        <clipPath id={gId('clip')}>
          <ellipse cx="100" cy="115" rx="72" ry="90" />
        </clipPath>
      </defs>

      {/* Dark background fill */}
      <ellipse cx="100" cy="115" rx="78" ry="98" fill={`url(#${gId('dark')})`} />

      {/* Outer oval border */}
      <ellipse cx="100" cy="115" rx="82" ry="102" fill="none" stroke={`url(#${gId('gold')})`} strokeWidth="3.5" />
      {/* Inner oval border */}
      <ellipse cx="100" cy="115" rx="74" ry="92" fill="none" stroke={`url(#${gId('gold')})`} strokeWidth="1.5" />

      {/* Profile silhouette — classical cameo, facing left */}
      <g clipPath={`url(#${gId('clip')})`}>
        {/* Head + skull shape */}
        <path d="
          M 118,115
          C 118,85 114,72 106,62
          C 100,55 92,54 86,58
          C 80,62 76,70 74,80
          C 72,88 72,96 74,104
          C 75,108 76,111 78,114
        " fill={`url(#${gId('gold')})`} />

        {/* Face profile: forehead → brow → nose → mouth → chin → jaw */}
        <path d="
          M 78,114
          C 77,116 75,118 75,120
          C 75,122 76,124 78,126
          L 76,127
          C 74,128 73,130 74,132
          C 75,134 77,134 77,134
          L 76,136
          C 75,138 76,142 78,146
          C 80,150 84,156 88,160
          C 92,164 96,168 102,170
          C 108,172 114,170 118,168
          C 120,166 118,155 118,115
          Z
        " fill={`url(#${gId('gold')})`} />

        {/* Ear */}
        <path d="M 118,106 C 122,106 126,110 126,118 C 126,126 122,130 118,130"
          fill={`url(#${gId('gold2')})`} stroke="#a37728" strokeWidth="0.8" />

        {/* Eye — simple elegant line */}
        <ellipse cx="86" cy="110" rx="4" ry="1.8" fill="#1a3a32" opacity="0.7" />

        {/* Eyebrow arch */}
        <path d="M 80,105 C 84,102 90,102 94,104" fill="none" stroke="#8a6520" strokeWidth="1.5" strokeLinecap="round" />

        {/* Nose shadow hint */}
        <circle cx="76" cy="127" r="1.2" fill="#8a6520" opacity="0.4" />

        {/* Lip line */}
        <path d="M 76,133 C 78,134 80,133.5 80,133.5" fill="none" stroke="#8a6520" strokeWidth="0.6" />

        {/* Neck */}
        <path d="
          M 102,170
          C 100,174 98,182 96,194
          L 112,194
          C 112,184 114,176 116,170
        " fill={`url(#${gId('gold')})`} />

        {/* Shoulders */}
        <path d="
          M 96,194
          C 86,198 70,206 60,215
          L 140,215
          C 130,206 114,198 112,194
        " fill={`url(#${gId('gold')})`} opacity="0.85" />
      </g>

      {/* Graduation cap — mortarboard */}
      <polygon points="62,62 100,46 138,62 100,76" fill={`url(#${gId('gold')})`} />
      <path d="M 82,76 L 82,62 L 118,62 L 118,76" fill={`url(#${gId('gold2')})`} opacity="0.5" />

      {/* Cap top button */}
      <circle cx="100" cy="45" r="3" fill="#f0d86a" />

      {/* Tassel string */}
      <path d="M 100,45 C 102,45 120,48 128,56 C 132,60 134,68 133,76"
        fill="none" stroke="#c9a227" strokeWidth="1.8" strokeLinecap="round" />
      {/* Tassel end */}
      <ellipse cx="133" cy="78" rx="3" ry="5" fill="#e8c252" />

      {/* 4-pointed star above cap */}
      <g transform="translate(100, 24)">
        <polygon points="0,-14 2.5,-4 14,0 2.5,4 0,14 -2.5,4 -14,0 -2.5,-4" fill="#f0d86a" />
        <circle cx="0" cy="0" r="3" fill="#fff" opacity="0.35" />
      </g>
    </svg>
  );
};

export default NobilisLogo;
