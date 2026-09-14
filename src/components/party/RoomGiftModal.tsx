// ============================================================================
// jopi In-Room Virtual Gift Modal & Sound Effects Bar (Direct In-Room Top-Up Version)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronUp, ChevronDown, 
  Coins, Users, CreditCard, Check 
} from 'lucide-react';
import { Gift } from '../../types';
import { RoomService } from '../../services/roomService';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export interface SugoGiftItem {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  icon: string;
  tag?: string;
  category: 'Backpack' | 'Gift' | 'Lucky' | 'Event' | 'Privilege' | 'Tokens' | 'Interactive' | 'Countries';
}

const CAT_COIN_PACKAGES = [
  { id: 'p1', coins: 32000, oldPrice: 1.11, price: 1 },
  { id: 'p2', coins: 264000, oldPrice: 5.56, price: 5 },
  { id: 'p3', coins: 560000, oldPrice: 11.11, price: 10 },
  { id: 'p4', coins: 1740000, oldPrice: 33.33, price: 30 },
  { id: 'p5', coins: 3040000, oldPrice: 55.56, price: 50 },
  { id: 'p6', coins: 6108000, oldPrice: 111.11, price: 100 },
  { id: 'p7', coins: 18428000, oldPrice: 333.33, price: 300 },
  { id: 'p8', coins: 30556000, oldPrice: 555.56, price: 500 },
  { id: 'p9', coins: 61508000, oldPrice: 1111.11, price: 1000 },
];

const SUGO_ALL_GIFTS: SugoGiftItem[] = [
  // Event
  { id: 'ev-1', name: 'Energy Drink', name_ar: 'مشروب طاقة', price: 40, icon: '🧪', category: 'Event' },
  { id: 'ev-2', name: 'Supply Crate', name_ar: 'صندوق الإمداد', price: 400, icon: '📦', tag: 'NEW', category: 'Event' },
  { id: 'ev-3', name: 'Med Kit', name_ar: 'حقيبة إسعاف', price: 4000, icon: '🎒', tag: 'NEW', category: 'Event' },
  { id: 'ev-4', name: 'Oasis City', name_ar: 'مدينة الواحة', price: 40000, icon: '🏙️', tag: 'NEW', category: 'Event' },
  { id: 'ev-5', name: 'Pan Duel', name_ar: 'مبارزة المقلاة', price: 200000, icon: '🍳', tag: 'NEW', category: 'Event' },
  { id: 'ev-6', name: 'Auroa Steed', name_ar: 'الحصان الأسطوري', price: 2000, icon: '🐎', tag: 'NEW', category: 'Event' },
  { id: 'ev-7', name: 'Royal Dash', name_ar: 'الوثبة الملكية', price: 20000, icon: '🎠', tag: 'NEW', category: 'Event' },
  { id: 'ev-8', name: 'Golden Thunder', name_ar: 'الرعد الذهبي', price: 48000, icon: '⚡', tag: 'NEW', category: 'Event' },

  // Gift
  { id: 'gf-1', name: 'Rose', name_ar: 'وردة', price: 10, icon: '🌹', category: 'Gift' },
  { id: 'gf-2', name: 'Love Heart', name_ar: 'قلب حب', price: 50, icon: '❤️', category: 'Gift' },
  { id: 'gf-3', name: 'Perfume', name_ar: 'عطر فاخر', price: 100, icon: '🧴', category: 'Gift' },
  { id: 'gf-4', name: 'Teddy Bear', name_ar: 'دبدوب لطيف', price: 300, icon: '🧸', category: 'Gift' },
  { id: 'gf-5', name: 'Sports Car', name_ar: 'سيارة رياضية', price: 1500, icon: '🏎️', category: 'Gift' },
  { id: 'gf-6', name: 'Luxury Yacht', name_ar: 'يخت فخم', price: 5000, icon: '🛥️', category: 'Gift' },
  { id: 'gf-7', name: 'Crown', name_ar: 'تاج الملوك', price: 10000, icon: '👑', category: 'Gift' },
  { id: 'gf-8', name: 'Castle', name_ar: 'قصر الأحلام', price: 30000, icon: '🏰', category: 'Gift' },

  // Lucky
  { id: 'lk-1', name: 'Lucky Clover', name_ar: 'نبتة الحظ', price: 20, icon: '🍀', tag: 'HOT', category: 'Lucky' },
  { id: 'lk-2', name: 'Lucky Box', name_ar: 'صندوق الحظ', price: 100, icon: '🎁', tag: 'HOT', category: 'Lucky' },
  { id: 'lk-3', name: 'Magic Lamp', name_ar: 'المصباح السحري', price: 500, icon: '🪔', category: 'Lucky' },
  { id: 'lk-4', name: 'Crystal Ball', name_ar: 'كرة الكريستال', price: 2500, icon: '🔮', category: 'Lucky' },

  // Privilege
  { id: 'pr-1', name: 'Diamond Ring', name_ar: 'خاتم الألماس', price: 500, icon: '💍', category: 'Privilege' },
  { id: 'pr-2', name: 'Private Jet', name_ar: 'طائرة خاصة', price: 25000, icon: '🛩️', category: 'Privilege' },

  // Tokens
  { id: 'tk-1', name: 'Golden Coin', name_ar: 'عملة ذهبية', price: 1, icon: '🪙', category: 'Tokens' },
  { id: 'tk-2', name: 'Star Token', name_ar: 'رمز النجمة', price: 5, icon: '⭐', category: 'Tokens' },

  // Interactive
  { id: 'in-1', name: 'Microphone Ring', name_ar: 'هالة المايك', price: 200, icon: '🎤', category: 'Interactive' },
  { id: 'in-2', name: 'Fireworks', name_ar: 'ألعاب نارية', price: 1200, icon: '🎆', category: 'Interactive' },
  { id: 'in-3', name: 'Rocket Ship', name_ar: 'صاروخ فضائي', price: 8000, icon: '🚀', category: 'Interactive' },

  // Countries
  { id: 'ct-1', name: 'Saudi Falcon', name_ar: 'صقر المملكة', price: 3000, icon: '🦅', category: 'Countries' },
  { id: 'ct-2', name: 'Arabian Horse', name_ar: 'خيل عربي', price: 6000, icon: '🐎', category: 'Countries' },
];

