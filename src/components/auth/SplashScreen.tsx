// ============================================================================
// MingleUp Splash Screen
// Branded launch animation with smooth auto-transition & tap-to-skip
// ============================================================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { useLang } from '../../context/LangContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { t } = useLang();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-brand-950 to-slate-950 text-white overflow-hidden select-none cursor-pointer"
    >
      {/* Background Animated Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-96 h-96 bg-brand-600/30 rounded-full blur-3xl -top-20 -start-20 pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute w-96 h-96 bg-rose-600/30 rounded-full blur-3xl -bottom-20 -end-20 pointer-events-none"
      />

      {/* Main Branded Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, duration: 0.6 }}
        className="relative"
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-400 p-1 shadow-2xl shadow-brand-500/50 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
            <Sparkles className="w-14 h-14 text-white fill-brand-400 animate-pulse" />
          </div>
        </div>

        {/* Floating Heart */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -end-3 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/50"
        >
          <Heart className="w-4 h-4 text-white fill-white" />
        </motion.div>
      </motion.div>

      {/* Title & Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mt-6 z-10 px-4"
      >
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-brand-200 to-rose-300 bg-clip-text text-transparent">
          MingleUp
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">
          {t('tagline')}
        </p>
      </motion.div>

      {/* Modern Loader Dots */}
      <div className="flex items-center gap-2 mt-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-rose-400 shadow-sm shadow-brand-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <span className="text-[10px] text-slate-500 mt-4">انقر في أي مكان للدخول السريع ➔</span>
    </div>
  );
};
