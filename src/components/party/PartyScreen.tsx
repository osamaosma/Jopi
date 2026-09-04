// ============================================================================
// MingleUp Voice & Video Party Rooms Explorer (Sugo-Style)
// Live room categories, audio equalizer cards, audience counters & create room trigger
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, Plus, Users, Sparkles, Video, Mic, 
  Flame, Music, Gamepad2, Heart, Smile, Search 
} from 'lucide-react';
import { VoiceRoom, RoomCategory } from '../../types';
import { RoomService } from '../../services/roomService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const PartyScreen: React.FC = () => {
  const { openRoom, setCreateRoomModalOpen } = useApp();
  const { t, isRTL } = useLang();

  const [activeCategory, setActiveCategory] = useState<RoomCategory>('all');
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await RoomService.getRooms(activeCategory);
      setRooms(data);
    };
    fetchRooms();
  }, [activeCategory]);

  const categories: { id: RoomCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('allRooms'), icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'chat', label: t('catChat'), icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'music', label: t('catMusic'), icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'gaming', label: t('catGaming'), icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'dating', label: t('catDating'), icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'friendship', label: t('catFriendship'), icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const filteredRooms = rooms.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.host && r.host.display_name && r.host.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      {/* Header & Create Room Button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-base font-black text-slate-900 dark:text-white">
              {t('partyTitle')}
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t('partySubtitle')}
          </p>
        </div>

        <button
          onClick={() => setCreateRoomModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-brand-500/25 transition active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createRoom')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن غرفة، مضيف، أو فعالية..."
          className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none mb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md shadow-brand-500/30 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* LIVE ROOMS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredRooms.map((room) => {
          const activeSpeakers = room.seats ? room.seats.filter(s => s.user).length : 0;
          return (
            <motion.div
              key={room.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => openRoom(room)}
              className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer group transition-transform hover:-translate-y-0.5"
            >
              {/* Cover Background */}
              <div className="relative h-28 w-full bg-slate-800 overflow-hidden">
                <img
                  src={room.cover_url || room.host?.profile_photo}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Badges: Type (Audio/Video) & Country */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                    {room.type === 'video' ? <Video className="w-3 h-3 text-cyan-400" /> : <Mic className="w-3 h-3 text-rose-400" />}
                    <span>{room.type === 'video' ? 'فيديو' : 'صوت'}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{room.audience_count}</span>
                  </span>
                </div>

                {/* Live Equalizer Animation */}
                <div className="absolute bottom-2.5 start-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold shadow-md">
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-0.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span>LIVE</span>
                </div>

                {/* Country Flag */}
                <span className="absolute bottom-2.5 end-2.5 z-10 text-base drop-shadow">
                  {room.country_flag}
                </span>
              </div>

              {/* Room Card Body */}
              <div className="p-3.5">
                {/* Title */}
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 mb-2">
                  {room.title}
                </h3>

                {/* Host Info & Active Mic Seats Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-brand-500">
                      <img src={room.host?.profile_photo} alt={room.host?.display_name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
                      {room.host?.display_name}
                    </span>
                  </div>

                  {/* Overlapping Speaker Avatars on Mic */}
                  <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                    {room.seats && room.seats.filter(s => s.user).slice(0, 3).map((seat, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-slate-700"
                        title={seat.user?.display_name}
                      >
                        <img src={seat.user?.profile_photo} alt="Speaker" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-extrabold ps-2">
                      {activeSpeakers}/8 مايك
                    </span>
                  </div>
                </div>

                {/* Tag Pills */}
                <div className="flex items-center gap-1 mt-2.5 overflow-hidden">
                  {room.tags && room.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-medium text-slate-500 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};