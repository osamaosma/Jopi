// ============================================================================
// MingleUp My Diamonds & Cashout Screen (Sugo-Style Host Earnings)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, ArrowRightLeft, DollarSign, ShieldCheck, Wallet } from 'lucide-react';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const DiamondsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [diamonds, setDiamonds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [cashoutAmount, setCashoutAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'usdt' | 'vodafone_cash' | 'agent'>('usdt');
  const [accountDetails, setAccountDetails] = useState<string>('');

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const bal = await WalletService.getDiamondsBalance();
    setDiamonds(bal);
  };

  const handleConvert = async () => {
    setLoading(true);
    // محاكاة تفكيك الهدايا المتراكمة
    const res = await WalletService.convertGiftsToDiamonds('gift-3', 5);
    setLoading(false);
    if (res.success) {
      showToast(`تم تفكيك الهدايا بنجاح وإضافة ${res.diamondsEarned} ماسة! 💎`, 'success');
      loadBalance();
    } else {
      showToast(res.error || 'فشل التفكيك', 'error');
    }
  };

  const handleCashoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(cashoutAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }

    setLoading(true);
    const res = await WalletService.requestCashout(amount, paymentMethod, accountDetails);
    setLoading(false);

    if (res.success) {
      showToast('تم تقديم طلب السحب للإدارة/الوكيل بنجاح 💸', 'success');
      setCashoutAmount('');
      setAccountDetails('');
      loadBalance();
    } else {
      showToast(res.error || 'فشل تقديم الطلب', 'error');
    }
  };

  const usdValue = (diamonds / 10000).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 text-slate-900 dark:text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white">
          ← عودة للملف الشخصي
        </button>
        <h1 className="text-sm font-black flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>محفظة الماس والأرباح</span>
        </h1>
      </div>

      {/* Diamonds Card Balance */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-600 via-teal-600 to-indigo-700 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -end-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-xs font-medium text-cyan-100 mb-1">رصيد الماس الحالي</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black">{diamonds.toLocaleString()}</span>
          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">💎 ماسة</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs">
          <span className="text-cyan-100">القيمة التقديرية:</span>
          <span className="font-extrabold text-emerald-300">${usdValue} USD</span>
        </div>
      </div>

      {/* Action: Convert Gifts to Diamonds */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
        <h2 className="text-xs font-extrabold mb-1 flex items-center gap-1.5">
          <ArrowRightLeft className="w-4 h-4 text-brand-500" />
          <span>تفكيك الهدايا المستلمة</span>
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          قم بتحويل الهدايا التي تلقيتها في الغرف والمحادثات إلى ماسات قابلة للسحب.
        </p>
        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 hover:text-brand-600 text-xs font-bold transition flex items-center justify-center gap-1"
        >
          <span>تفكيك الهدايا المتاحة الآن</span>
        </button>
      </div>

      {/* Action: Cashout / Sell Diamonds to Admin or Agent */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xs font-extrabold mb-1 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span>تصريف أو بيع الماسات (للإدارة أو الوكيل)</span>
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          الحد الأدنى لطلب السحب هو 10,000 ماسة.
        </p>

        <form onSubmit={handleCashoutRequest} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">عدد الماسات المراد سحبها</label>
            <input
              type="number"
              placeholder="مثال: 10000"
              value={cashoutAmount}
              onChange={(e) => setCashoutAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">طريقة الاستلام</label>
            <select
              value={paymentMethod}
              onChange={(e: any) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="usdt">حفظ عبر العملات الرقمية (USDT)</option>
              <option value="bank_transfer">تحويل بنكي مباشر</option>
              <option value="vodafone_cash">فودافون كاش / محفظة محلية</option>
              <option value="agent">عبر الوكيل المعتمد</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">تفاصيل الحساب أو رقم المحفظة</label>
            <input
              type="text"
              placeholder="أدخل عنوان المحفظة أو رقم الحساب بدقة..."
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
          >
            تقديم طلب السحب
          </button>
        </form>
      </div>
    </div>
  );
};