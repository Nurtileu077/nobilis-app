// Vercel Serverless Function: Push notifications (subscribe + send)
// Single function to share /tmp storage between operations

import { readFileSync, writeFileSync } from 'fs';

const SUBS_FILE = '/tmp/push_subscriptions.json';

function readSubs() {
  try {
    return JSON.parse(readFileSync(SUBS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSubs(subs) {
  writeFileSync(SUBS_FILE, JSON.stringify(subs));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.body;

  // --- SUBSCRIBE ---
  if (action === 'subscribe') {
    try {
      const { subscription } = req.body;
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
      }

      const subs = readSubs();
      const exists = subs.some(s => s.endpoint === subscription.endpoint);
      if (!exists) {
        subs.push(subscription);
        writeSubs(subs);
      }

      return res.status(200).json({ success: true, total: subs.length });
    } catch (error) {
      console.error('Subscribe error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // --- SEND NOTIFICATION ---
  if (action === 'send') {
    try {
      const { title, body } = req.body;
      if (!title) return res.status(400).json({ error: 'Title required' });

      const vapidPublic = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
      const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@nobilis.edu';

      if (!vapidPublic || !vapidPrivate) {
        return res.status(500).json({ error: 'VAPID keys not configured' });
      }

      let webpush;
      try {
        webpush = await import('web-push');
        webpush = webpush.default || webpush;
      } catch {
        return res.status(500).json({ error: 'web-push not installed' });
      }

      webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

      const subscriptions = readSubs();
      if (subscriptions.length === 0) {
        return res.status(200).json({ sent: 0, failed: 0, total: 0, message: 'No subscribers yet' });
      }

      const payload = JSON.stringify({ title, body });
      const results = await Promise.allSettled(
        subscriptions.map(sub => webpush.sendNotification(sub, payload))
      );

      // Remove expired subscriptions (410 Gone)
      const validSubs = subscriptions.filter((_, i) => {
        const r = results[i];
        return r.status === 'fulfilled' || (r.reason && r.reason.statusCode !== 410);
      });
      if (validSubs.length !== subscriptions.length) {
        writeSubs(validSubs);
      }

      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return res.status(200).json({ sent, failed, total: subscriptions.length });
    } catch (error) {
      console.error('Send notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use "subscribe" or "send"' });
}
