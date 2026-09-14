import { supabase } from './supabaseClient';
import { RoomService } from './roomService';
import { User } from '../types';

export interface WheelReward {
  id: number;
  label: string;
  value: number; // عدد الكوينز
  multiplier: string;
  color: string;
  probability: number; // النسبة المئوية للاحتمال
}

// قطاعات العجلة والجوائز
export const WHEEL_SECTORS: WheelReward[] = [
  { id: 0, label: '0', value: 0, multiplier: '0x', color: '#64748b', probability: 35 },
  { id: 1, label: '50', value: 50, multiplier: '0.5x', color: '#3b82f6', probability: 25 },
  { id: 2, label: '100', value: 100, multiplier: '1x', color: '#10b981', probability: 20 },
  { id: 3, label: '200', value: 200, multiplier: '2x', color: '#f59e0b', probability: 10 },
  { id: 4, label: '500', value: 500, multiplier: '5x', color: '#8b5cf6', probability: 6 },
  { id: 5, label: '1000', value: 1000, multiplier: '10x', color: '#ec4899', probability: 3 },
  { id: 6, label: '2500', value: 2500, multiplier: '25x', color: '#e11d48', probability: 0.9 },
  { id: 7, label: '5000', value: 5000, multiplier: '50x', color: '#fbbf24', probability: 0.1 },
];

export class GameService {
  // حساب الفائز عشوائياً وفق نسب الاحتمال المحددة مسبقاً
  static determinePrize(): WheelReward {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const sector of WHEEL_SECTORS) {
      cumulative += sector.probability;
      if (rand <= cumulative) {
        return sector;
      }
    }
    return WHEEL_SECTORS[0];
  }

  // تنفيذ حركة اللعب وتعديل الرصيد
  static async playSpin(user: User, betCost: number, roomId: string): Promise<{ prize: WheelReward; success: boolean; error?: string }> {
    const chosenPrize = this.determinePrize();

    try {
      const { data, error } = await supabase.rpc('play_wheel_game', {
        p_user_id: user.id,
        p_bet_cost: betCost,
        p_reward_won: chosenPrize.value
      });

      if (error || !data?.success) {
        return { prize: chosenPrize, success: false, error: data?.error || 'FAILED' };
      }

      // إذا فاز بجائزة مضاعفة كبيرة، يتم الإعلان عنها تلقائياً في شات الغرفة
      if (chosenPrize.value >= betCost * 5) {
        RoomService.sendRoomMessage(
          roomId,
          `🎉 حظاً كبيراً! فاز ${user.display_name} بـ ${chosenPrize.value} عملة في عجلة الحظ! 🎡`,
          user,
          'game'
        ).catch(() => {});
      }

      return { prize: chosenPrize, success: true };
    } catch {
      return { prize: chosenPrize, success: false, error: 'CONNECTION_ERROR' };
    }
  }
}