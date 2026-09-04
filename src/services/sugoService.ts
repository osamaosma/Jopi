// ============================================================================
// Sugo Gamification Engine: VIP Status, Sound Effects & Lucky Wheel
// ============================================================================

import { AnimatedGift, VipTier, LuckyWheelReward } from '../types/sugo';
import { WalletService } from './walletService';
import { socketService } from './socketService';
import { UserService } from './userService';

export const SUGO_GIFTS: AnimatedGift[] = [
  { id: 'gift-rose', name: 'Magic Rose', name_ar: 'وردة ساحرة 🌹', price: 10, icon: '🌹', category: 'popular' },
  { id: 'gift-heart', name: 'Love Heart', name_ar: 'قلب نابض 💖', price: 50, icon: '💖', category: 'popular' },
  { id: 'gift-perfume', name: 'Royal Oud', name_ar: 'عطر العود 👑', price: 150, icon: '✨', category: 'romantic' },
  { id: 'gift-sports-car', name: 'Supercar', name_ar: 'سيارة خارقة 🏎️', price: 1000, icon: '🏎️', category: 'luxury' },
  { id: 'gift-yacht', name: 'Luxury Yacht', name_ar: 'يخت ملكي 🛥️', price: 3000, icon: '🛥️', category: 'luxury' },
  { id: 'gift-castle', name: 'Golden Castle', name_ar: 'قصر الذهب 🏰', price: 9999, icon: '🏰', category: 'vip' },
  { id: 'gift-dragon', name: 'Fire Dragon', name_ar: 'التنين الأسطوري 🐉', price: 20000, icon: '🐉', category: 'vip' },
];

export const VIP_TIERS: Record<number, VipTier> = {
  1: { level: 1, title: 'Baron', title_ar: 'بارون', badgeIcon: '🥉', borderClass: 'border-amber-600', dailyCoins: 20, roomEntryEffect: 'fade', chatBubbleStyle: 'bg-amber-50 dark:bg-amber-950/20' },
  3: { level: 3, title: 'Count', title_ar: 'كونت', badgeIcon: '🥈', borderClass: 'border-slate-300 shadow-silver', dailyCoins: 60, roomEntryEffect: 'slide', chatBubbleStyle: 'bg-slate-100 dark:bg-slate-800' },
  5: { level: 5, title: 'Duke', title_ar: 'دوق', badgeIcon: '🥇', borderClass: 'border-yellow-400 ring-2 ring-yellow-400/50', dailyCoins: 150, roomEntryEffect: 'gold-flash', chatBubbleStyle: 'bg-gradient-to-r from-amber-100 to-yellow-50 text-slate-900 font-bold' },
  8: { level: 8, title: 'Monarch', title_ar: 'إمبراطور VIP', badgeIcon: '👑', borderClass: 'border-purple-500 ring-4 ring-purple-500/60 animate-pulse', dailyCoins: 500, roomEntryEffect: 'thunder-wings', chatBubbleStyle: 'bg-gradient-to-r from-purple-900 to-indigo-900 text-amber-300 font-black border border-amber-400/50' },
};

export const WHEEL_REWARDS: LuckyWheelReward[] = [
  { id: 'r1', name: '50 Coins', name_ar: '50 عملة 🪙', type: 'coins', value: 50, probability: 0.40, icon: '🪙' },
  { id: 'r2', name: '200 Coins', name_ar: '200 عملة 💰', type: 'coins', value: 200, probability: 0.25, icon: '💰' },
  { id: 'r3', name: 'Magic Rose', name_ar: 'وردة سحرية 🌹', type: 'gift', value: 'gift-rose', probability: 0.20, icon: '🌹' },
  { id: 'r4', name: 'VIP Status (1 Day)', name_ar: 'عضوية VIP يوم 👑', type: 'vip_days', value: 1, probability: 0.10, icon: '👑' },
  { id: 'r5', name: 'Supercar Gift', name_ar: 'سيارة خارقة 🏎️', type: 'gift', value: 'gift-sports-car', probability: 0.04, icon: '🏎️' },
  { id: 'r6', name: '10,000 Jackpot', name_ar: 'الجائزة الكبرى 10,000 💎', type: 'coins', value: 10000, probability: 0.01, icon: '💎' },
];

export class SugoService {
  static playSound(type: 'gift' | 'spin' | 'win' | 'level_up') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'gift') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {
      // Ignore audio errors
    }
  }

  static spinLuckyWheel(): { success: boolean; reward?: LuckyWheelReward; error?: string } {
    const SPIN_COST = 50;
    const currentCoins = WalletService.getCoinBalance();

    if (currentCoins < SPIN_COST) {
      return { success: false, error: 'رصيد العملات غير كافٍ لتدوير العجلة (التكلفة: 50 عملة)!' };
    }

    const deducted = WalletService.deductCoins(SPIN_COST, 'Lucky Wheel Spin', 'تدوير عجلة الحظ');
    if (!deducted) {
      return { success: false, error: 'تعذر خصم العملات' };
    }

    const rand = Math.random();
    let cumulative = 0;
    let selected = WHEEL_REWARDS[0];

    for (const reward of WHEEL_REWARDS) {
      cumulative += reward.probability;
      if (rand <= cumulative) {
        selected = reward;
        break;
      }
    }

    if (selected.type === 'coins') {
      WalletService.addCoins(selected.value as number, 'Lucky Wheel Prize', 'جائزة عجلة الحظ');
    } else if (selected.type === 'vip_days') {
      const u = UserService.getCurrentUser();
      UserService.updateCurrentUser({ vip_level: Math.max(u?.vip_level || 1, 5) });
    }

    this.playSound('win');
    return { success: true, reward: selected };
  }

  static sendAnimatedGift(gift: AnimatedGift, targetUserId: string, roomId?: string): boolean {
    const success = WalletService.deductCoins(gift.price, `Sent ${gift.name}`, `إرسال ${gift.name_ar}`);
    if (!success) return false;

    const sender = UserService.getCurrentUser();
    this.playSound('gift');

    if (roomId) {
      socketService.sendRoomGift(roomId, gift as any, sender, 'all');
    }

    return true;
  }
}