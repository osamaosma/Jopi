import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Trophy, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

interface MyLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: any) => void;
}

export const MyLevelModal: React.FC<MyLevelModalProps> = ({ isOpen, onClose, showToast }) => {
  const [levelTab, setLevelTab] = useState<'Wealth' | 'Charm'>('Wealth');
  const [showRules, setShowRules] = useState(false);

  if (!isOpen) return null;

  // مستويات الثروة (Wealth Level) مطابقة للفيديو
  const wealthLevels = [
    { level: 1, title: 'Wealth Level 1', desc: 'Wealth level label\nPriority display in room online list', unlocked: true },
    { level: 4, title: 'Wealth Level 4', desc: 'Unlock exclusive gifts', unlocked: true },
    { level: 7, title: 'Wealth Level 7', desc: 'Public upgrade announcement in chat room', unlocked: true },
    { level: 10, title: 'Wealth Level 10', desc: 'Get entry effect', unlocked: true },
    { level: 13, title: 'Wealth Level 13', desc: 'Unlock exclusive gifts\nGet avatar frame', unlocked: false },
    { level: 17, title: 'Wealth Level 17', desc: 'Unlock exclusive gifts', unlocked: false },
    { level: 20, title: 'Wealth Level 20', desc: 'Get entry effect', unlocked: false },
    { level: 23, title: 'Wealth Level 23', desc: 'Get avatar frame', unlocked: false },
    { level: 26, title: 'Wealth Level 26', desc: 'Unlock exclusive gifts', unlocked: false },
    { level: 30, title: 'Wealth Level 30', desc: 'Get vehicle', unlocked: false },
    { level: 35, title: 'Wealth Level 35', desc: 'Exclusive customer service\nGet avatar frame', unlocked: false },
    { level: 40, title: 'Wealth Level 40', desc: 'Get vehicle', unlocked: false },
    { level: 50, title: 'Wealth Level 50', desc: 'Get vehicle', unlocked: false },
  ];

  // مستويات الجاذبية (Charm Level) مطابقة للفيديو
  const charmLevels = [
    { level: 1, title: 'Charm level 1', desc: 'Unlock Badges Levels', unlocked: true },
    { level: 5, title: 'Charm level 5', desc: 'Unlock Badges Levels', unlocked: false },
    { level: 8, title: 'Charm level 8', desc: 'Unlock Badges Levels', unlocked: false },
    { level: 10, title: 'Charm level 10', desc: 'Unlock Badges Levels', unlocked: false },
    { level: 12, title: 'Charm level 12', desc: 'Unlock Badges Levels', unlocked: false },
  ];

  const currentList = levelTab === 'Wealth' ? wealthLevels : charmLevels;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-2 sm:p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.9, opacity: 0 }} 
        className="relative w-full max-w-md h-[92vh] bg-gradient-to-b from-[#1b1730] via-[#100d20] to-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col text-purple-100 border border-purple-500/30"
      >
        
        {/* شريط العنوان العلوي والتبويبات */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-purple-500/20 bg-black/40">
          <div className="flex items-center gap-4 bg-black/50 p-1 rounded-full border border-purple-500/20">
            <button 
              onClick={() => setLevelTab('Wealth')} 
              className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${levelTab === 'Wealth' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Wealth Level
            </button>
            <button 
              onClick={() => setLevelTab('Charm')} 
              className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${levelTab === 'Charm' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Charm Level
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowRules(true)} className="text-slate-400 hover:text-white cursor-pointer"><HelpCircle className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* محتوى الشاشة القابل للتمرير */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* بطاقة الشعار والمستوى العلوي */}
          <div className="relative p-5 rounded-3xl bg-gradient-to-b from-purple-950/60 via-indigo-950/30 to-black/60 border border-purple-500/40 shadow-xl text-center space-y-3">
            
            {/* شارة المستوى المضيئة */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              <span className="text-6xl">💎</span>
              <div className="absolute -bottom-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                16
              </div>
            </div>

            {/* تفاصيل المستوى الحالي والتقدم */}
            <div className="flex items-center justify-between text-xs font-black px-2 text-purple-300">
              <span>Lv.16</span>
              <span className="text-purple-400">Lv.17</span>
            </div>

            {/* شريط التقدم */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-purple-500/20">
              <div className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 h-full w-[85%]" />
            </div>

            <span className="text-[11px] text-slate-400 font-semibold block">
              Wealth Points: 499165 / 525000
            </span>
          </div>

          {/* قائمة المزايا المراد فتحها (Upgrade to unlock privileges) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
              Upgrade to unlock privileges (5/13)
            </h3>

            <div className="space-y-2.5">
              {currentList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${item.unlocked ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 text-slate-600 border border-slate-800'}`}>
                      {item.unlocked ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : <Lock className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 whitespace-pre-line mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* نافذة القوانين والتعليمات (Rules Modal) */}
        <AnimatePresence>
          {showRules && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-slate-900 rounded-3xl border border-purple-500/40 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white">Rules</h3>
                  <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <h4 className="font-bold text-purple-400">Charm Levels Introduction</h4>
                  <p>Charm Level is a measure of how popular you are on the platform, displaying the Charm Level logo on your profile page and name card, and upgrading your Charm Level will also allow more users to follow you.</p>
                  <h4 className="font-bold text-purple-400 pt-2">Upgrading Rules</h4>
                  <p>For every Diamonds you receive, your Charm Level will be increase by(+1).</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};