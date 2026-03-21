import React, { useState, useEffect, memo } from 'react';
import { getWikiPhoto } from '../utils/wikiPhoto';

const UniPhoto = memo(function UniPhoto({ name, flag, height = 'h-32', textSize = 'text-4xl' }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    getWikiPhoto(name, (url) => {
      setPhotoUrl(url);
      if (!url) setError(true);
    });
  }, [name]);

  return (
    <div className={`${height} bg-gradient-to-br from-nobilis-green to-nobilis-green-light flex items-center justify-center relative overflow-hidden`}>
      {photoUrl && !error && (
        <img
          src={photoUrl}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
      {(!loaded || error) && (
        <span className={`${textSize} opacity-50`}>{flag}</span>
      )}
    </div>
  );
});

export default UniPhoto;
