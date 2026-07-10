/**
 * LiveAhead — Supabase Client
 * 
 * Reads credentials from environment variables (set in .env).
 * Vite exposes these via import.meta.env.VITE_*
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'LiveAhead: Supabase credentials not found. ' +
    'Copy .env.example to .env and fill in your project URL and anon key.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
