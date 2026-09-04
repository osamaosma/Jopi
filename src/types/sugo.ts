// ============================================================================
// Sugo-Style Gamification & Monetization Types
// ============================================================================

export interface AnimatedGift {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  icon: string;
  category: 'popular' | 'luxury' | 'vip' | 'romantic';
  animationUrl?: string; // Lottie or CSS animation trigger
  soundFx?: string;
  comboMultiplier?: number;
}

export interface VipTier {
  level: number;
  title: string;
  title_ar: string;
  badgeIcon: string;
  borderClass: string;
  dailyCoins: number;
  roomEntryEffect: string;
  chatBubbleStyle: string;
}

export interface LuckyWheelReward {
  id: string;
  name: string;
  name_ar: string;
  type: 'coins' | 'vip_days' | 'gift' | 'frame';
  value: number | string;
  probability: number;
  icon: string;
}