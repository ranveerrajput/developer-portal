import { createClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseCredentials =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl?.includes('your-project.supabase.co') &&
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = hasSupabaseCredentials && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = supabase !== null;
