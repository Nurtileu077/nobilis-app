// Vercel Serverless Function: Google Calendar API proxy
// Supports list, create, delete actions via Service Account

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    serviceAccountKey,
    calendarId = 'primary',
    timeZone = 'Asia/Almaty',
    action,
    ...params
  } = req.body;

  if (!serviceAccountKey) {
    return res.status(400).json({ error: 'Service Account Key is required' });
  }

  if (!action) {
    return res.status(400).json({ error: 'action is required (list, create, delete)' });
  }

  try {
    const saKey = typeof serviceAccountKey === 'string'
      ? JSON.parse(serviceAccountKey)
      : serviceAccountKey;

    const accessToken = await getAccessToken(saKey);
    const baseUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`;

    if (action === 'list') {
      const { timeMin, timeMax, limit = 50 } = params;
      const url = new URL(`${baseUrl}/events`);
      if (timeMin) url.searchParams.set('timeMin', timeMin);
      if (timeMax) url.searchParams.set('timeMax', timeMax);
      url.searchParams.set('maxResults', String(limit));
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('timeZone', timeZone);

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: 'Google Calendar API error',
          status: response.status,
          details: errorText,
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        items: (data.items || []).map(ev => ({
          id: ev.id,
          summary: ev.summary,
          description: ev.description,
          start: ev.start,
          end: ev.end,
          meetLink: ev.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri || ev.hangoutLink || null,
          htmlLink: ev.htmlLink,
        })),
      });
    }

    if (action === 'create') {
      const { summary, description, startTime, endTime, attendees = [] } = params;
      if (!summary || !startTime || !endTime) {
        return res.status(400).json({ error: 'summary, startTime, endTime are required' });
      }

      const event = {
        summary,
        description: description || '',
        start: { dateTime: startTime, timeZone },
        end: { dateTime: endTime, timeZone },
        attendees: attendees.map(email => ({ email })),
      };

      const response = await fetch(`${baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: 'Google Calendar API error',
          status: response.status,
          details: errorText,
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        eventId: data.id,
        summary: data.summary,
        start: data.start,
        end: data.end,
        htmlLink: data.htmlLink,
      });
    }

    if (action === 'delete') {
      const { eventId } = params;
      if (!eventId) {
        return res.status(400).json({ error: 'eventId is required' });
      }

      const response = await fetch(`${baseUrl}/events/${encodeURIComponent(eventId)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: 'Google Calendar API error',
          status: response.status,
          details: errorText,
        });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error) {
    return res.status(500).json({
      error: 'Google Calendar API failed',
      details: error.message,
    });
  }
}

// Generate OAuth2 access token from Service Account JWT
async function getAccessToken(saKey) {
  const now = Math.floor(Date.now() / 1000);
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: saKey.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  if (saKey.subject) {
    claim.sub = saKey.subject;
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedClaim = base64urlEncode(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(saKey.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${signatureInput}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
