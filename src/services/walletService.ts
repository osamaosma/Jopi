// ============================================================================
// jopi Wallet & Virtual Coins/Diamonds Service (Production Supabase Version)
// ============================================================================

import { CoinPackage, CoinTransaction } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { UserService } from './userService';
import { MOCK_COIN_PACKAGES } from '../data/mockData';
import { NotificationService } from './notificationService';
import { supabase } from './supabaseClient';

export class WalletService {
  static getCoinBalance(): number {
    const currentUser = UserService.getCurrentUser();
    return currentUser?.coin_balance || 0;
  }

  static getDiamondsBalance(): number {
    const currentUser = UserService.getCurrentUser() as any;
    return currentUser?.diamonds_balance || 0;
  }

  static getCoinPackages(): CoinPackage[] {
    return MOCK_COIN_PACKAGES;
  }

  static getTransactions(): CoinTransaction[] {
    StorageService.initializeDefaults();
    return StorageService.get<CoinTransaction[]>(STORAGE_KEYS.COIN_TRANSACTIONS, []);
  }

  static async convertGiftsToDiamonds(giftId: string, count: number): Promise<{ success: boolean; diamondsEarned: number; error?: string }> {
    const user = UserService.getCurrentUser() as any;
    if (!user || !user.id) return { success: false, diamondsEarned: 0, error: 'المستخدم غير مسجل دخول' };

    const diamondRate = 0.5; 
    const diamondsEarned = Math.floor(count * 10 * diamondRate);

    const currentDiamonds = user.diamonds_balance || 0;
    const newDiamondsBalance = currentDiamonds + diamondsEarned;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ diamond_balance: newDiamondsBalance })
        .eq('id', user.id);

      if (error) throw error;
      UserService.updateCurrentUser({ diamonds_balance: newDiamondsBalance } as any);
      return { success: true, diamondsEarned };
    } catch (e: any) {
      return { success: false, diamondsEarned: 0, error: e.message || 'فشل عملية التفكيك' };
    }
  }

  static async requestWithdrawal(diamondAmount: number, payoutMethod: string, accountDetails: string): Promise<{ success: boolean; error?: string }> {
    const user = UserService.getCurrentUser() as any;
    if (!user || !user.id) return { success: false, error: 'المستخدم غير مسجل دخول' };

    const currentDiamonds = user.diamonds_balance || 0;
    if (currentDiamonds < diamondAmount) {
      return { success: false, error: 'رصيد الماسات غير كافٍ لعملية السحب' };
    }

    const newDiamondsBalance = currentDiamonds - diamondAmount;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ diamond_balance: newDiamondsBalance })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    UserService.updateCurrentUser({ diamonds_balance: newDiamondsBalance } as any);

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `withdraw-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'spend',
      amount: -diamondAmount,
      description: `Withdrawal request of ${diamondAmount} diamonds via ${payoutMethod} (${accountDetails})`,
      description_ar: `\u202Bطلب سحب أرباح بعدد ${diamondAmount} ماسة عبر ${payoutMethod}\u202C`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    NotificationService.addNotification({
      user_id: user.id,
      type: 'system',
      title: '\u202Bتم تقديم طلب السحب بنجاح 💎\u202C',
      title_ar: '\u202Bتم تقديم طلب السحب بنجاح 💎\u202C',
      body: `\u202Bتم خصم ${diamondAmount} ماسة وتحويل الطلب للمراجعة من قبل الإدارة.\u202C`,
      body_ar: `\u202Bتم خصم ${diamondAmount} ماسة وتحويل الطلب للمراجعة من قبل الإدارة.\u202C`,
    });

    return { success: true };
  }

  static async requestCashout(diamondsAmount: number, paymentMethod: string, accountDetails: string): Promise<{ success: boolean; error?: string }> {
    return this.requestWithdrawal(diamondsAmount, paymentMethod, accountDetails);
  }

  static addCoins(amount: number, description = 'Coins Added', description_ar = 'إضافة عملات'): boolean {
    const user = UserService.getCurrentUser();
    if (!user || !user.id) return false;

    const currentBalance = this.getCoinBalance();
    const newBalance = currentBalance + amount;
    UserService.updateCurrentUser({ coin_balance: newBalance });

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'purchase',
      amount,
      description,
      description_ar: `\u202B${description_ar}\u202C`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    return true;
  }

  static async purchasePackage(packageId: string): Promise<{ success: boolean; newBalance: number; error?: string }> {
    await new Promise(res => setTimeout(res, 800));

    const user = UserService.getCurrentUser();
    if (!user || !user.id) {
      return { success: false, newBalance: this.getCoinBalance(), error: 'User not found' };
    }

    const dynamicPackagesMap: Record<string, { coins: number }> = {
      'pkg-1': { coins: 32000 },
      'pkg-2': { coins: 264000 },
      'pkg-3': { coins: 560000 },
      'pkg-4': { coins: 1740000 },
      'pkg-5': { coins: 3040000 },
      'pkg-6': { coins: 6108000 },
      'pkg-7': { coins: 18428000 },
      'pkg-8': { coins: 30556000 },
      'pkg-9': { coins: 61508000 },
    };

    const selectedPkg = dynamicPackagesMap[packageId] || MOCK_COIN_PACKAGES.find(p => p.id === packageId);
    
    if (!selectedPkg) {
      return { success: false, newBalance: this.getCoinBalance(), error: 'Package not found' };
    }

    const coinsCount = 'coins' in selectedPkg ? selectedPkg.coins : 32000;
    
    const totalCoinsToAdd = coinsCount;
    const currentBalance = this.getCoinBalance();
    const newBalance = currentBalance + totalCoinsToAdd;

    UserService.updateCurrentUser({ coin_balance: newBalance });

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'purchase',
      amount: totalCoinsToAdd,
      description: `Purchased ${coinsCount} Coins`,
      description_ar: `\u202Bشراء باقة ${coinsCount.toLocaleString()} كوينز\u202C`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    NotificationService.addNotification({
      user_id: user.id,
      type: 'system',
      title: '\u202Bتم شحن المحفظة بنجاح! 🪙\u202C',
      title_ar: '\u202Bتم شحن المحفظة بنجاح! 🪙\u202C',
      body: `\u202Bتمت إضافة ${totalCoinsToAdd.toLocaleString()} كوينز إلى رصيدك. رصيدك الحالي: ${newBalance.toLocaleString()} كوينز.\u202C`,
      body_ar: `\u202Bتمت إضافة ${totalCoinsToAdd.toLocaleString()} كوينز إلى رصيدك. رصيدك الحالي: ${newBalance.toLocaleString()} كوينز.\u202C`,
    });

    return { success: true, newBalance };
  }

  static deductCoins(amount: number, description = 'Coins Deducted', description_ar = 'خصم عملات'): boolean {
    const user = UserService.getCurrentUser();
    if (!user || !user.id) return false;

    const currentBalance = user.coin_balance || 0;
    if (currentBalance < amount) {
      return false;
    }

    const newBalance = currentBalance - amount;
    UserService.updateCurrentUser({ coin_balance: newBalance });

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'gift_sent',
      amount: -amount,
      description,
      description_ar: `\u202B${description_ar}\u202C`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    return true;
  }

  static async deductCoinsReal(amount: number, description = 'Coins Deducted', description_ar = 'خصم عملات'): Promise<boolean> {
    const user = UserService.getCurrentUser();
    if (!user || !user.id) return false;

    const currentBalance = user.coin_balance || 0;
    if (currentBalance < amount) {
      return false;
    }

    const newBalance = currentBalance - amount;
    const successCloud = await UserService.updateCoinBalanceReal(newBalance);
    if (!successCloud) return false;

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'gift_sent',
      amount: -amount,
      description,
      description_ar: `\u202B${description_ar}\u202C`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    return true;
  }
}