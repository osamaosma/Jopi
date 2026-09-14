import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Rocket, Flame, TrendingUp, AlertOctagon } from 'lucide-react';
import { User, VoiceRoom } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { RoomService } from '../../services/roomService';

interface RocketGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  room: VoiceRoom;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const RocketGameModal: React.FC<RocketGameModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  room,
  onToast
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);

  const crashPointRef = useRef<number>(2.00);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // بدء إقلاع الصاروخ
  const handleLaunch = async () => {
    if (gameState === 'flying') return;

    try {
      // 1. خصم قيمة الرهان من السيرفر
      const { data, error } = await supabase.rpc('place_rocket_bet', {
        p_user_id: currentUser.id,
        p_bet_amount: betAmount
      });

      if (error || (data && !data.success)) {
        onToast(data?.error === 'INSUFFICIENT_COINS' ? 'رصيدك غير كافٍ!' : 'فشل بدء الجولة', 'error');
        return;
      }

      // 2. حساب نقطة الانفجار عشوائياً (معادلة رياضية)
      const rand = Math.random();
      let calculatedCrash = 1.05;
      if (rand > 0.05) {
        calculatedCrash = Number((0.95 / (1 - rand)).toFixed(2));
      }
      crashPointRef.current = Math.min(calculatedCrash, 50.00); // الحد الأقصى 50x

      // 3. إعادة تعيين العداد وبدء الرحلة
      setGameState('flying');
      setMultiplier(1.00);
      setHasCashedOut(false);

      const startTime = Date.now();
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentMulti = Number((1.00 + Math.pow(elapsed * 0.45, 1.6)).toFixed(2));

        if (currentMulti >= crashPointRef.current) {
          clearInterval(intervalRef.current);
          setMultiplier(crashPointRef.current);
          setGameState('crashed');
        } else {
          setMultiplier(currentMulti);
        }
      }, 50);

    } catch (err) {
      onToast('حدث خطأ بالاتصال', 'error');
    }
  };

  // زر السحب النقدي قبل الانفجار (Cash Out)
  const handleCashOut = async () => {
    if (gameState !== 'flying' || hasCashedOut) return;

    const winMultiplier = multiplier;
    setHasCashedOut(true);

    const winReward = Math.floor(betAmount * winMultiplier);

    try {
      await supabase.rpc('cash_out_rocket', {
        p_user_id: currentUser.id,
        p_reward_amount: winReward
      });

      onToast(`كفو! سحبت بنجاح على مضاعف ${winMultiplier}x وربحت ${winReward} كوينز 🚀`, 'success');

      // إشعار شات الغرفة إذا كان الربح كبيراً
      if (winMultiplier >= 3.0) {
        RoomService.sendRoomMessage(
          room.id,
          `🚀 انطلق الصاروخ! نجح ${currentUser.display_name} في السحب عند ${winMultiplier}x وربح ${winReward} كوينز!`,
          currentUser,
          'game'
        ).catch(() => {});
      }
    } catch {
      onToast('فشل تحصيل الأرباح', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-cyan-500/30 rounded-t-[32px] sm:rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl relative overflow-hidden"
      >
        {/* زر الإغلاق */}
        <button 
          onClick={onClose} 
          disabled={gameState === 'flying' && !hasCashedOut}
          className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ترويسة اللعبة */}
        <div className="text-center mb-3">
          <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 flex items-center justify-center gap-1.5">
            <Rocket className="w-5 h-5 text-cyan-400" />
            صاروخ الحظ (Rocket Crash)
          </h3>
          <p className="text-[10px] text-cyan-300/80">اسحب أرباحك قبل أن ينفجر الصاروخ!</p>
        </div>

        {/* ساحة انطلاق الصاروخ */}
        <div className="relative h-48 w-full bg-slate-950/80 rounded-2xl border border-cyan-500/20 my-2 overflow-hidden flex flex-col items-center justify-center">
          {/* خطوط الخلفية الفضائية */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          {/* عداد المضاعف الحالي */}
          <div className="relative z-10 text-center">
            <span className={`text-4xl font-black font-mono tracking-tight drop-shadow-lg ${
              gameState === 'crashed' 
                ? 'text-rose-500 animate-pulse' 
                : hasCashedOut 
                ? 'text-emerald-400' 
                : 'text-amber-400'
            }`}>
              {multiplier.toFixed(2)}x
            </span>

            {gameState === 'crashed' && (
              <p className="text-xs font-bold text-rose-400 mt-1 flex items-center justify-center gap-1">
                <AlertOctagon className="w-4 h-4" /> انفجر الصاروخ!
              </p>
            )}

            {hasCashedOut && (
              <p className="text-xs font-bold text-emerald-400 mt-1">
                تم السحب بأمان! (+{Math.floor(betAmount * multiplier)} عملة)
              </p>
            )}
          </div>

          {/* حركة مجسم الصاروخ */}
          <div className="absolute bottom-4 left-4 z-10 transition-all duration-300">
            {gameState === 'flying' && (
              <motion.div 
                animate={{ 
                  x: [0, 140, 160], 
                  y: [0, -70, -90],
                  rotate: [45, 50, 45]
                }}
                transition={{ duration: 6, ease: "linear" }}
                className="relative"
              >
                <Rocket className="w-10 h-10 text-cyan-400 fill-cyan-500/30 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                <Flame className="w-5 h-5 text-amber-500 absolute -bottom-2 -left-2 rotate-45 animate-bounce" />
              </motion.div>
            )}

            {gameState === 'crashed' && (
              <div className="text-3xl animate-ping">💥</div>
            )}
          </div>
        </div>

        {/* تحديد قيمة الرهان */}
        <div className="flex items-center justify-center gap-2 mb-3 mt-1">
          {[50, 100, 250, 500].map((val) => (
            <button
              key={val}
              disabled={gameState === 'flying'}
              onClick={() => setBetAmount(val)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                betAmount === val 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md' 
                  : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        {/* أزرار التحكم: إطلاق أو سحب */}
        {gameState !== 'flying' ? (
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-black text-sm shadow-lg hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5 fill-current" />
            إطلاق الصاروخ ({betAmount} عملة)
          </button>
        ) : (
          <button
            onClick={handleCashOut}
            disabled={hasCashedOut}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2 ${
              hasCashedOut 
                ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:scale-[1.02] active:scale-98 animate-pulse'
            }`}
          >
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            {hasCashedOut 
              ? 'تم تأمين الأرباح' 
              : `سحب نقدي الآن (+${Math.floor(betAmount * multiplier)} عملة)`
            }
          </button>
        )}
      </motion.div>
    </div>
  );
};