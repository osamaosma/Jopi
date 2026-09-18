// ============================================================================
// jopi Relationship & Couple Intimacy Service (Production Supabase Version)
// Handles Intimacy Levels, Points, Tokens, Tasks & Female Wishlist Gifts
// ============================================================================

import { StorageService } from './storageService';
import { UserService } from './userService';
import { supabase } from './supabaseClient';
import { User, Gift } from '../types';

export type RelationshipType = 'couple' | 'friendship';

export interface CoupleToken {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  unlocked_at_level: number;
}

export interface WishlistGiftItem {
  id: string;
  gift_id: string;
  name_ar: string;
  name_en: string;
  icon: string;
  cost: number;
  is_fulfilled: boolean;
}

export interface CoupleRelationship {
  id: string;
  user1_id: string;
  user2_id: string;
  relationship_type: RelationshipType; // نوع العلاقة: ارتباط (قلب) أو صداقة (زهرة)
  level: number;
  current_points: number;
  max_points_for_level: number;
  start_date: string;
  days_count: number;
  relationship_title?: string;
  is_hidden?: boolean;
  tokens: CoupleToken[];
  wishlist: WishlistGiftItem[];
  daily_chat_points: number;
  last_chat_date: string;
}

const STORAGE_KEY_COUPLES = 'jopi_couple_relationships';

export class RelationshipService {
  static readonly AVAILABLE_TOKENS: CoupleToken[] = [
    { id: 'token-ring-silver', name: 'Silver Oath Ring', name_ar: 'خاتم العهد الفضي', icon: '💍', unlocked_at_level: 1 },
    { id: 'token-ring-amethyst', name: 'Amethyst Crystal Ring', name_ar: 'خاتم الكريستال الأرجواني', icon: '🔮', unlocked_at_level: 20 },
    { id: 'token-ring-diamond', name: 'Eternal Diamond Ring', name_ar: 'خاتم الألماس الخالد', icon: '💎', unlocked_at_level: 50 },
    { id: 'token-crown-regal', name: 'Royal Couple Crown', name_ar: 'تاج الملكية الفاخر', icon: '👑', unlocked_at_level: 70 },
  ];

  static readonly DEFAULT_FEMALE_WISHLIST: WishlistGiftItem[] = [
    { id: 'wish-1', gift_id: 'gift-rose-bouquet', name_ar: 'باقة الورد الملكية', name_en: 'Royal Rose Bouquet', icon: '🌹', cost: 800, is_fulfilled: false },
    { id: 'wish-2', gift_id: 'gift-treasure-chest', name_ar: 'صندوق الهدايا الفاخر', name_en: 'Luxury Chest', icon: '🎁', cost: 2000, is_fulfilled: false },
    { id: 'wish-3', gift_id: 'gift-magic-castle', name_ar: 'قلعة الأحلام السحرية', name_en: 'Dream Castle', icon: '🏰', cost: 10000, is_fulfilled: false },
  ];

  static getMaxPointsForLevel(level: number): number {
    return Math.floor(1000 * Math.pow(level, 1.35));
  }

  static getRelationship(userA_Id: string, userB_Id: string): CoupleRelationship {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    let rel = list.find(
      r => (r.user1_id === userA_Id && r.user2_id === userB_Id) ||
           (r.user1_id === userB_Id && r.user2_id === userA_Id)
    );

    if (!rel) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 19);

      const partner = UserService.getUserById(userB_Id);
      const isFemale = partner?.gender === 'female';

      rel = {
        id: `rel_${userA_Id}_${userB_Id}`,
        user1_id: userA_Id,
        user2_id: userB_Id,
        relationship_type: 'couple', // الافتراضي ارتباط، يمكن تغييره لصداقة
        level: 49,
        current_points: 49063,
        max_points_for_level: 50000,
        start_date: startDate.toISOString(),
        days_count: 19,
        relationship_title: 'Couple',
        is_hidden: false,
        tokens: [this.AVAILABLE_TOKENS[0], this.AVAILABLE_TOKENS[1]],
        wishlist: isFemale ? [...this.DEFAULT_FEMALE_WISHLIST] : [],
        daily_chat_points: 0,
        last_chat_date: new Date().toISOString().slice(0, 10),
      };

