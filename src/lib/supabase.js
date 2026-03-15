// =============================================
// NOBILIS ACADEMY - SUPABASE CONFIG
// =============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Staff email-to-role mapping for Supabase Auth (no passwords stored client-side)
const STAFF_EMAIL_MAP = {
  'nurtileu@nobilis.kz': { id: 'dir1', name: 'Нуртилеу', role: 'director' },
  'saltanat@nobilis.kz': { id: 'ad1', name: 'Салтанат', role: 'academic_director' },
  'madiyar@nobilis.kz': { id: 'rop1', name: 'Мадияр', role: 'rop' },
};

// Supabase login helper
export const supabaseLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  const staff = STAFF_EMAIL_MAP[data.user.email];
  if (!staff) return { user: null, error: 'Пользователь не найден в системе' };
  return { user: { role: staff.role, id: staff.id, name: staff.name }, error: null };
};

export const supabaseLogout = async () => {
  await supabase.auth.signOut();
};
