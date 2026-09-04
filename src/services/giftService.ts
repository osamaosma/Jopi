// ============================================================================
// MingleUp Virtual Gift Service (Production Supabase Version)
// ============================================================================

import { Gift, GiftTransaction } from '../types';
import { MOCK_GIFTS } from '../data/mockData';
import { StorageService, STORAGE_KEYS } from './storageService';
import { WalletService } from './walletService';
import { UserService } from './userService';
import { NotificationService } from './notificationService';
import { supabase } from './supabaseClient';

export class GiftService {
  static getGifts(): Gift[] {
    return MOCK_GIFTS;
  }

  static getGiftById(giftId: string): Gift | undefined {
    return MOCK_GIFTS.find(g => g.id === giftId);
  }

  static getGiftTransactions(): GiftTransaction[] {
    StorageService.initializeDefaults();
    return StorageService.get<GiftTransaction[]>(STORAGE_KEYS.GIFT_TRANSACTIONS, []);
  }

  static async sendGift(
    receiverId: string, 
    giftId: string, 
    conversationId?: string
  ): Promise<{ success: boolean; error?: string; transaction?: GiftTransaction; gift?: Gift }> {
    const gift = this.getGiftById(giftId);
    if (!gift) {
      return { success: false, error: 'Gift not found' };
    }

    const currentUser = UserService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, error: 'User not authenticated' };
    }

    const receiver = UserService.getUserById(receiverId);
    if (!receiver) {
      return { success: false, error: 'Receiver not found' };
    }

    // 1. Check & deduct coins real cloud-side via WalletService
    const deducted = await WalletService.deductCoinsReal(
      gift.coin_price,
      `Sent ${gift.name} to ${receiver.display_name}`,
      `إرسال ${gift.name_ar} إلى ${receiver.display_name}`
    );

    if (!deducted) {
      return { success: false, error: 'INSUFFICIENT_COINS' };
    }

    // 2. Create Local Transaction Record for UI reactivity
    const transactions = this.getGiftTransactions();
    const newTx: GiftTransaction = {
      id: `gtx-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name,
      receiver_id: receiverId,
      gift_id: giftId,
      gift,
      coin_amount: gift.coin_price,
      conversation_id: conversationId,
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.GIFT_TRANSACTIONS, transactions);

    // 3. Save Gift to Supabase Real Cloud Table (`gifts`)
    const { error: cloudError } = await supabase.from('gifts').insert({
      id: newTx.id,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      gift_name: gift.name,
      cost: gift.coin_price,
      conversation_id: conversationId || null,
      gift_id: giftId,
      gift_data: gift
    });

    if (cloudError) {
      console.error('Cloud gift insert error:', cloudError);
      // Even if cloud insert fails due to sync, transaction is recorded locally
    }

    // 4. Send Notification to receiver
    NotificationService.addNotification({
      user_id: receiverId,
      type: 'gift_received',
      title: `هدية جديدة: ${gift.icon} ${gift.name_ar}`,
      title_ar: `هدية جديدة: ${gift.icon} ${gift.name_ar}`,
      body: `أرسل لك ${currentUser.display_name} هدية ${gift.name_ar} (${gift.coin_price} عملة)!`,
      body_ar: `أرسل لك ${currentUser.display_name} هدية ${gift.name_ar} (${gift.coin_price} عملة)!`,
      avatar_url: currentUser.profile_photo,
      reference_id: currentUser.id,
    });

    return { success: true, transaction: newTx, gift };
  }
}