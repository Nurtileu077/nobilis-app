import React, { useState } from 'react';

const NobilisLogo = ({ size = 40 }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Fallback: use logo192.png if nobilis-logo.png is missing
    return (
      <img
        src="/logo192.png"
        alt="Nobilis Academy"
        style={{ width: size, height: size, objectFit: 'contain' }}
        onError={() => {}}
      />
    );
  }

  return (
    <img
      src="/nobilis-logo.png"
      alt="Nobilis Academy"
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={() => setImgError(true)}
    />
  );
};

export default NobilisLogo;