const GIFT_TABS = [
  'Backpack',
  'Gift',
  'Lucky',
  'Event',
  'Privilege',
  'Tokens',
  'Interactive',
  'Countries'
] as const;

export const RoomGiftModal: React.FC = () => {
  const { user } = useAuth();
  const { 
    roomGiftModal, 
    setRoomGiftModal, 
    coinBalance, 
    refreshWallet, 
    showToast 
  } = useApp();
  const { lang } = useLang();

  const [activeTab, setActiveTabState] = useState<typeof GIFT_TABS[number]>('Event');
  const [selectedGift, setSelectedGift] = useState<SugoGiftItem>(SUGO_ALL_GIFTS[1]);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);
  const [multiplierMenuOpen, setMultiplierMenuOpen] = useState(false);
  const [targetType, setTargetType] = useState<'host' | 'all'>('host');
  const [sending, setSending] = useState(false);

  // حالات فتح واجهة شحن العملات المباشرة واختيار الباقة
  const [showTopUpDirect, setShowTopUpDirect] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(CAT_COIN_PACKAGES[0]);
  const [topUpLoading, setTopUpLoading] = useState(false);

  if (!roomGiftModal.isOpen || !roomGiftModal.room || !user) return null;

  const room = roomGiftModal.room;
  const activeSpeakersCount = room.seats ? room.seats.filter((s: any) => s.user_id || s.user).length : 0;
  const targetCount = targetType === 'all' ? Math.max(1, activeSpeakersCount) : 1;
  const totalCost = selectedGift.price * selectedMultiplier * targetCount;

  const handleClose = () => {
    setRoomGiftModal({ isOpen: false, room: null, targetName: '', targetCount: 1 });
  };

  const handleSend = async () => {
    if (coinBalance < totalCost) {
      showToast('رصيدك لا يكفي لإرسال هذه الهدية! ⚠️', 'error');
      return;
    }

    setSending(true);
    const targetLabel = targetType === 'all' 
      ? `جميع المتحدثين على المايك (${targetCount}X)` 
      : `${room.host?.display_name || 'المضيف'}`;

    const genericGift: Gift = {
      id: selectedGift.id,
      name: selectedGift.name,
      name_ar: selectedGift.name_ar,
      coin_price: selectedGift.price,
      icon: selectedGift.icon,
      category: 'special'
    };

    const res = await RoomService.sendRoomGift(
      room.id,
      genericGift,
      user,
      targetLabel,
      targetCount * selectedMultiplier
    );

    setSending(false);

    if (res.success) {
      refreshWallet();
      showToast(`تم إرسال ${selectedGift.name_ar} ${selectedGift.icon} x${selectedMultiplier} إلى ${targetLabel}! 🎉`, 'success');
      handleClose();
    } else {
      showToast('فشل في إرسال الهدية', 'error');
    }
  };

  // تعديل دالة الشراء الفعلي عبر WalletService وتحديث الرصيد فوراً عند النقر داخل الغرفة
  const handleProceedToPayment = async (pkg: typeof CAT_COIN_PACKAGES[0]) => {
    setTopUpLoading(true);
    const result = await WalletService.purchasePackage(pkg.id);
    setTopUpLoading(false);

    if (result.success) {
      refreshWallet();
      showToast(lang === 'ar' ? `تم شحن ${pkg.coins.toLocaleString()} عملة بنجاح! 🪙` : `Successfully topped up ${pkg.coins.toLocaleString()} coins! 🪙`, 'success');
      setShowTopUpDirect(false);
    } else {
      showToast(result.error || (lang === 'ar' ? 'فشل عملية الشحن' : 'Top up failed'), 'error');
    }
  };

  const topUpImageSrc = (lang === 'ar' || lang === 'ur') 
    ? "https://cdn.phototourl.com/free/2026-09-12-7cd6c71e-5d36-4b44-9d2e-2765408cca51.jpg"
    : "https://cdn.phototourl.com/free/2026-09-11-48610cf4-9222-4679-8da9-34d27d0e6772.jpg";

  const filteredGifts = SUGO_ALL_GIFTS.filter(g => g.category === activeTab);

  return (
    <AnimatePresence>
      <div 
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm select-none p-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 150 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 150 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-b from-[#121629] via-[#0d1020] to-[#080a14] rounded-t-[32px] shadow-2xl border-t border-white/15 text-white overflow-hidden flex flex-col max-h-[85vh] relative"
        >
          {/* 1. البانر الإعلاني العلوي */}
          <div className="relative h-20 w-full overflow-hidden bg-gradient-to-r from-amber-700 via-rose-900 to-indigo-950 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                SUGO Event
              </span>
              <h3 className="text-sm font-black text-white mt-1 drop-shadow">اندفاع الإسقاط الجوي</h3>
            </div>
            <button 
              type="button"
              onClick={handleClose}
              className="relative z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2. شريط اختيار المستلم */}
          <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-1.5 text-white/70">
              <span className="text-[11px] font-bold">إرسال إلى:</span>
              <button 
                type="button"
                onClick={() => setTargetType('host')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition cursor-pointer ${targetType === 'host' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-white/10 text-white/80'}`}
              >
                المستضيف 👑
              </button>
              <button 
                type="button"
                onClick={() => setTargetType('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1 cursor-pointer ${targetType === 'all' ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-sm' : 'bg-white/10 text-white/80'}`}
              >
                <Users className="w-3 h-3" />
                <span>كل المايكات ({targetCount}X)</span>
              </button>
            </div>
          </div>

          {/* 3. شريط تبويبات الأقسام */}
          <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-white/10 text-xs font-bold flex-shrink-0">
            {GIFT_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTabState(tab);
                  const firstOfTab = SUGO_ALL_GIFTS.find(g => g.category === tab);
                  if (firstOfTab) setSelectedGift(firstOfTab);
                }}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 4. شبكة الهدايا التفاعلية */}
          <div className="p-3 grid grid-cols-4 gap-2.5 overflow-y-auto max-h-[46vh] scrollbar-thin">
            {filteredGifts.length > 0 ? (
              filteredGifts.map((gift) => {
                const isSelected = selectedGift.id === gift.id;
                return (
                  <div
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={`relative p-2 rounded-2xl border flex flex-col items-center justify-between cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/60 shadow-[0_0_15px_rgba(99,102,241,0.35)] ring-2 ring-indigo-400/40 scale-[1.03]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {gift.tag && (
                      <span className="absolute top-1 start-1 px-1 py-0.2 rounded text-[8px] font-black bg-emerald-500 text-slate-950">
                        {gift.tag}
                      </span>
                    )}

                    <div className="w-11 h-11 my-1 flex items-center justify-center text-3xl filter drop-shadow">
                      {gift.icon}
                    </div>

                    <span className="text-[10px] font-bold text-white/90 truncate w-full text-center">
                      {lang === 'ar' ? gift.name_ar : gift.name}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 mt-1">
                      <Coins className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{gift.price}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 py-12 text-center text-xs text-white/40 font-bold">
                لا توجد عناصر في هذه الفئة حالياً
              </div>
            )}
          </div>

          {/* 5. الشريط السفلي (الرصيد + مضاعفات الإرسال + زر الإرسال) */}
          <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-3 relative flex-shrink-0">
            {/* زر الرصيد: يفتح واجهة شحن القطط فوراً في نفس الغرفة */}
            <div 
              onClick={() => setShowTopUpDirect(true)}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 rounded-full cursor-pointer transition active:scale-95"
            >
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-amber-300">{coinBalance}</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <div className="flex items-center gap-2">
              {/* قائمة المضاعفات */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMultiplierMenuOpen(!multiplierMenuOpen)}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-black text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>{selectedMultiplier}</span>
                  {multiplierMenuOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>

                {multiplierMenuOpen && (
                  <div className="absolute bottom-10 end-0 w-24 bg-slate-900 border border-white/15 rounded-2xl p-1 shadow-2xl z-30 space-y-1">
                    {[1, 10, 66, 99, 520, 1314].map((mult) => (
                      <button
                        key={mult}
                        type="button"
                        onClick={() => {
                          setSelectedMultiplier(mult);
                          setMultiplierMenuOpen(false);
                        }}
                        className={`w-full py-1 text-center rounded-xl text-xs font-black transition cursor-pointer ${selectedMultiplier === mult ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-white/80'}`}
                      >
                        {mult}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* زر الإرسال المباشر */}
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs shadow-lg hover:opacity-95 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              >
                {sending ? 'جارٍ الإرسال...' : 'Send'}
              </button>
            </div>
          </div>

          {/* واجهة الشحن المباشرة داخل الغرفة مع تثبيت اتجاه ltr لترتيب الأرقام والباقات بدقة */}
          <AnimatePresence>
            {showTopUpDirect && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-4"
                onClick={() => setShowTopUpDirect(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  exit={{ scale: 0.9, opacity: 0, y: 30 }} 
                  className="relative w-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* زر الإغلاق للعودة لنافذة الهدايا مباشرة */}
                  <button 
                    onClick={() => setShowTopUpDirect(false)} 
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <img 
                    src={topUpImageSrc} 
                    alt="Jopi Topup" 
                    className="w-full h-auto block pointer-events-none" 
                  />

                  {/* طبقة الباقات التفاعلية مع إجبار الاتجاه LTR لضمان صحة ترتيب الأرقام */}
                  <div dir="ltr" style={{
                    position: 'absolute',
                    top: '23%',
                    left: '5.5%',
                    width: '89%',
                    height: '61.5%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    columnGap: '3%',
                    rowGap: '3%'
                  }}>
                    {CAT_COIN_PACKAGES.map((pkg) => {
                      const isSelected = selectedPkg.id === pkg.id;
                      return (
                        <div 
                          key={pkg.id}
                          onClick={() => setSelectedPkg(pkg)}
                          className={`relative w-full h-full cursor-pointer rounded-[14px] transition-all flex items-center justify-center ${
                            isSelected ? 'bg-white/10 ring-1 ring-white/50 shadow-[inset_0_0_20px_rgba(255,165,0,0.2)]' : 'hover:bg-white/10'
                          }`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-[#ffb82e] to-[#f7931a] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(247,147,26,0.8)] pointer-events-none"
                              >
                                <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={4} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* زر التوجيه والدفع الفعلي */}
                  {selectedPkg && (
                    <div style={{ position: 'absolute', bottom: '4%', left: '5%', width: '90%', zIndex: 20 }}>
                      <button 
                        onClick={() => handleProceedToPayment(selectedPkg)}
                        disabled={topUpLoading}
                        className="w-full py-3.5 rounded-[18px] bg-gradient-to-r from-[#ffb82e] via-[#f7931a] to-[#ffb82e] text-[#2d1b0d] font-black text-[13px] shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>
                          {topUpLoading 
                            ? (lang === 'ar' ? 'جاري الشحن...' : 'Processing...') 
                            : (lang === 'ar' 
                                ? `متابعة الدفع ($${selectedPkg.price} مقابل ${selectedPkg.coins.toLocaleString()} عملة)` 
                                : `Proceed to Pay ($${selectedPkg.price} for ${selectedPkg.coins.toLocaleString()} Coins)`)}
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
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
        <button onClick={onClose} className="text-slate-400 p-0.5 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {soundEffects.map((snd) => (
          <button
            key={snd.id}
            type="button"
            onClick={() => handlePlaySound(snd)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-center transition active:scale-95 flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-xl">{snd.emoji}</span>
            <span className="text-[9px] font-bold text-slate-200">{snd.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};