// Vercel Serverless Function: Bitrix24 API proxy
// Routes requests to Bitrix24 REST API via webhook
// Keeps webhook URL server-side for security

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { method: apiMethod, webhookUrl } = req.method === 'GET' ? req.query : req.body;

  if (!webhookUrl || !apiMethod) {
    return res.status(400).json({
      error: 'Missing required parameters: webhookUrl, method',
    });
  }

  // Validate webhook URL format (must be bitrix24 domain)
  try {
    const url = new URL(webhookUrl);
    if (!url.hostname.includes('bitrix24')) {
      return res.status(400).json({ error: 'Invalid Bitrix24 webhook URL' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid webhook URL format' });
  }

  // Build Bitrix24 REST API URL
  const baseUrl = webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`;
  const bitrixUrl = `${baseUrl}${apiMethod}`;

  try {
    const params = req.body?.params || req.query?.params;
    let response;

    if (req.method === 'POST') {
      response = await fetch(bitrixUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {}),
      });
    } else {
      const searchParams = new URLSearchParams();
      if (params && typeof params === 'object') {
        flattenParams(params, searchParams);
      }
      const queryString = searchParams.toString();
      response = await fetch(`${bitrixUrl}${queryString ? '?' + queryString : ''}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Bitrix24 API error',
        status: response.status,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to connect to Bitrix24',
      details: error.message,
    });
  }
}

// Flatten nested objects for URL params (Bitrix24 format)
function flattenParams(obj, params, prefix = '') {
  for (const [key, value] of Object.entries(obj)) {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenParams(value, params, paramKey);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') {
          flattenParams(item, params, `${paramKey}[${i}]`);
        } else {
          params.append(`${paramKey}[${i}]`, item);
        }
      });
    } else {
      params.append(paramKey, value);
    }
  }
}
