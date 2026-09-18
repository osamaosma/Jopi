// ============================================================================
// Jopi Supabase Profile & Top-Up Service
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config';

const supabaseUrl = (APP_CONFIG as any)?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = (APP_CONFIG as any)?.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

export interface UserGamificationData {
  coinBalance: number;
  diamondBalance: number;
  userLevel: number;
  currentExp: number;
  vipLevel: number;
  isSvip: boolean;
  aristocracyTier: string;
  aristocracyExpiresAt: string | null;
}

export const SupabaseProfileService = {
  // 1. جلب بيانات الرتب والرصيد للمستخدم
  async getUserStats(userId: string): Promise<UserGamificationData | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('coin_balance, diamond_balance, user_level, current_exp, vip_level, is_svip, aristocracy_tier, aristocracy_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      coinBalance: data.coin_balance || 0,
      diamondBalance: data.diamond_balance || 0,
      userLevel: data.user_level || 1,
      currentExp: data.current_exp || 0,
      vipLevel: data.vip_level || 0,
      isSvip: data.is_svip || false,
      aristocracyTier: data.aristocracy_tier || 'none',
      aristocracyExpiresAt: data.aristocracy_expires_at,
    };
  },

  // 2. تنفيذ شحن العملات
  async executeTopUp(userId: string, coinsAmount: number) {
    const expGain = coinsAmount;
    const { data, error } = await supabase.rpc('top_up_user_coins', {
      p_user_id: userId,
      p_coins_amount: coinsAmount,
      p_exp_gain: expGain,
    });

    if (error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('coin_balance')
        .eq('id', userId)
        .single();

      const currentBalance = profile?.coin_balance || 0;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coin_balance: currentBalance + coinsAmount })
        .eq('id', userId);

      if (updateError) return { success: false, error: updateError.message };
      return { success: true };
    }

    return data || { success: true };
  },

  // 3. تفعيل رتبة الأرستقراطية
  async buyAristocracyTier(userId: string, tierName: string, cost: number, days: number = 30) {
    const { data, error } = await supabase.rpc('activate_aristocracy', {
      p_user_id: userId,
      p_tier_name: tierName,
      p_cost: cost,
      p_duration_days: days,
    });

    if (error) return { success: false, error: error.message };
    return data;
  },

  // 4. الاستماع للتحديثات المباشرة Realtime
  subscribeToProfileChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => callback(payload.new)
      )
      .subscribe();
  },
};