      list.push(rel);
      StorageService.set(STORAGE_KEY_COUPLES, list);
    }

    return rel;
  }

  static addChatIntimacyPoints(userA_Id: string, userB_Id: string): CoupleRelationship {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    let rel = this.getRelationship(userA_Id, userB_Id);
    const today = new Date().toISOString().slice(0, 10);

    if (rel.last_chat_date !== today) {
      rel.daily_chat_points = 0;
      rel.last_chat_date = today;
    }

    if (rel.daily_chat_points < 30) {
      rel.daily_chat_points += 1;
      rel.current_points += 1;

      if (rel.current_points >= rel.max_points_for_level) {
        rel.level += 1;
        rel.max_points_for_level = this.getMaxPointsForLevel(rel.level);
      }

      const index = list.findIndex(r => r.id === rel.id);
      if (index >= 0) {
        list[index] = rel;
      } else {
        list.push(rel);
      }
      StorageService.set(STORAGE_KEY_COUPLES, list);
      window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: rel }));
    }

    return rel;
  }

  static addGiftIntimacyPoints(userA_Id: string, userB_Id: string, gift: Gift): CoupleRelationship {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    const rel = this.getRelationship(userA_Id, userB_Id);

    const addedPoints = gift.coin_price;
    rel.current_points += addedPoints;

    if (rel.wishlist && rel.wishlist.length > 0) {
      const matchWish = rel.wishlist.find(w => w.gift_id === gift.id || w.cost <= gift.coin_price);
      if (matchWish) {
        matchWish.is_fulfilled = true;
      }
    }

    while (rel.current_points >= rel.max_points_for_level) {
      rel.level += 1;
      rel.max_points_for_level = this.getMaxPointsForLevel(rel.level);

      const unlocked = this.AVAILABLE_TOKENS.filter(
        t => t.unlocked_at_level <= rel.level && !rel.tokens.some(existing => existing.id === t.id)
      );
      if (unlocked.length > 0) {
        rel.tokens.push(...unlocked);
      }
    }

    const index = list.findIndex(r => r.id === rel.id);
    if (index >= 0) {
      list[index] = rel;
    } else {
      list.push(rel);
    }
    StorageService.set(STORAGE_KEY_COUPLES, list);
    window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: rel }));

    try {
      void supabase.from('couple_relationships').upsert({
        id: rel.id,
        user1_id: rel.user1_id,
        user2_id: rel.user2_id,
        level: rel.level,
        current_points: rel.current_points,
        max_points: rel.max_points_for_level,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {}

    return rel;
  }

  // تبديل نوع العلاقة بين ارتباط وصداقة
  static setRelationshipType(relId: string, type: RelationshipType): void {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    const rel = list.find(r => r.id === relId);
    if (rel) {
      rel.relationship_type = type;
      rel.relationship_title = type === 'couple' ? 'Couple' : 'Bestie / Friends';
      StorageService.set(STORAGE_KEY_COUPLES, list);
      window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: rel }));
    }
  }

  static renameRelationship(relId: string, newTitle: string): void {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    const rel = list.find(r => r.id === relId);
    if (rel) {
      rel.relationship_title = newTitle;
      StorageService.set(STORAGE_KEY_COUPLES, list);
      window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: rel }));
    }
  }

  static toggleHideRelationship(relId: string): boolean {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    const rel = list.find(r => r.id === relId);
    let state = false;
    if (rel) {
      rel.is_hidden = !rel.is_hidden;
      state = rel.is_hidden;
      StorageService.set(STORAGE_KEY_COUPLES, list);
      window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: rel }));
    }
    return state;
  }

  static endRelationship(relId: string): void {
    const list = StorageService.get<CoupleRelationship[]>(STORAGE_KEY_COUPLES, []);
    const filtered = list.filter(r => r.id !== relId);
    StorageService.set(STORAGE_KEY_COUPLES, filtered);
    window.dispatchEvent(new CustomEvent('jopi_relationship_updated', { detail: null }));

    try {
      void supabase.from('couple_relationships').delete().eq('id', relId);
    } catch (e) {}
  }
}