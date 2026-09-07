// ============================================================================
// jopi Diamonds Withdrawal & Cashout Modal (Sugo-Style Host Earnings)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, DollarSign, Wallet, ShieldCheck, ArrowRightLeft } from 'lucide-react';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiamonds: number;
  onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  currentDiamonds,
  onSuccess,
}) => {
  const { showToast } = useApp();
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'usdt' | 'bank_transfer' | 'vodafone_cash' | 'agent'>('usdt');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const numericAmount = parseInt(amount) || 0;
  const estimatedUsd = (numericAmount / 10000).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      showToast('يرجى إدخال مبلغ صحيح من الماسات', 'error');
      return;
    }
    if (numericAmount < 10000) {
      showToast('الحد الأدنى لطلب السحب هو 10,000 ماسة', 'error');
      return;
    }
    if (numericAmount > currentDiamonds) {
      showToast('رصيد الماسات غير كافٍ', 'error');
      return;
    }
    if (!details.trim()) {
      showToast('يرجى إدخال تفاصيل حساب الاستلام بدقة', 'error');
      return;
    }

    setLoading(true);
    const result = await WalletService.requestCashout(numericAmount, method, details);
    setLoading(false);

    if (result.success) {
      showToast('تم تقديم طلب السحب بنجاح للمراجعة 💎', 'success');
      onSuccess();
      onClose();
    } else {
      showToast(result.error || 'فشل تقديم الطلب', 'error');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black">تصريف وسحب الأرباح</h3>
                <p className="text-[10px] text-slate-400">تحويل الماسات المستلمة إلى أرباح حقيقية</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Info */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-cyan-100 block">الرصيد المتاح للسحب</span>
              <span className="text-xl font-black">{currentDiamonds.toLocaleString()} ماسة</span>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-cyan-100 block">القيمة بالدولار</span>
              <span className="text-sm font-extrabold text-emerald-300">${(currentDiamonds / 10000).toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-500 mb-1">عدد الماسات المراد سحبها</label>
              <input
                type="number"
                placeholder="الحد الأدنى 10,000 ماسة"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
              />
              {numericAmount > 0 && (
                <span className="block text-[10px] text-emerald-500 mt-1 font-semibold">
                  المبلغ المستحق: ${estimatedUsd} USD
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1">طريقة الاستلام</label>
              <select
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
              >
                <option value="usdt">عملات رقمية (USDT TRC20)</option>
                <option value="bank_transfer">تحويل بنكي دولي</option>
                <option value="vodafone_cash">محفظة محلية (فودافون كاش / موبايل)</option>
                <option value="agent">وكيل الاعتماد الرسمي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1">تفاصيل الحساب أو عنوان المحفظة</label>
              <input
                type="text"
                placeholder="أدخل رقم الحساب، عنوان المحفظة، أو كود الوكيل..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'جاري إرسال الطلب...' : 'تأكيد وتقديم طلب السحب'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};