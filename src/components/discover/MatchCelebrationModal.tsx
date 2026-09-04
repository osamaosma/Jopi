// ============================================================================
// MingleUp Match Celebration Modal
// Fullscreen celebratory popup with confetti, meeting avatars, and direct chat action
// ============================================================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, MessageCircle, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { ChatService } from '../../services/chatService';

export const MatchCelebrationModal: React.FC = () => {
  const { 
    matchCelebration, 
    setMatchCelebration, 
    setActiveConversation, 
    setActiveTab 
  } = useApp();
  const { user: currentUser } = useAuth();
  const { t } = useLang();

  const matchedUser = matchCelebration.matchedUser;

  // Trigger confetti burst on open
  useEffect(() => {
    if (matchCelebration.isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']
        });
      } catch (e) {
        console.log('Confetti triggered');
      }
    }
  }, [matchCelebration.isOpen]);

  if (!matchCelebration.isOpen || !matchedUser) return null;

  const handleStartChat = () => {
    // Find or create conversation
    const convs = ChatService.getConversations();
    const existing = convs.find(c => c.partner.id === matchedUser.id);
    
    setMatchCelebration({ isOpen: false, matchedUser: null });
    
    if (existing) {
      setActiveConversation(existing);
    } else {
      setActiveConversation({
        id: `conv-${matchedUser.id}`,
        partner: matchedUser,
        unread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setActiveTab('messages');
  };

  const handleClose = () => {
    setMatchCelebration({ isOpen: false, matchedUser: null });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl text-white select-none">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 end-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-sm text-center flex flex-col items-center"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-500/30 to-rose-500/30 border border-brand-400/40 text-brand-300 text-xs font-bold mb-4 shadow-lg">
            <Sparkles className="w-4 h-4 fill-brand-400" />
            <span>تطابق متبادل استثنائي!</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-brand-300 via-rose-300 to-amber-300 bg-clip-text text-transparent drop-shadow-md">
            It's a Match!
          </h1>
          <p className="text-sm text-slate-300 mt-2 font-medium">
            {t('matchSubtitle', { name: matchedUser.display_name })}
          </p>

          {/* Avatars Meeting Centerpiece */}
          <div className="relative my-8 flex items-center justify-center">
            {/* Left Avatar (Current User) */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: -20, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-brand-500/40 z-10"
            >
              <img
                src={currentUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                alt={currentUser?.display_name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Glowing Heart Junction */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="absolute z-20 w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/50 border-2 border-white"
            >
              <Heart className="w-6 h-6 text-white fill-white animate-bounce" />
            </motion.div>

            {/* Right Avatar (Matched User) */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 20, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-rose-500/40 z-10"
            >
              <img
                src={matchedUser.profile_photo}
                alt={matchedUser.display_name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3 mt-4">
            <button
              onClick={handleStartChat}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 hover:opacity-95 text-white font-black text-base shadow-2xl shadow-rose-500/40 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>{t('startChatting')}</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-sm transition active:scale-98"
            >
              {t('keepDiscovering')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
