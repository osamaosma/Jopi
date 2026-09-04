// ============================================================================
// MingleUp Other User Profile Detail Modal
// Fullscreen view with photo gallery, bio, interests, languages, and action dock
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Star, MessageCircle, Gift as GiftIcon, 
  MapPin, CheckCircle2, Briefcase, Ban, ShieldAlert, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { MatchService } from '../../services/matchService';

export const OtherUserProfileModal: React.FC = () => {
  const { 
    viewingUser, 
    setViewingUser, 
    setMatchCelebration, 
    setGiftModal, 
    setReportModal,
    setActiveConversation, 
    setActiveTab, 
    showToast 
  } = useApp();
  const { t, isRTL } = useLang();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!viewingUser) return null;

  const photos = viewingUser.photos && viewingUser.photos.length > 0 
    ? viewingUser.photos 
    : [viewingUser.profile_photo];

  const handleLike = async (isSuper = false) => {
    const res = await MatchService.swipeRight(viewingUser.id, isSuper);
    setViewingUser(null);

    if (res.isMatch) {
      setMatchCelebration({ isOpen: true, matchedUser: viewingUser });
    } else {
      showToast(isSuper ? `⭐ أرسلت سوبر لايك إلى ${viewingUser.display_name}!` : `❤️ أبديت إعجابك بـ ${viewingUser.display_name}`, 'success');
    }
  };

  const handleStartChat = () => {
    setViewingUser(null);
    setActiveConversation({
      id: `conv-${viewingUser.id}`,
      partner: viewingUser,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActiveTab('messages');
  };

  const handleSendGift = () => {
    setGiftModal({
      isOpen: true,
      targetUser: viewingUser,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md h-full sm:h-[92vh] sm:rounded-3xl bg-slate-900 text-white flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* Top Floating Controls */}
          <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setViewingUser(null)}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReportModal({ isOpen: true, targetUser: viewingUser })}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-amber-400 hover:bg-black/70 transition active:scale-95"
                title={t('reportUser')}
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  MatchService.swipeLeft(viewingUser.id);
                  setViewingUser(null);
                  showToast(`تم حظر ${viewingUser.display_name}`, 'info');
                }}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-rose-400 hover:bg-black/70 transition active:scale-95"
                title={t('blockUser')}
              >
                <Ban className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Profile Body */}
          <div className="flex-1 overflow-y-auto pb-24">
            {/* Main Photo Gallery */}
            <div className="relative w-full h-[400px] bg-slate-950">
              <img
                src={photos[activePhotoIdx]}
                alt={viewingUser.display_name}
                className="w-full h-full object-cover"
              />

              {/* Photo Pagination Dots */}
              {photos.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-20">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activePhotoIdx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Left / Right Photo Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev - 1 + photos.length) % photos.length)}
                    className="absolute start-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev + 1) % photos.length)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="p-6 space-y-5">
              {/* Header Details */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black">{viewingUser.display_name}</h2>
                  {viewingUser.age && (
                    <span className="text-2xl font-light text-slate-300">
                      {viewingUser.age}
                    </span>
                  )}
                  {viewingUser.is_verified && (
                    <span className="bg-blue-500 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4 fill-blue-500 text-white" />
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black">
                    VIP {viewingUser.vip_level || 5}
                  </span>
                </div>

                {/* Custom User ID Pill */}
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 border border-slate-700">
                    <span className="text-brand-400 font-sans font-black">ID:</span>
                    <span>{viewingUser.custom_id || viewingUser.id.substring(0, 8)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{viewingUser.city}, {viewingUser.country}</span>
                  </div>
                  {viewingUser.distance_km !== undefined && (
                    <>
                      <span>•</span>
                      <span>{viewingUser.distance_km} {t('kmAway')}</span>
                    </>
                  )}
                  {viewingUser.is_online && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{t('onlineNow')}</span>
                    </>
                  )}
                </div>

                {viewingUser.job_title && (
                  <div className="flex items-center gap-1 text-xs text-slate-300 mt-2 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                    <span>{viewingUser.job_title} {viewingUser.company ? `لدى ${viewingUser.company}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {viewingUser.bio && (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                  <h3 className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {t('aboutMe')}
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {viewingUser.bio}
                  </p>
                </div>
              )}

              {/* Interests */}
              {viewingUser.interests && viewingUser.interests.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    {t('myInterests')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingUser.interests.map((int, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-950/60 text-brand-300 border border-brand-800/50"
                      >
                        {int}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {viewingUser.languages && viewingUser.languages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    {t('myLanguages')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingUser.languages.map((lng, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {lng}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Dock at Bottom */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex items-center justify-around z-30">
            {/* Super Like */}
            <button
              onClick={() => handleLike(true)}
              className="p-3.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition"
              title={t('superLike')}
            >
              <Star className="w-5 h-5 fill-white" />
            </button>

            {/* Like */}
            <button
              onClick={() => handleLike(false)}
              className="p-4 rounded-full bg-gradient-to-tr from-rose-500 to-brand-500 text-white shadow-2xl shadow-rose-500/40 hover:scale-110 active:scale-95 transition"
              title={t('like')}
            >
              <Heart className="w-6 h-6 fill-white" />
            </button>

            {/* Direct Message */}
            <button
              onClick={handleStartChat}
              className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-brand-400 shadow-lg hover:scale-110 active:scale-95 transition"
              title={t('directMessage')}
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* Send Gift */}
            <button
              onClick={handleSendGift}
              className="p-3.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-300 border border-purple-500/40 shadow-lg hover:scale-110 active:scale-95 transition"
              title={t('sendGift')}
            >
              <GiftIcon className="w-5 h-5" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
