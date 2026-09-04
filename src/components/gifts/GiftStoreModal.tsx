// ============================================================================
// Jopi Virtual Gift Store Modal (Final Stable Version)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift as GiftIcon, Coins, Sparkles, Plus, Check } from 'lucide-react';
import { Gift } from '../../types';
import { GiftService } from '../../services/giftService';
import { ChatService } from '../../services/chatService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { MOCK_GIFTS } from '../../data/mockData';

export const GiftStoreModal: React.FC = () => {
  const { 
    giftModal, 
    setGiftModal, 
    coinBalance, 
    refreshWallet, 
    setActiveTab, 
    showToast 
  } = useApp();
  const { t, lang } = useLang();

  const [selectedGift, setSelectedGift] = useState<Gift>(MOCK_GIFTS[0]);
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
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm select-none"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <GiftIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm">{t('giftStore')}</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  إلى: {targetUser.display_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{coinBalance}</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gift Grid with controlled ref */}
          <div ref={scrollContainerRef} className="p-4 grid grid-cols-3 gap-3 overflow-y-auto flex-1">
            {MOCK_GIFTS.map((gift) => {
              const isSelected = selectedGift.id === gift.id;

              return (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedGift(gift)}
                  className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-600 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-105 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <span className="text-3xl my-1">{gift.icon}</span>
                  <span className="text-xs font-bold truncate max-w-full">
                    {lang === 'ar' ? gift.name_ar : gift.name}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    <Coins className="w-3 h-3 fill-current" />
                    <span>{gift.coin_price}</span>
                  </div>

                  {isSelected && (
                    <span className="absolute top-2 end-2 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2 flex-shrink-0">
            {coinBalance < selectedGift.coin_price ? (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setActiveTab('wallet');
                }}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>شحن المحفظة بالعملات</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendGift}
                disabled={sending}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
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