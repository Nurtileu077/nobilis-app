// Vercel Serverless Function: Send push notification to all subscribers
// Requires: web-push, VAPID keys in env vars

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const vapidPublic = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@nobilis.edu';

    if (!vapidPublic || !vapidPrivate) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    // Dynamic import for web-push (only used server-side)
    let webpush;
    try {
      webpush = await import('web-push');
      webpush = webpush.default || webpush;
    } catch {
      return res.status(500).json({ error: 'web-push not installed. Run: npm install web-push' });
    }

    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

    // Get subscriptions
    let subscriptions = [];
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      subscriptions = (await kv.get('push_subscriptions')) || [];
    }

    const payload = JSON.stringify({ title, body });
    const results = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.status(200).json({ sent, failed, total: subscriptions.length });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
