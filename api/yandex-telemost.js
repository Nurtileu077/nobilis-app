// Vercel Serverless Function: Yandex Telemost API proxy
// Creates video meetings via Yandex Telemost API
// Requires Yandex 360 for Business OAuth token

const TELEMOST_API = 'https://cloud-api.yandex.net/v1/telemost-api/conferences';

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
    oauthToken,
    action = 'create',
    conferenceId,
    cohosts = [],
  } = req.body;

  if (!oauthToken) {
    return res.status(400).json({ error: 'OAuth token обязателен' });
  }

  const headers = {
    'Authorization': `OAuth ${oauthToken}`,
    'Content-Type': 'application/json',
  };

  try {
    if (action === 'create') {
      // First try with minimal body (no waiting_room_level) for maximum compatibility
      const body = {};

      if (cohosts.length > 0) {
        body.cohosts = cohosts.map(email => ({ email }));
      }

      let response = await fetch(TELEMOST_API, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      // If 403 with empty body, try checking token validity via a simple request
      if (!response.ok) {
        const errorText = await response.text();

        // Additional diagnostics: check token info
        let tokenInfo = null;
        try {
          const tokenCheck = await fetch('https://login.yandex.ru/info?format=json', {
            headers: { 'Authorization': `OAuth ${oauthToken}` },
          });
          tokenInfo = await tokenCheck.json();
        } catch (e) {
          tokenInfo = { error: e.message };
        }

        return res.status(response.status).json({
          error: 'Yandex Telemost API error',
          status: response.status,
          details: errorText,
          tokenInfo: tokenInfo ? {
            login: tokenInfo.login,
            client_id: tokenInfo.client_id,
            psuid: tokenInfo.psuid,
            is_org: !!tokenInfo.is_avatar_empty === false,
            error: tokenInfo.error
          } : null,
          hint: response.status === 403
            ? 'Возможные причины: 1) Токен не имеет права telemost-api:conferences.create, 2) Аккаунт не подключён к Яндекс 360 для бизнеса, 3) У пользователя нет лицензии Телемост в организации'
            : undefined,
        });
      }

      const data = await response.json();

      return res.status(200).json({
        success: true,
        conferenceId: data.id,
        joinUrl: data.join_url,
        watchUrl: data.live_stream?.watch_url || null,
      });
    }

    if (action === 'get') {
      if (!conferenceId) {
        return res.status(400).json({ error: 'conferenceId обязателен для action=get' });
      }

      const response = await fetch(`${TELEMOST_API}/${encodeURIComponent(conferenceId)}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: 'Yandex Telemost API error',
          status: response.status,
          details: errorText,
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        conferenceId: data.id,
        joinUrl: data.join_url,
        watchUrl: data.live_stream?.watch_url || null,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error) {
    return res.status(500).json({
      error: 'Yandex Telemost API failed',
      details: error.message,
    });
  }
}
