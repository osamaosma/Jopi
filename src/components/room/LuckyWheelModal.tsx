import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Trophy } from 'lucide-react';
import { User, VoiceRoom } from '../../types';
import { GameService, WHEEL_SECTORS, WheelReward } from '../../services/gameService';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  room: VoiceRoom;
  onBalanceUpdated?: (newBalance: number) => void;
}

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  room
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWon, setLastWon] = useState<WheelReward | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);

  if (!isOpen) return null;

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLastWon(null);

    const result = await GameService.playSpin(currentUser, betAmount, room.id);

    if (!result.success) {
      alert(result.error === 'INSUFFICIENT_COINS' ? 'رصيدك غير كافٍ!' : 'حدث خطأ، حاول ثانية');
      setIsSpinning(false);
      return;
    }

    // حساب زاوية التوقف الخاصة بالقطاع الفائز
    const sectorCount = WHEEL_SECTORS.length;
    const sectorAngle = 360 / sectorCount;
    const targetAngle = 360 - (result.prize.id * sectorAngle) - (sectorAngle / 2);
    
    // عدد دورات إضافية لضمان شكل حركة الدوران
    const finalRotation = rotation + (360 * 5) + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setLastWon(result.prize);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 rounded-t-[32px] sm:rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            عجلة الحظ (Lucky Spin)
          </h3>
          <p className="text-[11px] text-purple-300/80">اربح حتى 50 ضعف قيمة رهانك!</p>
        </div>

        {/* إطار ومؤشر العجلة */}
        <div className="relative w-56 h-56 mx-auto my-3 flex items-center justify-center">
          {/* مؤشر التوقف العلوي */}
          <div className="absolute -top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* قرص العجلة */}
          <motion.div 
            animate={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.15, 0.9, 0.2, 1] }}
            className="w-full h-full rounded-full border-4 border-amber-400/80 relative overflow-hidden shadow-[0_0_25px_rgba(217,70,239,0.35)]"
            style={{
              background: `conic-gradient(
                #3b82f6 0deg 45deg, 
                #10b981 45deg 90deg, 
                #f59e0b 90deg 135deg, 
                #8b5cf6 135deg 180deg, 
                #ec4899 180deg 225deg, 
                #e11d48 225deg 270deg, 
                #fbbf24 270deg 315deg, 
                #64748b 315deg 360deg
              )`
            }}
          >
            {WHEEL_SECTORS.map((s, idx) => {
              const angle = (360 / WHEEL_SECTORS.length) * idx + (360 / WHEEL_SECTORS.length) / 2;
              return (
                <div
                  key={s.id}
                  className="absolute w-full h-full flex justify-center text-[10px] font-black text-white drop-shadow pt-2"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span>{s.multiplier}</span>
                </div>
              );
            })}
          </motion.div>

          {/* الزر الدائري في مركز العجلة */}
          <div className="absolute w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 shadow-md flex items-center justify-center z-10">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* نتيجة الجولة */}
        <div className="h-6 text-center my-1">
          {lastWon && !isSpinning && (
            <p className="text-xs font-bold text-amber-300 animate-bounce">
              {lastWon.value > 0 ? `مبروك! ربحت ${lastWon.value} كوينز 🎁` : 'حظ أوفر في المرة القادمة!'}
            </p>
          )}
        </div>

        {/* اختيار قيمة الرهان */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[50, 100, 500, 1000].map((val) => (
            <button
              key={val}
              disabled={isSpinning}
              onClick={() => setBetAmount(val)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                betAmount === val 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' 
                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        {/* زر التدوير */}
        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white font-black text-sm shadow-lg hover:opacity-90 active:scale-98 transition disabled:opacity-50"
        >
          {isSpinning ? 'جارٍ السحب...' : `تدوير الآن (${betAmount} عملة)`}
        </button>
      </motion.div>
    </div>
  );
};