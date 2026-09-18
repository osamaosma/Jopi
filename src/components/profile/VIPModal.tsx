import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Crown, Sparkles, HelpCircle, ArrowRight, Coins } from 'lucide-react';

interface VIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVipLevel: number;
  coinBalance: number;
  onRecharge: () => void;
  showToast: (msg: string, type: any) => void;
}

export const VIPModal: React.FC<VIPModalProps> = ({
  isOpen,
  onClose,
  currentVipLevel,
  coinBalance,
  onRecharge,
  showToast
}) => {
  const [selectedVip, setSelectedVip] = useState(Math.max(1, currentVipLevel));
  const [vipTab, setVipTab] = useState<'VIP' | 'SVIP'>('VIP');

  if (!isOpen) return null;

  // تفاصيل مزايا المستويات كما ظهرت في الفيديو
  const vipBenefits: Record<number, string[]> = {
    1: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store', 'More Rooms Followed', 'More Rooms Joined', 'Language Filter'],
    2: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store', 'More Rooms Followed', 'More Rooms Joined', 'Language Filter', 'More nickname changes'],
    3: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store', 'More Rooms Followed', 'More Rooms Joined', 'Language Filter', 'Send lucky bag', 'More Friends Display'],
    5: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store', 'Exclusive Gifts'],
    7: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store', 'Do Not Disturb'],
  };

  const currentBenefits = vipBenefits[selectedVip] || vipBenefits[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-2 sm:p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="relative w-full max-w-md h-[90vh] bg-gradient-to-b from-[#2a241e] via-[#1a1612] to-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-amber-100 border border-amber-500/30"
      >
        
        {/* شريط العنوان العلوي (VIP / SVIP Tab مع أزرار المساعدة والإغلاق) */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-amber-500/20 bg-black/30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setVipTab('VIP')} 
              className={`text-base font-black transition cursor-pointer ${vipTab === 'VIP' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'text-slate-400'}`}
            >
              VIP
            </button>
            <button 
              onClick={() => setVipTab('SVIP')} 
              className={`text-base font-black transition cursor-pointer ${vipTab === 'SVIP' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'text-slate-400'}`}
            >
              SVIP
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => showToast('VIP Rules & Privileges info', 'info')} className="text-slate-400 hover:text-white cursor-pointer"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* محتوى الشاشة القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* بطاقة البروفيسل وشريط التقدم للـ VIP */}
          <div className="relative p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-black/60 border border-amber-500/40 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">✨KįDød✨</h4>
                  <span className="text-[10px] text-amber-400 font-bold">You have already exceeded this level</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-[11px] font-black shadow-md block">
                  Achieved 👑
                </span>
              </div>
            </div>

            {/* شريط مستويات الـ VIP الأفقي (VIP1 إلى VIP16) */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedVip(lvl)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex-shrink-0 ${
                    selectedVip === lvl 
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105' 
                      : 'bg-black/40 text-amber-300/70 hover:bg-amber-500/20'
                  }`}
                >
                  VIP{lvl}
                </button>
              ))}
            </div>

            {/* تفاصيل الخبرة ورفع المستوى عبر الشحن */}
            <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300/70 block">Experience: 431648 / 1636000</span>
                <span className="text-[11px] font-bold text-amber-400">Recharge Coins to level up ⚡</span>
              </div>
              <button 
                onClick={onRecharge}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg cursor-pointer hover:scale-105 transition"
              >
                Recharge 💎
              </button>
            </div>
          </div>

          {/* مزايا المستوى المحدد (VIP Benefits) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                VIP{selectedVip} Benefits ({currentBenefits.length}/17)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {currentBenefits.map((benefit, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-col items-center justify-center text-center gap-2 hover:border-amber-400 transition cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* متجر الـ VIP (VIPStore) وإطارات الـ VIP */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">VIPStore</h3>
              <span className="text-[11px] text-amber-300/70 cursor-pointer hover:text-white flex items-center gap-0.5">View More <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-amber-500/20">
              <span className="text-xs font-bold">My Points 🪙</span>
              <span className="text-xs font-black text-amber-400">7,224</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                <div className="h-24 bg-amber-950/30 rounded-xl flex items-center justify-center text-2xl">🖼️</div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-amber-400">4500 🪙</span>
                  <span className="text-slate-400">3 Day</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                <div className="h-24 bg-amber-950/30 rounded-xl flex items-center justify-center text-2xl">💍</div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-amber-400">50000 🪙</span>
                  <span className="text-slate-400">7 Day</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};