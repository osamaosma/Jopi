// ============================================================================
// jopi Wallet & Virtual Coins/Diamonds Service (Production Supabase Version)
// ============================================================================

import { CoinPackage, CoinTransaction } from '../../types';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { UserService } from '../../services/userService';
import { MOCK_COIN_PACKAGES } from '../../data/mockData';
import { NotificationService } from '../../services/notificationService';
import { supabase } from '../../services/supabaseClient';

export class WalletService {
  static getCoinBalance(): number {
    const currentUser = UserService.getCurrentUser();
    return currentUser?.coin_balance || 0;
  }

  // --- نظام الماسات والأرباح (Diamonds / Earnings) ---
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

  // تفكيك الهدايا المستلمة وتحويلها إلى ماسات
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

  // طلب سحب الأرباح / الماسات
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
      description_ar: `طلب سحب أرباح بعدد ${diamondAmount} ماسة عبر ${payoutMethod}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    NotificationService.addNotification({
      user_id: user.id,
      type: 'system',
      title: 'تم تقديم طلب السحب بنجاح 💎',
      title_ar: 'تم تقديم طلب السحب بنجاح 💎',
      body: `تم خصم ${diamondAmount} ماسة وتحويل الطلب للمراجعة من قبل الإدارة.`,
      body_ar: `تم خصم ${diamondAmount} ماسة وتحويل الطلب للمراجعة من قبل الإدارة.`,
    });

    return { success: true };
  }

  static async requestCashout(diamondAmount: number, payoutMethod: string, accountDetails: string): Promise<{ success: boolean; error?: string }> {
    return this.requestWithdrawal(diamondAmount, payoutMethod, accountDetails);
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
      description_ar,
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

    const dynamicPackagesMap: Record<string, { coins: number; bonus: number }> = {
      'p1': { coins: 600, bonus: 0 },
      'p2': { coins: 1200, bonus: 0 },
      'p3': { coins: 2400, bonus: 0 },
      'p4': { coins: 6250, bonus: 250 },
      'p5': { coins: 12500, bonus: 600 },
      'p6': { coins: 37500, bonus: 2000 },
      'p7': { coins: 65000, bonus: 5000 },
      'p8': { coins: 130000, bonus: 12000 },
    };

    const selectedPkg = dynamicPackagesMap[packageId] || MOCK_COIN_PACKAGES.find(p => p.id === packageId);
    
    if (!selectedPkg) {
      return { success: false, newBalance: this.getCoinBalance(), error: 'Package not found' };
    }

    const coinsCount = 'coins' in selectedPkg ? selectedPkg.coins : 600;
    const bonusCount = 'bonus' in selectedPkg ? (selectedPkg as any).bonus : ('bonus_coins' in selectedPkg ? (selectedPkg as any).bonus_coins : 0);

    const totalCoinsToAdd = coinsCount + bonusCount;
    const currentBalance = this.getCoinBalance();
    const newBalance = currentBalance + totalCoinsToAdd;

    UserService.updateCurrentUser({ coin_balance: newBalance });

    const transactions = this.getTransactions();
    const newTx: CoinTransaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      transaction_type: 'purchase',
      amount: totalCoinsToAdd,
      description: `Purchased ${coinsCount} Coins (+${bonusCount} Bonus)`,
      description_ar: `شراء باقة ${coinsCount} كوينز (+${bonusCount} إضافية)`,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    NotificationService.addNotification({
      user_id: user.id,
      type: 'system',
      title: 'تم شحن المحفظة بنجاح! 🪙',
      title_ar: 'تم شحن المحفظة بنجاح! 🪙',
      body: `تمت إضافة ${totalCoinsToAdd} كوينز إلى رصيدك. رصيدك الحالي: ${newBalance} كوينز.`,
      body_ar: `تمت إضافة ${totalCoinsToAdd} كوينز إلى رصيدك. رصيدك الحالي: ${newBalance} كوينز.`,
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
      description_ar,
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
      description_ar,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    StorageService.set(STORAGE_KEYS.COIN_TRANSACTIONS, transactions);

    return true;
  }
}