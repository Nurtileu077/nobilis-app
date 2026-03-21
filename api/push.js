// Vercel Serverless Function: Push notifications (subscribe + send)
// Uses Supabase to persist subscriptions across deploys

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

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

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          { endpoint: subscription.endpoint, subscription },
          { onConflict: 'endpoint' }
        );

      if (error) {
        console.error('Supabase subscribe error:', error);
        return res.status(500).json({ error: 'Failed to save subscription' });
      }

      const { count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true });

      return res.status(200).json({ success: true, total: count || 0 });
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

      const { data: rows, error: fetchErr } = await supabase
        .from('push_subscriptions')
        .select('endpoint, subscription');

      if (fetchErr) {
        console.error('Supabase fetch error:', fetchErr);
        return res.status(500).json({ error: 'Failed to read subscriptions' });
      }

      if (!rows || rows.length === 0) {
        return res.status(200).json({ sent: 0, failed: 0, total: 0, message: 'No subscribers yet' });
      }

      const payload = JSON.stringify({ title, body });
      const results = await Promise.allSettled(
        rows.map(row => webpush.sendNotification(row.subscription, payload))
      );

      // Remove expired subscriptions (410 Gone)
      const expiredEndpoints = rows
        .filter((_, i) => {
          const r = results[i];
          return r.status === 'rejected' && r.reason && r.reason.statusCode === 410;
        })
        .map(row => row.endpoint);

      if (expiredEndpoints.length > 0) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .in('endpoint', expiredEndpoints);
      }

      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return res.status(200).json({ sent, failed, total: rows.length });
    } catch (error) {
      console.error('Send notification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use "subscribe" or "send"' });
}
