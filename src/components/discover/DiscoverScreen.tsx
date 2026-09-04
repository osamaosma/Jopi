// ============================================================================
// MingleUp Main Discover Screen
// Swipe card deck, action controls (Pass, Like, Super Like, Gift, Undo), and empty state
// ============================================================================

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, Heart, Star, RotateCcw, Sparkles, 
  Gift as GiftIcon, SlidersHorizontal, RefreshCw, MessageSquare
} from 'lucide-react';
import { User } from '../../types';
import { UserService } from '../../services/userService';
import { MatchService } from '../../services/matchService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { SwipeCard } from './SwipeCard';

export const DiscoverScreen: React.FC = () => {
  const { 
    filters, 
    deckRefreshKey, 
    setMatchCelebration, 
    setGiftModal, 
    setFilterModalOpen, 
    resetFilters,
    showToast,
    setActiveConversation,
    setActiveTab,
  } = useApp();
  const { t } = useLang();

  const [cards, setCards] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load discoverable cards
  useEffect(() => {
    setLoading(true);
    const users = UserService.getDiscoverableUsers(filters);
    setCards(users);
    setLoading(false);
  }, [filters, deckRefreshKey]);

  const activeCard = cards[0];

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (!activeCard) return;
    const targetUser = activeCard;

    // Remove from top of deck immediately for snappy responsiveness
    setCards(prev => prev.slice(1));

    if (direction === 'left') {
      MatchService.swipeLeft(targetUser.id);
      showToast(`تم تخطي ${targetUser.display_name}`, 'info');
    } else if (direction === 'right' || direction === 'up') {
      const isSuper = direction === 'up';
      const result = await MatchService.swipeRight(targetUser.id, isSuper);

      if (result.isMatch) {
        setMatchCelebration({
          isOpen: true,
          matchedUser: targetUser,
        });
      } else {
        showToast(
          isSuper 
            ? `⭐ أرسلت سوبر لايك إلى ${targetUser.display_name}!` 
            : `❤️ أبديت إعجابك بـ ${targetUser.display_name}`,
          'success'
        );
      }
    }
  };

  const handleUndo = () => {
    const restoredUser = MatchService.undoLastPass();
    if (restoredUser) {
      setCards(prev => [restoredUser, ...prev]);
      showToast(`تمت استعادة بطاقة ${restoredUser.display_name}`, 'info');
    } else {
      showToast('لا توجد بطاقات سابقة للتراجع عنها', 'warning');
    }
  };

  const handleDirectMessage = () => {
    if (!activeCard) return;
    setActiveConversation({
      id: `conv-${activeCard.id}`,
      partner: activeCard,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActiveTab('messages');
  };

  const handleQuickGift = () => {
    if (!activeCard) return;
    setGiftModal({
      isOpen: true,
      targetUser: activeCard,
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between px-3 pt-2 pb-3">
      {/* Cards Deck Container */}
      <div className="relative w-full flex-1 min-h-[460px] max-h-[580px]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
            <span className="text-xs">جاري تجهيز أفضل المطابقات...</span>
          </div>
        ) : cards.length > 0 ? (
          <div className="relative w-full h-full">
            {/* Render top 3 cards in stack for depth effect */}
            {cards.slice(0, 3).reverse().map((user, idx, arr) => {
              const isFront = idx === arr.length - 1;
              return (
                <SwipeCard
                  key={user.id}
                  user={user}
                  isFront={isFront}
                  onSwipe={handleSwipe}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center shadow-xl select-none"
          >
            <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {t('noMoreCards')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-6">
              {t('noMoreCardsSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>تعديل الفلاتر</span>
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
              >
                {t('resetFilters')}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Swipe Action Dock */}
      {cards.length > 0 && (
        <div className="flex items-center justify-center gap-3 pt-3 px-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 shadow-md hover:scale-110 active:scale-95 transition flex items-center justify-center"
            title={t('undoSwipe')}
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Pass Button (Swipe Left) */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20 hover:scale-110 active:scale-95 transition flex items-center justify-center"
            title={t('pass')}
          >
            <X className="w-7 h-7 stroke-[3]" />
          </button>

          {/* Super Like Button (Swipe Up) */}
          <button
            onClick={() => handleSwipe('up')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-110 active:scale-95 transition flex items-center justify-center"
            title={t('superLike')}
          >
            <Star className="w-6 h-6 fill-white" />
          </button>

          {/* Like Button (Swipe Right) */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-brand-500 text-white shadow-xl shadow-rose-500/30 hover:scale-110 active:scale-95 transition flex items-center justify-center"
            title={t('like')}
          >
            <Heart className="w-7 h-7 fill-white" />
          </button>

          {/* Quick Gift Button */}
          <button
            onClick={handleQuickGift}
            className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 text-purple-500 shadow-md hover:scale-110 active:scale-95 transition flex items-center justify-center"
            title={t('sendGift')}
          >
            <GiftIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
