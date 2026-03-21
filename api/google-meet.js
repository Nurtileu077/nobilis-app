// Vercel Serverless Function: Google Meet link generator
// Creates Google Meet meetings via Google Calendar API
// Uses Service Account credentials stored server-side

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
    delegateEmail,
    summary,
    description,
    startTime,
    endTime,
    attendees = [],
    timeZone = 'Asia/Almaty',
  } = req.body;

  if (!serviceAccountKey) {
    return res.status(400).json({ error: 'Service Account Key is required' });
  }

  if (!summary || !startTime || !endTime) {
    return res.status(400).json({ error: 'summary, startTime, endTime are required' });
  }

  try {
    // Parse the service account key
    const saKey = typeof serviceAccountKey === 'string'
      ? JSON.parse(serviceAccountKey)
      : serviceAccountKey;

    // Generate JWT token for Google API auth
    const accessToken = await getAccessToken(saKey, delegateEmail);

    // Create calendar event with Google Meet conference
    const event = {
      summary,
      description: description || '',
      start: {
        dateTime: startTime,
        timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: `nobilis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`;

    const response = await fetch(calendarUrl, {
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

    // Extract Meet link
    const meetLink = data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri || data.hangoutLink || null;

    return res.status(200).json({
      success: true,
      eventId: data.id,
      meetLink,
      htmlLink: data.htmlLink,
      start: data.start,
      end: data.end,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to create Google Meet',
      details: error.message,
    });
  }
}

// Generate OAuth2 access token from Service Account JWT
async function getAccessToken(saKey, delegateEmail) {
  const now = Math.floor(Date.now() / 1000);
  const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

  // Build JWT header and claim
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: saKey.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Use delegateEmail (from UI) or subject (from SA key) for domain-wide delegation
  // Required for Google Workspace corporate accounts to create Meet links
  if (delegateEmail) {
    claim.sub = delegateEmail;
  } else if (saKey.subject) {
    claim.sub = saKey.subject;
  }

  // Create JWT
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedClaim = base64urlEncode(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Sign with RSA-SHA256
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(saKey.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
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
