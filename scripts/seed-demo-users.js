#!/usr/bin/env node
// =============================================
// SEED DEMO USERS INTO SUPABASE
// =============================================
// Creates auth users + profiles for demo accounts
//
// Usage:
//   node scripts/seed-demo-users.js
//
// Requires SUPABASE_SERVICE_ROLE_KEY env variable
// (or set it in .env as SUPABASE_SERVICE_ROLE_KEY)

const { createClient } = require('@supabase/supabase-js');

// Load .env
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars. Set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('   Get service_role key from: Supabase Dashboard → Settings → API → service_role (secret)');
  process.exit(1);
}

// Admin client with service_role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { login: 'nurtileu', password: 'Nobilis2024!', name: 'Нуртилеу (Директор)', role: 'director', email: 'nurtileu@nobilis.edu', department: 'management' },
  { login: 'sultan.curator', password: 'Nob2024sc!', name: 'Султан (Куратор)', role: 'curator', email: 'sultan.curator@nobilis.edu', department: 'academic' },
  { login: 'zhakupbekova.dar61', password: '2d937fUSHbm!', name: 'Жакупбекова Дарина', role: 'student', email: 'zhakupbekova.dar61@nobilis.edu' },
  { login: 'alua', password: 'Nob2024al!', name: 'Алуа (Преподаватель)', role: 'teacher', email: 'alua@nobilis.edu', department: 'academic' },
  { login: 'madiyar', password: 'Nobilis2024#', name: 'Мадияр (РОП)', role: 'rop', email: 'madiyar@nobilis.edu', department: 'sales' },
  { login: 'darina', password: 'Nob2024dk!', name: 'Дарина (Менеджер)', role: 'manager', email: 'darina@nobilis.edu', department: 'sales' },
];

async function seedUser(user) {
  const tag = `[${user.login}]`;

  // 1. Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, auth_id, login')
    .eq('login', user.login)
    .single();

  if (existingProfile) {
    console.log(`${tag} ✅ Profile already exists (id: ${existingProfile.id})`);
    return existingProfile;
  }

  // 2. Create auth user via admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: { name: user.name, role: user.role, login: user.login },
  });

  if (authError) {
    // If user already exists in auth, try to find them
    if (authError.message?.includes('already been registered') || authError.status === 422) {
      console.log(`${tag} ⚠️  Auth user exists, looking up by email...`);
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingAuth = users.find(u => u.email === user.email);
      if (existingAuth) {
        // Create profile for existing auth user
        return await createProfile(user, existingAuth.id, tag);
      }
    }
    console.error(`${tag} ❌ Auth error:`, authError.message);
    return null;
  }

  console.log(`${tag} ✅ Auth user created (${authData.user.id})`);

  // 3. Create profile
  return await createProfile(user, authData.user.id, tag);
}

async function createProfile(user, authId, tag) {
  const profileData = {
    auth_id: authId,
    login: user.login,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department || null,
    is_active: true,
    phone: null,
  };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'auth_id' })
    .select()
    .single();

  if (profileError) {
    console.error(`${tag} ❌ Profile error:`, profileError.message);
    return null;
  }

  console.log(`${tag} ✅ Profile created (id: ${profile.id}, role: ${profile.role})`);

  // 4. If student, create student record
  if (user.role === 'student') {
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!existingStudent) {
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          profile_id: profile.id,
          status: 'active',
          join_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (studentError) {
        console.error(`${tag} ⚠️  Student record error:`, studentError.message);
      } else {
        console.log(`${tag} ✅ Student record created`);
      }
    }
  }

  return profile;
}

async function main() {
  console.log('🌱 Seeding demo users into Supabase...\n');
  console.log(`   URL: ${SUPABASE_URL}\n`);

  for (const user of DEMO_USERS) {
    await seedUser(user);
    console.log('');
  }

  console.log('✨ Done! Demo accounts:');
  console.log('┌──────────────────────┬──────────────────┬──────────────┐');
  console.log('│ Роль                 │ Логин            │ Пароль       │');
  console.log('├──────────────────────┼──────────────────┼──────────────┤');
  for (const u of DEMO_USERS) {
    console.log(`│ ${u.role.padEnd(20)} │ ${u.login.padEnd(16)} │ ${u.password.padEnd(12)} │`);
  }
  console.log('└──────────────────────┴──────────────────┴──────────────┘');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
