import React from 'react';

const NobilisLogo = ({ size = 40 }) => {
  return (
    <img
      src="/nobilis-logo.png"
      alt="Nobilis Academy"
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};

export default NobilisLogo;
