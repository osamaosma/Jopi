import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, HelpCircle, Shield, Sparkles, Check, Coins } from 'lucide-react';

interface AristocracyModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinBalance: number;
  showToast: (msg: string, type: any) => void;
  onSuccessActive: (tierName: string, cost: number) => void;
}

export const AristocracyModal: React.FC<AristocracyModalProps> = ({
  isOpen,
  onClose,
  coinBalance,
  showToast,
  onSuccessActive
}) => {
  const [activeTier, setActiveTier] = useState<'Knight' | 'Viscount' | 'Count' | 'Marquis' | 'Duke' | 'King'>('Knight');
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'7' | '30' | '90'>('7');

  if (!isOpen) return null;

  // بيانات الرتب والأسعار والامتيازات كما في الفيديو
  const tiersData = {
    Knight: {
      name: 'Knight',
      privilegesCount: '7/20',
      color: 'from-emerald-600 to-teal-500',
      badgeIcon: '🛡️',
      prices: { '7': 1960, '30': 8400, '90': 25200 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: false },
        { title: 'Exclusive Gifts', unlocked: false },
        { title: 'Incognito Access', unlocked: false },
      ]
    },
    Viscount: {
      name: 'Viscount',
      privilegesCount: '10/20',
      color: 'from-blue-600 to-cyan-500',
      badgeIcon: '⚔️',
      prices: { '7': 5600, '30': 24000, '90': 72000 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: true },
        { title: 'Exclusive Gifts', unlocked: true },
        { title: 'Incognito Access', unlocked: true },
        { title: 'Online Invisibility', unlocked: false },
      ]
    },
    Count: {
      name: 'Count',
      privilegesCount: '11/20',
      color: 'from-indigo-600 to-blue-500',
      badgeIcon: '💎',
      prices: { '7': 21000, '30': 90000, '90': 270000 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: true },
        { title: 'Exclusive Gifts', unlocked: true },
        { title: 'Incognito Access', unlocked: true },
        { title: 'Online Invisibility', unlocked: true },
        { title: 'Room Bubble', unlocked: false },
      ]
    },
    Marquis: {
      name: 'Marquis',
      privilegesCount: '14/20',
      color: 'from-purple-600 to-pink-500',
      badgeIcon: '👑',
      prices: { '7': 70000, '30': 300000, '90': 900000 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: true },
        { title: 'Exclusive Gifts', unlocked: true },
        { title: 'Incognito Access', unlocked: true },
        { title: 'Online Invisibility', unlocked: true },
        { title: 'Room Bubble', unlocked: true },
        { title: 'Full-room Access', unlocked: true },
        { title: 'Hide Distance', unlocked: true },
      ]
    },
    Duke: {
      name: 'Duke',
      privilegesCount: '16/20',
      color: 'from-rose-600 to-amber-500',
      badgeIcon: '🦅',
      prices: { '7': 175000, '30': 750000, '90': 2250000 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: true },
        { title: 'Exclusive Gifts', unlocked: true },
        { title: 'Incognito Access', unlocked: true },
        { title: 'Online Invisibility', unlocked: true },
        { title: 'Room Bubble', unlocked: true },
        { title: 'Full-room Access', unlocked: true },
        { title: 'Hide Distance', unlocked: true },
        { title: 'Stealth Mode', unlocked: true },
        { title: 'Invisible Entry', unlocked: true },
      ]
    },
    King: {
      name: 'King',
      privilegesCount: '20/20',
      color: 'from-amber-500 via-yellow-400 to-amber-600',
      badgeIcon: '🦁',
      prices: { '7': 455000, '30': 1950000, '90': 5850000 },
      privileges: [
        { title: 'Exclusive Label', unlocked: true },
        { title: 'Aristocrat Badge', unlocked: true },
        { title: 'Aristocrat Frame', unlocked: true },
        { title: 'Entry Effect', unlocked: true },
        { title: 'Aristocrat Vehicle', unlocked: true },
        { title: 'Room Lock', unlocked: true },
        { title: 'Advanced Filter', unlocked: true },
        { title: 'Aristocrat Name Card', unlocked: true },
        { title: 'Exclusive Gifts', unlocked: true },
        { title: 'Incognito Access', unlocked: true },
        { title: 'Online Invisibility', unlocked: true },
        { title: 'Room Bubble', unlocked: true },
        { title: 'Full-room Access', unlocked: true },
        { title: 'Hide Distance', unlocked: true },
        { title: 'Stealth Mode', unlocked: true },
        { title: 'Invisible Entry', unlocked: true },
        { title: 'Golden Name', unlocked: true },
        { title: 'Animated Nickname', unlocked: true },
        { title: 'Anti-banning', unlocked: true },
        { title: 'Kick Protection', unlocked: true },
      ]
    }
  };

  const currentTierData = tiersData[activeTier];
  const currentCost = currentTierData.prices[selectedDuration];

  const handleActivateConfirm = () => {
    if (coinBalance < currentCost) {
      showToast('رصيد العملات غير كافٍ لإتمام التفعيل! 🪙', 'error');
      return;
    }
    onSuccessActive(activeTier, currentCost);
    setShowDurationModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-2 sm:p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="relative w-full max-w-md h-[92vh] bg-gradient-to-b from-[#1e1c18] via-[#12100d] to-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-amber-100 border border-amber-500/30"
      >
        
        {/* شريط العنوان العلوي والتبويبات (Knight, Viscount, Count, Marquis, Duke, King) */}
        <div className="px-4 py-3 border-b border-amber-500/20 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {(['Knight', 'Viscount', 'Count', 'Marquis', 'Duke', 'King'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`text-xs font-black transition cursor-pointer flex-shrink-0 px-2.5 py-1 rounded-full ${
                  activeTier === tier 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => showToast('Aristocracy Rules & Info', 'info')} className="text-slate-400 hover:text-white cursor-pointer"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* محتوى الشاشة القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* شعار الرتبة الفاخر بالاعلى */}
          <div className="text-center space-y-2 py-4">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center text-6xl filter drop-shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-bounce-subtle">
              <span>{currentTierData.badgeIcon}</span>
            </div>
            <h2 className="text-base font-black tracking-widest text-amber-400 uppercase">{currentTierData.name}</h2>
          </div>

          {/* شريط الامتيازات الحصرية Exclusive Privileges */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xs font-black text-amber-300/80 tracking-wider">
                👑 Exclusive Privileges {currentTierData.privilegesCount} 👑
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {currentTierData.privileges.map((priv, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition ${
                    priv.unlocked 
                      ? 'bg-black/40 border-amber-500/30 text-amber-200' 
                      : 'bg-black/20 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${priv.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'}`}>
                    {priv.unlocked ? '⭐' : '🔒'}
                  </div>
                  <span className="text-[10px] font-bold leading-tight">{priv.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* الشريط السفلي الثابت للتفعيل والأسعار */}
        <div className="p-4 bg-black/70 backdrop-blur-md border-t border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
            <Coins className="w-4 h-4 fill-amber-400" />
            <span>{currentTierData.prices['7'].toLocaleString()} Coins / 7 days</span>
          </div>

          <button 
            onClick={() => setShowDurationModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            Activate
          </button>
        </div>

        {/* نافذة اختيار مدة التفعيل (7 days, 30 days, 90 days) مطابقة للفيديو */}
        <AnimatePresence>
          {showDurationModal && (
            <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm select-none">
              <div className="absolute inset-0" onClick={() => setShowDurationModal(false)} />
              <motion.div 
                initial={{ y: '100%' }} 
                animate={{ y: 0 }} 
                exit={{ y: '100%' }} 
                className="relative z-10 w-full bg-[#181613] rounded-t-[32px] border-t border-amber-500/40 p-6 space-y-5 shadow-2xl"
              >
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

                <div className="text-center">
                  <span className="text-3xl block mb-1">{currentTierData.badgeIcon}</span>
                  <h3 className="text-sm font-black text-white">Activate {currentTierData.name} Aristocracy</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  
                  {/* خيار 7 أيام */}
                  <div 
                    onClick={() => setSelectedDuration('7')}
                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      selectedDuration === '7' ? 'border-amber-400 bg-amber-500/15' : 'border-slate-800 bg-black/40'
                    }`}
                  >
                    {selectedDuration === '7' && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">✓</span>}
                    <span className="text-xs font-bold text-slate-300">7 days</span>
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1"><Coins className="w-3 h-3 fill-amber-400" /> {currentTierData.prices['7'].toLocaleString()}</span>
                  </div>

                  {/* خيار 30 يوم */}
                  <div 
                    onClick={() => setSelectedDuration('30')}
                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      selectedDuration === '30' ? 'border-amber-400 bg-amber-500/15' : 'border-slate-800 bg-black/40'
                    }`}
                  >
                    {selectedDuration === '30' && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">✓</span>}
                    <span className="text-xs font-bold text-slate-300">30 days</span>
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1"><Coins className="w-3 h-3 fill-amber-400" /> {currentTierData.prices['30'].toLocaleString()}</span>
                  </div>

                  {/* خيار 90 يوم */}
                  <div 
                    onClick={() => setSelectedDuration('90')}
                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                      selectedDuration === '90' ? 'border-amber-400 bg-amber-500/15' : 'border-slate-800 bg-black/40'
                    }`}
                  >
                    {selectedDuration === '90' && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">✓</span>}
                    <span className="text-xs font-bold text-slate-300">90 days</span>
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1"><Coins className="w-3 h-3 fill-amber-400" /> {currentTierData.prices['90'].toLocaleString()}</span>
                  </div>

                </div>

                <button 
                  onClick={handleActivateConfirm}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-xl active:scale-95 transition cursor-pointer"
                >
                  Activate
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};