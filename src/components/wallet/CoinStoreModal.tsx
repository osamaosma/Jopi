// ============================================================================
// jopi Coin Store Modal (Sugo/Bigo Exact Golden Design Version)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coins, Crown } from 'lucide-react';
import { WalletService } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface CoinPackageItem {
  id: string;
  coins: number;
  priceUsd: number;
  originalUsd?: number;
  isChest?: boolean;
}

const COIN_PACKAGES: CoinPackageItem[] = [
  { id: 'p1', coins: 32000, priceUsd: 1, originalUsd: 1.11, isChest: false },
  { id: 'p2', coins: 264000, priceUsd: 5, originalUsd: 5.56, isChest: false },
  { id: 'p3', coins: 560000, priceUsd: 10, originalUsd: 11.11, isChest: false },
  { id: 'p4', coins: 1740000, priceUsd: 30, originalUsd: 33.33, isChest: false },
  { id: 'p5', coins: 3040000, priceUsd: 50, originalUsd: 55.56, isChest: false },
  { id: 'p6', coins: 6108000, priceUsd: 100, originalUsd: 111.11, isChest: false },
  { id: 'p7', coins: 18428000, priceUsd: 300, originalUsd: 333.33, isChest: true },
  { id: 'p8', coins: 30556000, priceUsd: 500, originalUsd: 555.56, isChest: true },
  { id: 'p9', coins: 61508000, priceUsd: 1000, originalUsd: 1111.11, isChest: true },
];

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast, refreshWallet } = useApp();
  const { lang } = useLang();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (pkg: CoinPackageItem) => {
    setLoadingId(pkg.id);
    const result = await WalletService.purchasePackage(pkg.id);
    setLoadingId(null);

    if (result.success) {
      showToast(lang === 'ar' ? `تم شراء ${pkg.coins.toLocaleString()} عملة بنجاح! 🪙` : `Successfully purchased ${pkg.coins.toLocaleString()} coins! 🪙`, 'success');
      refreshWallet();
      if (onSuccess) onSuccess();
      onClose();
    } else {
      showToast(result.error || (lang === 'ar' ? 'فشل عملية الشحن' : 'Top up failed'), 'error');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-gradient-to-b from-amber-950 via-slate-950 to-black rounded-[32px] p-5 shadow-2xl border-2 border-amber-500/40 text-white relative max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* Decorative Cats Header Area */}
          <div className="relative flex items-center justify-between pb-4 mb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-wide text-amber-300">
                  {lang === 'ar' ? 'متجر عملات Jopi' : 'Jopi Coin Store'}
                </h2>
                <p className="text-[10px] text-amber-200/70">
                  {lang === 'ar' ? 'شحن آمن الفور للعملات والماس' : 'Secure and instant coin top-up'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-300 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid of Packages - استخدام dir="ltr" لضمان ثبات ترتيب الأرقام والعملات بشكل صحيح تماماً باللغتين */}
          <div dir="ltr" className="grid grid-cols-3 gap-3">
            {COIN_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePurchase(pkg)}
                className="relative bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 rounded-2xl p-3 text-slate-900 flex flex-col items-center justify-between shadow-xl border border-amber-300 cursor-pointer overflow-hidden group"
              >
                {/* 10% Discount Badge */}
                <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5 z-10">
                  <span>10%</span>
                  <span>❤</span>
                </div>

                {/* Sparkling Icons / Coin Graphic */}
                <div className="my-2 relative flex items-center justify-center">
                  <span className="absolute -top-2 -left-2 text-amber-500 text-xs animate-ping">✨</span>
                  <span className="absolute -bottom-1 -right-2 text-amber-500 text-xs">✨</span>
                  {pkg.isChest ? (
                    <div className="text-3xl filter drop-shadow-md">🪙🎁</div>
                  ) : (
                    <div className="text-3xl filter drop-shadow-md">🪙🪙</div>
                  )}
                </div>

                {/* Coin Count */}
                <div className="text-center font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                  {pkg.coins.toLocaleString()}
                </div>

                {/* Pricing Area */}
                <div className="w-full mt-2 text-center">
                  {pkg.originalUsd && (
                    <div className="text-[10px] text-rose-600 font-bold line-through">
                      USD {pkg.originalUsd}
                    </div>
                  )}
                  <div className="mt-1 w-full py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-black text-xs shadow-md border border-amber-400">
                    {loadingId === pkg.id ? '...' : `USD ${pkg.priceUsd}`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 text-center text-[10px] text-amber-200/50">
            {lang === 'ar' ? 'جميع المعاملات مشفرة وآمنة تماماً عبر نظام Jopi المعتمد.' : 'All transactions are secure and encrypted.'}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};