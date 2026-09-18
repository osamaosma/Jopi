import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Crown, Sparkles, HelpCircle } from 'lucide-react';

interface SVIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinBalance: number;
  onRecharge: () => void;
  showToast: (msg: string, type: any) => void;
}

export const SVIPModal: React.FC<SVIPModalProps> = ({
  isOpen,
  onClose,
  coinBalance,
  onRecharge,
  showToast
}) => {
  // تم تعديل القيمة الافتراضية هنا لتصبح 'VIP' لكي يفتح قسم الـ VIP أولاً
  const [mainTab, setMainTab] = useState<'VIP' | 'SVIP'>('VIP');

  // المستويات الفرعية لكل قسم على حدة
  const [selectedVipLevel, setSelectedVipLevel] = useState(1);
  const [selectedSvipLevel, setSelectedSvipLevel] = useState(1);

  if (!isOpen) return null;

  // مزايا مستويات الـ VIP التقليدية
  const vipBenefitsData: Record<number, string[]> = {
    1: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effect', 'Room Background', 'Points Store'],
    2: ['VIP Label', 'Who viewed me', 'More Following', 'Create chat room', 'Exclusive Frame', 'Exclusive Badge', 'More nickname changes'],
    3: ['VIP Label', 'Who viewed me', 'More Following', 'Send lucky bag', 'More Friends Display'],
    7: ['VIP Label', 'Who viewed me', 'Exclusive Gifts', 'Do Not Disturb', 'Exclusive Frame', 'Exclusive Badge']
  };

  // مزايا مستويات الـ SVIP الفاخرة
  const svipBenefitsData: Record<number, string[]> = {
    1: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'SVIP mini Card', 'Exclusive Customer Service', 'Privilege Gifts', 'Points Store', 'Birthday Gift Pack'],
    2: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'SVIP mini Card', 'Renewal Pack', 'Room Bullet Comments'],
    3: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'Points Store', 'Anniversary Gift'],
    4: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'Level-up Pack'],
    5: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'On-mic Effects'],
    6: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'Customized Title'],
    7: ['SVIP Logo', 'Exclusive Frame', 'Exclusive Badge', 'Entry Effects', 'Exclusive Vehicles', 'Room Bubble', 'Customized Gift Design', 'Broadcast Gift Privilege']
  };

  const activeBenefits = mainTab === 'VIP' 
    ? (vipBenefitsData[selectedVipLevel] || vipBenefitsData[1])
    : (svipBenefitsData[selectedSvipLevel] || svipBenefitsData[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-2 sm:p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="relative w-full max-w-md h-[92vh] bg-gradient-to-b from-[#1c1c14] via-[#0f0e0a] to-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-yellow-100 border border-yellow-500/30"
      >
        
        {/* شريط العنوان العلوي */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-yellow-500/20 bg-black/40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMainTab('VIP')} 
              className={`text-base font-black transition cursor-pointer ${mainTab === 'VIP' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : 'text-slate-400'}`}
            >
              VIP
            </button>
            <button 
              onClick={() => setMainTab('SVIP')} 
              className={`text-base font-black transition cursor-pointer ${mainTab === 'SVIP' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-0.5' : 'text-slate-400'}`}
            >
              SVIP
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => showToast(`${mainTab} Rules info`, 'info')} className="text-slate-400 hover:text-white cursor-pointer"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* محتوى الشاشة القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* محتوى قسم VIP */}
          {mainTab === 'VIP' && (
            <div className="relative p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-black/60 border border-amber-500/40 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">✨KįDød✨</h4>
                    <span className="text-[10px] text-amber-400 font-bold">VIP Level Privileges</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-[11px] font-black shadow-md">
                  VIP {selectedVipLevel} 👑
                </span>
              </div>

              {/* شريط مستويات الـ VIP */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedVipLevel(lvl)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex-shrink-0 ${
                      selectedVipLevel === lvl 
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105' 
                        : 'bg-black/40 text-amber-300/70 hover:bg-amber-500/20'
                    }`}
                  >
                    VIP{lvl}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400">Upgrade VIP status via recharge ⚡</span>
                <button onClick={onRecharge} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg cursor-pointer">Recharge 💎</button>
              </div>
            </div>
          )}

          {/* محتوى قسم SVIP */}
          {mainTab === 'SVIP' && (
            <div className="relative p-5 rounded-3xl bg-gradient-to-r from-[#2c2618] via-[#1f1a10] to-black border border-yellow-500/50 shadow-2xl overflow-hidden text-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-400">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">✨KįDød✨</h4>
                    <span className="text-[9px] text-yellow-400/80">Experience: 302248 / 850000</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-600/30 text-yellow-400 border border-yellow-500/40 text-[10px] font-black">
                  Locked 🔒
                </span>
              </div>

              <div className="relative w-32 h-28 mx-auto my-2 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                <span className="text-6xl">🐅</span>
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md border border-white">
                  SVIP {selectedSvipLevel}
                </div>
              </div>

              <span className="text-[11px] text-yellow-200/70 block mb-3 font-semibold">
                Recharge 547752 Coins to SVIP{selectedSvipLevel} ⚡
              </span>

              <button onClick={onRecharge} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 text-xs font-black shadow-lg cursor-pointer">
                Recharge 💎
              </button>

              {/* شريط مستويات الـ SVIP */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pt-4 mt-3 border-t border-yellow-500/20 no-scrollbar">
                {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedSvipLevel(lvl)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex-shrink-0 ${
                      selectedSvipLevel === lvl 
                        ? 'bg-yellow-500 text-slate-950 shadow-md scale-105' 
                        : 'bg-black/50 text-yellow-300/60 hover:bg-yellow-500/20'
                    }`}
                  >
                    SVIP{lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* عرض مزايا القسم النشط */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 text-center">
              {mainTab === 'VIP' ? `VIP${selectedVipLevel}` : `SVIP${selectedSvipLevel}`} Benefits
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {activeBenefits.map((benefit, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-col items-center justify-center text-center gap-2 hover:border-amber-400 transition cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* متجر النقاط */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">{mainTab} Store</h3>
              <span className="text-[11px] text-amber-300/70 cursor-pointer hover:text-white flex items-center gap-0.5">View More <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-amber-500/20">
              <span className="text-xs font-bold">My Points 🪙</span>
              <span className="text-xs font-black text-amber-400">7,224</span>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};