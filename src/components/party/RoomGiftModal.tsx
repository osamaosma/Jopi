// ============================================================================
// MingleUp In-Room Virtual Gift Modal & Sound Effects Bar
// Interactive gifting to Host, specific Mic seats, or All Mics (8X) with animations
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift as GiftIcon, Coins, Sparkles, Check, Users } from 'lucide-react';
import { Gift, VoiceRoom } from '../../types';
import { RoomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { MOCK_GIFTS } from '../../data/mockData';

export const RoomGiftModal: React.FC = () => {
  const { user } = useAuth();
  const { 
    roomGiftModal, 
    setRoomGiftModal, 
    coinBalance, 
    refreshWallet, 
    setActiveTab, 
    showToast 
  } = useApp();
  const { t, lang } = useLang();

  const [selectedGift, setSelectedGift] = useState<Gift>(MOCK_GIFTS[1]); // Rose default
  const [targetType, setTargetType] = useState<'host' | 'all' | 'custom'>('host');
  const [sending, setSending] = useState(false);

  if (!roomGiftModal.isOpen || !roomGiftModal.room || !user) return null;

  const room = roomGiftModal.room;
  const activeSpeakersCount = room.seats ? room.seats.filter(s => s.user).length : 0;
  const targetCount = targetType === 'all' ? Math.max(1, activeSpeakersCount) : 1;
  const totalCost = selectedGift.coin_price * targetCount;

  const handleSend = async () => {
    if (coinBalance < totalCost) {
      showToast(t('insufficientCoins'), 'error');
      return;
    }

    setSending(true);
    const targetLabel = targetType === 'all' 
      ? `جميع المتحدثين على المايك (${targetCount}X)` 
      : `${room.host?.display_name || 'المضيف'} (المضيف)`;

    const res = await RoomService.sendRoomGift(
      room.id,
      selectedGift,
      user,
      targetLabel,
      targetCount
    );

    setSending(false);

    if (res.success) {
      refreshWallet();
      showToast(`تم إرسال ${selectedGift.name_ar} ${selectedGift.icon} إلى ${targetLabel}! 🎉✨`, 'success');
      setRoomGiftModal({ isOpen: false, room: null, targetName: '', targetCount: 1 });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <GiftIcon className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-sm">هدايا الغرفة المباشرة</h2>
            </div>

            {/* Coin Balance */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{coinBalance}</span>
              </div>
              <button
                onClick={() => setRoomGiftModal({ isOpen: false, room: null, targetName: '', targetCount: 1 })}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Target Selector (Host vs All Mics) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTargetType('host')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                targetType === 'host'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>👑 للمضيف</span>
              <span className="text-[10px] opacity-80">({room.host?.display_name?.split(' ')[0] || 'المضيف'})</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('all')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                targetType === 'all'
                  ? 'bg-gradient-to-r from-rose-600 to-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>لكل المايكات ({targetCount}X)</span>
            </button>
          </div>

          {/* Gift Grid */}
          <div className="p-4 grid grid-cols-3 gap-3">
            {MOCK_GIFTS.map((gift) => {
              const isSelected = selectedGift.id === gift.id;
              const cost = gift.coin_price * targetCount;
              const canAfford = coinBalance >= cost;

              return (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => setSelectedGift(gift)}
                  className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'border-brand-600 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-105 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <span className="text-3xl my-1 animate-float">
                    {gift.icon}
                  </span>
                  <span className="text-xs font-bold truncate max-w-full">
                    {lang === 'ar' ? gift.name_ar : gift.name}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                    <Coins className="w-3 h-3 fill-current" />
                    <span>{cost}</span>
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

          {/* Footer Submit */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
            {coinBalance < totalCost ? (
              <button
                onClick={() => {
                  setRoomGiftModal({ isOpen: false, room: null, targetName: '', targetCount: 1 });
                  setActiveTab('wallet');
                }}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg"
              >
                شحن رصيد المحفظة بالعملات
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 text-white font-black text-xs shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>إرسال {selectedGift.name_ar} ({totalCost} عملة)</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SoundEffectsBar: React.FC<{ roomId: string; user: any; onClose: () => void }> = ({ roomId, user, onClose }) => {
  const soundEffects = [
    { id: 'applause', label: 'تصفيق', emoji: '👏', text: '👏 أرسل تصفيقاً حاراً للمسرح!' },
    { id: 'laugh', label: 'ضحك', emoji: '😂', text: '😂 يضحك بصوت عالٍ!' },
    { id: 'cheer', label: 'تشجيع', emoji: '🎉', text: '🎉 يشجع المسرح بالحماس!' },
    { id: 'drum', label: 'طبل', emoji: '🥁', text: '🥁 يدق طبول الحماس!' },
    { id: 'fanfare', label: 'موسيقى', emoji: '🎺', text: '🎺 عزف مقطعاً موسيقياً مميزاً!' },
  ];

  const handlePlaySound = (sound: any) => {
    RoomService.sendRoomMessage(roomId, sound.text, user, 'game');
    onClose();
  };

  return (
    <div className="absolute bottom-20 start-4 end-4 z-40 p-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-300">المؤثرات الصوتية الفورية 🔊</span>
        <button onClick={onClose} className="text-slate-400 p-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {soundEffects.map((snd) => (
          <button
            key={snd.id}
            onClick={() => handlePlaySound(snd)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-center transition active:scale-95 flex flex-col items-center gap-1"
          >
            <span className="text-xl">{snd.emoji}</span>
            <span className="text-[9px] font-bold text-slate-200">{snd.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};