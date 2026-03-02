// Vercel Serverless Function: Save push subscription
// Uses Vercel KV if available, otherwise in-memory (for demo)

let memoryStore = [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    // Try Vercel KV first
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      const subs = (await kv.get('push_subscriptions')) || [];
      const exists = subs.some(s => s.endpoint === subscription.endpoint);
      if (!exists) {
        subs.push(subscription);
        await kv.set('push_subscriptions', subs);
      }
    } else {
      // Fallback: in-memory
      const exists = memoryStore.some(s => s.endpoint === subscription.endpoint);
      if (!exists) memoryStore.push(subscription);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
