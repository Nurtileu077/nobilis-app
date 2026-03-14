// Fetch university thumbnail from Wikipedia REST API
// Uses browser-side fetch, cached in sessionStorage

const cache = {};

export function getWikiPhoto(universityName, callback) {
  // Check memory cache
  if (cache[universityName] !== undefined) {
    callback(cache[universityName]);
    return;
  }

  // Check sessionStorage
  const stored = sessionStorage.getItem('wiki_' + universityName);
  if (stored) {
    const url = stored === 'null' ? null : stored;
    cache[universityName] = url;
    callback(url);
    return;
  }

  // Clean name for Wikipedia lookup
  const cleanName = universityName
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parenthetical abbreviations
    .trim();

  const encoded = encodeURIComponent(cleanName);

  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const url = data.thumbnail?.source?.replace(/\/\d+px-/, '/800px-') || null;
      cache[universityName] = url;
      sessionStorage.setItem('wiki_' + universityName, url || 'null');
      callback(url);
    })
    .catch(() => {
      // Fallback: search Wikipedia
      fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}+university&format=json&origin=*&srlimit=1`)
        .then(r => r.json())
        .then(data => {
          const title = data.query?.search?.[0]?.title;
          if (!title) throw new Error('not found');
          return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const url = data.thumbnail?.source?.replace(/\/\d+px-/, '/800px-') || null;
          cache[universityName] = url;
          sessionStorage.setItem('wiki_' + universityName, url || 'null');
          callback(url);
        })
        .catch(() => {
          cache[universityName] = null;
          sessionStorage.setItem('wiki_' + universityName, 'null');
          callback(null);
        });
    });
}
