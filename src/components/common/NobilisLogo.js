import React from 'react';

const NobilisLogo = ({ size = 40 }) => {
  return (
    <img
      src="/logo.png"
      alt="Nobilis Academy Logo"
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};

export default NobilisLogo;
