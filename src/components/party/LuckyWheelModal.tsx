// ============================================================================
// Sugo-Style Lucky Wheel & VIP Fortune Spinner
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, Coins, RotateCw } from 'lucide-react';
import { SugoService, WHEEL_REWARDS } from '../../services/sugoService';
import { useApp } from '../../context/AppContext';
import { LuckyWheelReward } from '../../types/sugo';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({ isOpen, onClose }) => {
  const { coinBalance, refreshWallet, showToast } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<LuckyWheelReward | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    if (coinBalance < 50) {
      showToast('رصيد العملات غير كافٍ! اشحن 50 عملة لتدوير العجلة 🪙', 'warning');
      return;
    }

    setSpinning(true);
    setWonReward(null);

    const result = SugoService.spinLuckyWheel();
    if (!result.success || !result.reward) {
      showToast(result.error || 'حدث خطأ', 'error');
      setSpinning(false);
      return;
    }

    const extraTurns = 1800 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraTurns;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setWonReward(result.reward!);
      refreshWallet();
      showToast(`مبروك! فزت بـ: ${result.reward!.name_ar} 🎉`, 'success');
    }, 3500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border border-purple-500/40 rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-amber-300">عجلة الحظ الملكية</h2>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <p className="text-[11px] text-purple-200 mb-4">جرب حظك واربح هدايا فاخرة وعملات وعضويات VIP!</p>

          <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
            <div className="absolute -top-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-amber-400 drop-shadow-md" />

            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 3.5, ease: [0.15, 0.9, 0.2, 1] }}
              className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(234,179,8,0.3)] bg-gradient-to-tr from-purple-900 via-indigo-800 to-pink-900 relative overflow-hidden flex items-center justify-center"
            >
              <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-3 gap-2 opacity-90">
                {WHEEL_REWARDS.map((rew, i) => (
                  <div key={i} className="flex flex-col items-center justify-center text-[10px] font-bold text-amber-200">
                    <span className="text-xl">{rew.icon}</span>
                    <span>{rew.name_ar}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 border-2 border-white shadow-xl flex flex-col items-center justify-center active:scale-90 transition disabled:opacity-75"
            >
              <RotateCw className={`w-5 h-5 text-slate-950 ${spinning ? 'animate-spin' : ''}`} />
              <span className="text-[9px] font-black text-slate-950">50 🪙</span>
            </button>
          </div>

          {wonReward && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 bg-amber-400/20 border border-amber-400/40 rounded-2xl mb-4"
            >
              <span className="text-xs font-black text-amber-300">🎉 مبروك! حصلت على: {wonReward.name_ar}</span>
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>رصيدك: <strong className="text-amber-400">{coinBalance}</strong> عملة</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};