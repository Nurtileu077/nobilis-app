// Vercel Serverless Function: Google Sheets API proxy
// Keeps API key server-side, caches responses for 5 minutes

const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

const ALLOWED_SHEETS = {
  students: '1boyFac6_CxQBuDnxRBsTMfq2C2BCPSrOXsp1V_rjez0',
  pnl: '1Hjby9RrVZz4eRN0Zap53Gr6_qRZ7bXXBIE8mLUNM0ZE',
  salary_monthly: '1WK1njEHBcFWNKAb58Unj5OYFoRk5i-QHcHsE4Po6cBM',
  salary_op: '1JJd44_6b1hsmD6e8liei_zzkkh-GYab6gE4K23IJPVI',
  expenses: '1oy6_TeFCrvZNUBTjP_AzSf4fSBEgSiLEDY2uYc9J7LE',
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_SHEETS_API_KEY) {
    return res.status(500).json({ error: 'Google Sheets API key not configured' });
  }

  const { sheet, range, sheetId: customSheetId } = req.query;

  // Allow either named sheet or direct sheetId
  const spreadsheetId = customSheetId || ALLOWED_SHEETS[sheet];
  if (!spreadsheetId) {
    return res.status(400).json({
      error: 'Invalid sheet parameter',
      allowed: Object.keys(ALLOWED_SHEETS),
    });
  }

  try {
    // Build Google Sheets API URL
    let url;
    if (range) {
      // Fetch specific range values
      const encodedRange = encodeURIComponent(range);
      url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?key=${GOOGLE_SHEETS_API_KEY}&valueRenderOption=UNFORMATTED_VALUE`;
    } else {
      // Fetch sheet metadata (sheet names, etc.)
      url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${GOOGLE_SHEETS_API_KEY}&fields=sheets.properties`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Google Sheets API error',
        status: response.status,
        details: errorText,
      });
    }

    const data = await response.json();

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Google Sheets', details: error.message });
  }
}
