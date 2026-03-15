// Temporary diagnostic endpoint to debug Telemost 403 errors
// Access via GET: /api/telemost-debug?token=YOUR_TOKEN

const TELEMOST_API = 'https://cloud-api.yandex.net/v1/telemost-api/conferences';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Pass ?token=YOUR_OAUTH_TOKEN' });
  }

  const results = {};

  // 1. Check token info
  try {
    const r = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { 'Authorization': `OAuth ${token}` },
    });
    results.tokenInfo = await r.json();
    results.tokenStatus = r.status;
  } catch (e) {
    results.tokenError = e.message;
  }

  // 2. Try Telemost API with empty body
  try {
    const r = await fetch(TELEMOST_API, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const text = await r.text();
    results.telemostStatus = r.status;
    results.telemostHeaders = Object.fromEntries(r.headers.entries());
    try {
      results.telemostBody = JSON.parse(text);
    } catch {
      results.telemostBody = text;
    }
  } catch (e) {
    results.telemostError = e.message;
  }

  // 3. Check Yandex 360 org info
  try {
    const r = await fetch('https://api360.yandex.net/directory/v1/org', {
      headers: { 'Authorization': `OAuth ${token}` },
    });
    const text = await r.text();
    results.org360Status = r.status;
    try {
      results.org360Body = JSON.parse(text);
    } catch {
      results.org360Body = text;
    }
  } catch (e) {
    results.org360Error = e.message;
  }

  return res.status(200).json(results);
}
