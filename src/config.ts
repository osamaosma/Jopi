// ============================================================================
// jopi App Runtime Configuration shared by web and native builds.
// ============================================================================

const LIVE_BACKEND_URL = 'https://jopi-backend-qwbz.onrender.com';
const LIVE_SUPABASE_URL = 'https://whmpuhjrkuivhollodyz.supabase.co';

// مفتاح الربط العام لخدمة Supabase
const LIVE_SUPABASE_ANON_KEY = 'sb_publishable_0ziJ4_fPj_JwR7Fr0S3K3A_tg5j9avl';

const rawApiUrl = (import.meta.env.VITE_API_URL as string) || LIVE_BACKEND_URL;
const rawSocketUrl = (import.meta.env.VITE_SOCKET_URL as string) || LIVE_BACKEND_URL;
const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || LIVE_SUPABASE_URL;
const rawSupabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || LIVE_SUPABASE_ANON_KEY;

export const APP_CONFIG = {
  appName: 'jopi',
  version: '1.0.0',
  apiUrl: rawApiUrl.replace(/\/$/, ''),
  socketUrl: rawSocketUrl.replace(/\/$/, ''),
  supabaseUrl: rawSupabaseUrl.replace(/\/$/, ''),
  supabaseAnonKey: rawSupabaseKey,
  isNative: typeof window !== 'undefined' && (
    window.location.protocol.startsWith('capacitor') ||
    window.location.protocol.startsWith('ionic') ||
    window.location.hostname === 'localhost'
  ),
};

export function getBackendUrl(): string | null {
  return APP_CONFIG.socketUrl || LIVE_BACKEND_URL;
}