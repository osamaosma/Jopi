// ============================================================================
// Jopi Supabase Client (Fixed Session Detection & Production Ready)
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

const supabaseUrl = APP_CONFIG.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = APP_CONFIG.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in config or .env file');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // تم تصحيحها لتمكين التطبيق من التقاط توكن جوجل من الابط
      storage: window.localStorage,
    },
  }
);