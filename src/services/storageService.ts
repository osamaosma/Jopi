// ============================================================================
// Jopi Local Storage & Persistence Service
// Manages local state and allows resetting or syncing with cloud backend
// ============================================================================

import { 
  User, Match, Message, Conversation, GiftTransaction, 
  CoinTransaction, Notification, Report, BlockedUser, UserSettings 
} from '../types';
import { 
  CURRENT_USER, MOCK_USERS, INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS, INITIAL_REPORTS 
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'jopi_current_user',
  ALL_USERS: 'jopi_all_users',
  LIKES: 'jopi_likes',
  PASSES: 'jopi_passes',
  MATCHES: 'jopi_matches',
  CONVERSATIONS: 'jopi_conversations',
  MESSAGES: 'jopi_messages',
  GIFT_TRANSACTIONS: 'jopi_gift_transactions',
  COIN_TRANSACTIONS: 'jopi_coin_transactions',
  NOTIFICATIONS: 'jopi_notifications',
  REPORTS: 'jopi_reports',
  BLOCKED_USERS: 'jopi_blocked_users',
  USER_SETTINGS: 'jopi_user_settings',
  IS_AUTHENTICATED: 'jopi_is_authenticated',
};

// دالة حماية متوافقة مع TypeScript
const safeUser = (index: number): User => {
  if (Array.isArray(MOCK_USERS) && MOCK_USERS[index]) {
    return MOCK_USERS[index];
  }
  return CURRENT_USER;
};

const currentUserId = CURRENT_USER?.id || 'user-current';

export class StorageService {
  static get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing ${key} to storage:`, e);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing ${key} from storage:`, e);
    }
  }

  static initializeDefaults(force = false): void {
    if (force || !localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, CURRENT_USER || safeUser(0));
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
      this.set(STORAGE_KEYS.ALL_USERS, MOCK_USERS || []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      const u0 = safeUser(0);
      const u1 = safeUser(1);
      const u5 = safeUser(5);

      const initialMatches: Match[] = [
        {
          id: 'match-002',
          user_one_id: currentUserId,
          user_two_id: u0.id,
          matched_user: u0,
          status: 'active',
          last_message: 'تسجيل صوتي (0:14)',
          last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          unread_count: 1,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'match-003',
          user_one_id: currentUserId,
          user_two_id: u1.id,
          matched_user: u1,
          status: 'active',
          last_message: 'مرحبا أسامة! كيف أجواء الرياض اليوم؟',
          last_message_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          unread_count: 0,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'match-007',
          user_one_id: currentUserId,
          user_two_id: u5.id,
          matched_user: u5,
          status: 'active',
          last_message: 'Bonjour! أهلاً وسهلاً.. طاقة جميلة جداً',
          last_message_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          unread_count: 1,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      this.set(STORAGE_KEYS.MATCHES, initialMatches);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      this.set(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS || []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      this.set(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES || {});
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS || []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS)) {
      this.set(STORAGE_KEYS.COIN_TRANSACTIONS, INITIAL_TRANSACTIONS || []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      this.set(STORAGE_KEYS.REPORTS, INITIAL_REPORTS || []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS)) {
      this.set(STORAGE_KEYS.BLOCKED_USERS, []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.LIKES)) {
      this.set(STORAGE_KEYS.LIKES, ['user-002', 'user-003', 'user-007']);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.PASSES)) {
      this.set(STORAGE_KEYS.PASSES, []);
    }
    if (force || !localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)) {
      const defaultSettings: UserSettings = {
        id: 'settings-001',
        user_id: currentUserId,
        discovery_enabled: true,
        filters: {
          age_min: 18,
          age_max: 35,
          gender_preference: 'everyone',
          max_distance_km: 50,
          online_only: false,
          verified_only: false,
          selected_interests: [],
        },
        notifications_enabled: true,
        sound_effects_enabled: true,
        language: 'ar',
        dark_mode: true,
        ghost_mode: false,
        show_online_status: true,
        read_receipts: true,
      };
      this.set(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
    }
  }

  static resetToDemoData(): void {
    try {
      localStorage.clear();
      this.initializeDefaults(true);
    } catch (e) {
      console.error(e);
    }
  }
}

export { STORAGE_KEYS };