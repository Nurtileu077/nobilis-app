// =============================================
// NOBILIS ACADEMY - SUPABASE CLIENT
// =============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const SUPABASE_CONFIGURED = Boolean(
  supabaseUrl && supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// =============================================
// REALTIME SUBSCRIPTIONS
// =============================================

export function subscribeToTable(table, callback, filter = null) {
  let channel = supabase
    .channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter || {}),
      },
      (payload) => callback(payload)
    );

  channel.subscribe();
  return () => channel.unsubscribe();
}

// Subscribe to multiple tables at once
export function subscribeToTables(tables, callback) {
  const unsubscribers = tables.map(table =>
    subscribeToTable(table, (payload) => callback(table, payload))
  );
  return () => unsubscribers.forEach(unsub => unsub());
}

// =============================================
// STORAGE HELPERS
// =============================================

export const storage = {
  async uploadFile(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', ...options });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { path: data.path, url: publicUrl };
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  getPublicUrl(bucket, path) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return publicUrl;
  },

  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const path = `${userId}/avatar.${fileExt}`;
    return this.uploadFile('avatars', path, file, { upsert: true });
  },

  async uploadDocument(studentId, file) {
    const fileExt = file.name.split('.').pop();
    const path = `${studentId}/${Date.now()}.${fileExt}`;
    return this.uploadFile('documents', path, file);
  },
};
