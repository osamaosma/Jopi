// ============================================================================
// jopi Swipe Card Component
// Full gesture-driven interactive Tinder card with Framer Motion drag physics
// ============================================================================

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Heart, X, Star, MapPin, CheckCircle2, 
  Info, Sparkles, MessageCircle, Gift as GiftIcon
} from 'lucide-react';
import { User } from '../../types';
import { useLang } from '../../context/LangContext';
import { useApp } from '../../context/AppContext';

interface SwipeCardProps {
  user: User;
  isFront: boolean;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, isFront, onSwipe }) => {
  const { t, lang } = useLang();
  const { setViewingUser, setGiftModal, setActiveConversation, setActiveTab } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photos = user.photos && user.photos.length > 0 ? user.photos : [user.profile_photo];

  // Drag Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotation based on horizontal drag
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  // Opacity stamps based on drag direction
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 90;
    const velocityThreshold = 400;

    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      onSwipe('up');
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  const handlePhotoTap = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (direction === 'next') {
      setActivePhotoIndex(prev => (prev + 1) % photos.length);
    } else {
      setActivePhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotate: isFront ? rotate : 0,
      }}
      drag={isFront ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={isFront ? handleDragEnd : undefined}
      initial={{ scale: isFront ? 1 : 0.95, y: isFront ? 0 : 10 }}
      animate={{ scale: isFront ? 1 : 0.95, y: isFront ? 0 : 10 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 select-none cursor-grab active:cursor-grabbing touch-none border border-slate-700/30"
    >
      {/* Background Image Carousel */}
      <img
        src={photos[activePhotoIndex]}
        alt={user.display_name}
        className="w-full h-full object-cover pointer-events-none"
        loading="eager"
      />

      {/* Top Photo Pagination Bars */}
      {photos.length > 1 && (
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5 pointer-events-none">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx === activePhotoIndex
                  ? 'bg-white shadow-sm'
                  : 'bg-white/30 backdrop-blur-sm'
              }`}
            />
          ))}
        </div>
      )}

      {/* Tap Left / Right Zones to switch photo */}
      <div className="absolute inset-0 z-10 grid grid-cols-2">
        <div
          onClick={(e) => handlePhotoTap(e, 'prev')}
          className="h-full w-full cursor-pointer"
          title="Previous photo"
        />
        <div
          onClick={(e) => handlePhotoTap(e, 'next')}
          className="h-full w-full cursor-pointer"
          title="Next photo"
        />
      </div>

      {/* STAMP BADGES (Like, Nope, Super Like) */}
      {isFront && (
        <>
          {/* LIKE STAMP (Right) */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 start-8 z-30 px-5 py-2 rounded-2xl border-4 border-emerald-400 bg-emerald-500/20 backdrop-blur-md -rotate-12 pointer-events-none shadow-lg shadow-emerald-500/30"
          >
            <span className="text-2xl font-black text-emerald-400 tracking-wider">
              {t('like').toUpperCase()}
            </span>
          </motion.div>

          {/* NOPE STAMP (Left) */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 end-8 z-30 px-5 py-2 rounded-2xl border-4 border-rose-500 bg-rose-500/20 backdrop-blur-md rotate-12 pointer-events-none shadow-lg shadow-rose-500/30"
          >
            <span className="text-2xl font-black text-rose-500 tracking-wider">
              {t('pass').toUpperCase()}
            </span>
          </motion.div>

          {/* SUPER LIKE STAMP (Up) */}
          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute top-1/3 start-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-2xl border-4 border-cyan-400 bg-cyan-500/30 backdrop-blur-md pointer-events-none shadow-lg shadow-cyan-500/40"
          >
            <span className="text-2xl font-black text-cyan-300 tracking-wider">
              {t('superLike').toUpperCase()}
            </span>
          </motion.div>
        </>
      )}

      {/* Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 pointer-events-none" />

      {/* Profile Info Overlay at Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-20 text-white pointer-events-auto">
        {/* Name, Age, Verification & Online */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
              {user.display_name}
            </h2>
            {user.age && (
              <span className="text-2xl font-light text-slate-200">
                {user.age}
              </span>
            )}
            {user.is_verified && (
              <span className="bg-blue-500 text-white rounded-full p-1 shadow-md" title="Verified">
                <CheckCircle2 className="w-4 h-4 fill-blue-500 text-white" />
              </span>
            )}
          </div>

          {/* Info Modal Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewingUser(user);
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-md"
            title="View Full Profile"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{user.city}, {user.country}</span>
          </div>
          {user.distance_km !== undefined && (
            <>
              <span>•</span>
              <span>{user.distance_km} {t('kmAway')}</span>
            </>
          )}
          {user.is_online && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('onlineNow')}
              </span>
            </>
          )}
        </div>

        {/* Bio Snippet */}
        {user.bio && (
          <p className="text-xs text-slate-200 mt-2.5 line-clamp-2 leading-relaxed font-normal">
            {user.bio}
          </p>
        )}

        {/* Interest Tags */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.interests.slice(0, 4).map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 backdrop-blur-md text-white border border-white/10"
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 4 && (
              <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
                +{user.interests.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
