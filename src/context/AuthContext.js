// =============================================
// NOBILIS ACADEMY - AUTH CONTEXT (Supabase Auth)
// =============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { id, role, name, email, profileId, ... }
  const [session, setSession] = useState(null);   // Supabase session
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile from profiles table
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      console.warn('Profile not found for auth user:', authUser.id);
      return null;
    }

    // If student, also fetch student record
    let studentData = null;
    if (profile.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      studentData = student;
    }

    return {
      id: profile.id,
      authId: authUser.id,
      login: profile.login,
      name: profile.name,
      email: profile.email || authUser.email,
      phone: profile.phone,
      role: profile.role,
      // Student-specific
      studentId: studentData?.id || null,
      studentData,
    };
  }, []);

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user).then(profile => {
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        setSession(s);
        if (event === 'SIGNED_IN' && s?.user) {
          const profile = await fetchProfile(s.user);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Login with email + password
  const signInWithEmail = useCallback(async (email, password) => {
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
      return { error: authError.message };
    }
    const profile = await fetchProfile(data.user);
    if (!profile) {
      await supabase.auth.signOut();
      const msg = 'Профиль не найден в системе';
      setError(msg);
      return { error: msg };
    }
    setUser(profile);
    return { error: null };
  }, [fetchProfile]);

  // Login with login (username) + password
  const signInWithLogin = useCallback(async (login, password) => {
    setError(null);

    // First, find email by login in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('login', login)
      .single();

    if (profileError || !profile?.email) {
      const msg = 'Неверный логин или пароль';
      setError(msg);
      return { error: msg };
    }

    return signInWithEmail(profile.email, password);
  }, [signInWithEmail]);

  // Logout
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setError(null);
  }, []);

  // Create new user (admin only)
  const createUser = useCallback(async ({ email, password, login, name, role, phone, department }) => {
    // Create auth user via Edge Function (admin API not available client-side)
    // Fallback: use supabase.auth.signUp for non-admin creation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, login },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) throw authError;

    // Create profile (trigger should handle this, but we ensure it exists)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        login,
        name,
        email,
        phone: phone || null,
        role,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) throw profileError;
    return profileData;
  }, []);

  const value = {
    user,
    session,
    loading,
    error,
    signInWithEmail,
    signInWithLogin,
    signOut,
    createUser,
    setUser,
    refreshProfile: () => session?.user && fetchProfile(session.user).then(setUser),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
