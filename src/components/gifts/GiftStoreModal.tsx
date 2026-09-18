// ============================================================================
// Jopi Virtual Gift Store Modal (Final Stable Version - Cat Theme Coin Topup)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift as GiftIcon, Coins, Sparkles, Plus, Check, CreditCard } from 'lucide-react';
import { Gift } from '../../types';
import { GiftService } from '../../services/giftService';
import { ChatService } from '../../services/chatService';
import { RelationshipService } from '../../services/relationshipService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_GIFTS } from '../../data/mockData';

// باقات العملات الذهبية المستوحاة من تصميم القطط الفاخر والكميات المطلوبة
const COIN_PACKAGES = [
  { id: 'pkg-1', coins: 32000, oldPrice: 1.11, price: 1 },
  { id: 'pkg-2', coins: 264000, oldPrice: 5.56, price: 5 },
  { id: 'pkg-3', coins: 560000, oldPrice: 11.11, price: 10 },
  { id: 'pkg-4', coins: 1740000, oldPrice: 33.33, price: 30 },
  { id: 'pkg-5', coins: 3040000, oldPrice: 55.56, price: 50 },
  { id: 'pkg-6', coins: 6108000, oldPrice: 111.11, price: 100 },
  { id: 'pkg-7', coins: 18428000, oldPrice: 333.33, price: 300 },
  { id: 'pkg-8', coins: 30556000, oldPrice: 555.56, price: 500 },
  { id: 'pkg-9', coins: 61508000, oldPrice: 1111.11, price: 1000 },
];

export const GiftStoreModal: React.FC = () => {
  const { 
    giftModal, 
    setGiftModal, 
    coinBalance, 
    refreshWallet, 
    setActiveTab, 
    showToast 
  } = useApp();
  const { user: currentUser } = useAuth();
  const { t, lang } = useLang();

  const [selectedGift, setSelectedGift] = useState<Gift>(MOCK_GIFTS[0]);
  const [selectedPkg, setSelectedPkg] = useState(COIN_PACKAGES[0]);
  const [sending, setSending] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // إعادة التمرير للأعلى فور فتح النافذة لحل مشكلة النزول للأسفل تلقائياً
  useEffect(() => {
    if (giftModal.isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [giftModal.isOpen]);

  if (!giftModal.isOpen || !giftModal.targetUser) return null;

  const targetUser = giftModal.targetUser;

  const handleClose = () => {
    setGiftModal({ isOpen: false, targetUser: null });
  };

  const handleSendGift = async () => {
    if (coinBalance < selectedGift.coin_price) {
      showToast(t('insufficientCoins'), 'error');
      return;
    }

    setSending(true);
    const result = await GiftService.sendGift(
      targetUser.id,
      selectedGift.id,
      giftModal.conversationId
    );

    setSending(false);

    if (result.success) {
      refreshWallet();

      // ترقية نقاط الألفة والمستوى وتحقيق أمنيات الإناث فور إرسال الهدية
      if (currentUser) {
        RelationshipService.addGiftIntimacyPoints(currentUser.id, targetUser.id, selectedGift);
      }

      if (giftModal.conversationId) {
        try {
          ChatService.sendMessage({
            conversationId: giftModal.conversationId,
            receiverId: targetUser.id,
            messageType: 'gift',
            giftData: selectedGift,
            text: `أرسل لك هدية: ${selectedGift.name_ar} ${selectedGift.icon}`,
          });

          ChatService.triggerSimulatedReply(
            giftModal.conversationId,
            targetUser.id,
            'gift'
          );
        } catch (err) {
          console.error('Chat message gift integration error:', err);
        }
      }

      showToast(`تم إرسال ${selectedGift.name_ar} بنجاح إلى ${targetUser.display_name}! 🎁✨`, 'success');
      handleClose();
    } else {
      showToast('حدث خطأ أثناء إرسال الهدية', 'error');
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md select-none p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-lg bg-gradient-to-b from-amber-50 via-orange-50/40 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-t-[36px] sm:rounded-3xl shadow-2xl border border-amber-200/60 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس Modal مع ترويسة القطط الذهبية الفاخرة */}
          <div className="relative pt-6 pb-3 px-6 bg-gradient-to-r from-amber-200/60 via-orange-200/40 to-amber-100/60 dark:from-slate-800/80 dark:to-slate-900 border-b border-amber-200/40 dark:border-slate-800 flex flex-col items-center flex-shrink-0">
            {/* رسومات القطط التزيينية في الأعلى */}
            <div className="absolute -top-5 left-6 text-3xl filter drop-shadow-md">🐱🐾</div>
            <div className="absolute -top-5 right-6 text-3xl filter drop-shadow-md">🐾😺</div>
            
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-md">
                  <Coins className="w-5 h-5 fill-amber-200" />
                </div>
                <div>
                  <h2 className="font-black text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                    شحن رصيد العملات الفاخر
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    إرسال إلى: <span className="text-amber-600 dark:text-amber-400 font-bold">{targetUser.display_name}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black">
                  <Coins className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
                  <span>{coinBalance}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* محتوى الباقات والأقسام (شبكة الـ 9 باقات الذهبية للقطط) */}
          <div ref={scrollContainerRef} className="p-4 grid grid-cols-3 gap-3 overflow-y-auto flex-1 bg-gradient-to-b from-transparent via-amber-50/20 to-transparent dark:via-transparent">
            {COIN_PACKAGES.map((pkg) => {
              const isSelected = selectedPkg.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-gradient-to-b from-amber-100/80 to-orange-100/60 dark:from-amber-950/60 dark:to-amber-900/40 shadow-xl ring-2 ring-amber-400/50 scale-102'
                      : 'border-amber-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 hover:border-amber-400'
                  }`}
                >
                  {/* شارة الخصم 10% الوردية */}
                  <span className="absolute -top-2.5 -end-1.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border border-white dark:border-slate-900 flex items-center gap-0.5">
                    10% 💖
                  </span>

                  {/* أيقونة أكوام العملات الذهبية */}
                  <div className="w-12 h-12 my-1 flex items-center justify-center text-3xl filter drop-shadow-md animate-bounce-subtle">
                    🪙✨
                  </div>

                  {/* كمية العملات */}
                  <div className="text-xs font-black text-slate-900 dark:text-white tracking-tight mt-1 text-center font-mono">
                    {pkg.coins.toLocaleString()}
                  </div>

                  {/* الأسعار (القديم المشطوب والجديد البارز) */}
                  <div className="w-full mt-2 text-center">
                    <div className="text-[10px] text-slate-400 line-through font-mono">
                      USD ${pkg.oldPrice.toFixed(2)}
                    </div>
                    <div className="w-full py-1.5 px-2 mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black shadow-sm font-mono text-center">
                      USD ${pkg.price}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="absolute top-2 start-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* قسم الهدية المختارة للإرسال السريع */}
          <div className="px-4 py-2 bg-amber-100/50 dark:bg-slate-800/80 border-t border-amber-200/50 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedGift.icon}</span>
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  الهدية المختارة: {lang === 'ar' ? selectedGift.name_ar : selectedGift.name}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold font-mono">
                  {selectedGift.coin_price} عملة
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">أو اشترِ الباقة المحددة أعلاه 👆</span>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 flex-shrink-0">
            {coinBalance < selectedGift.coin_price ? (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setActiveTab('wallet');
                }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>إتمام شحن باقة ${selectedPkg.price} ({selectedPkg.coins.toLocaleString()} عملة)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendGift}
                disabled={sending}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>إرسال {lang === 'ar' ? selectedGift.name_ar : selectedGift.name} ({selectedGift.coin_price} عملة)</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};