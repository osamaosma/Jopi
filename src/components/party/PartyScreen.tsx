// ============================================================================
// jopi Party / Rooms Explorer (Sogo-Style Feed Layout with Audio/Video Tabs)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, Plus, Users, Video, Mic, 
  Flame, Music, Gamepad2, Heart, Smile, Search, Sparkles, Trophy
} from 'lucide-react';
import { VoiceRoom, RoomCategory } from '../../types';
import { RoomService } from '../../services/roomService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const PartyScreen: React.FC = () => {
  const { openRoom, setCreateRoomModalOpen } = useApp();
  const { t } = useLang();

  const [subView, setSubView] = useState<'recommend' | 'video'>('recommend');
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
    { id: 'all', label: 'Recommend', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'chat', label: 'Chat', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'music', label: 'Music', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'gaming', label: 'Gaming', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'dating', label: 'Dating', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'friendship', label: 'Families', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  // تصفية الغرف بناءً على التبويب (Recommend للصوتية، Video للفيديو) ومعيار البحث
  const filteredRooms = rooms.filter(r => {
    const matchesView = subView === 'video' ? r.type === 'video' : r.type === 'audio';
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.host && r.host.display_name && r.host.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesView && matchesSearch;
  });

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-28 select-none">
      
      {/* Top Header Tabs & Event Center Banner */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
          <button 
            onClick={() => setSubView('recommend')}
            className={`pb-1 transition cursor-pointer ${subView === 'recommend' ? 'text-slate-900 dark:text-white border-b-2 border-brand-500 font-black' : 'hover:text-slate-200'}`}
          >
            Recommend (صوتي)
          </button>
          <button 
            onClick={() => setSubView('video')}
            className={`pb-1 transition cursor-pointer ${subView === 'video' ? 'text-slate-900 dark:text-white border-b-2 border-brand-500 font-black' : 'hover:text-slate-200'}`}
          >
            Video (فيديو)
          </button>
        </div>
        
        <button
          onClick={() => setCreateRoomModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-rose-600 text-white text-xs font-black shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إنشاء غرفة</span>
        </button>
      </div>

      {/* Event Center Banner (Sogo Style) */}
      <div className="relative w-full h-28 rounded-3xl bg-gradient-to-r from-orange-400 via-amber-400 to-rose-400 p-4 mb-4 shadow-lg overflow-hidden flex items-center justify-between">
        <div className="z-10 text-slate-900">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/40 uppercase tracking-wider">Event Center</span>
          <h3 className="text-base font-black mt-1">فعاليات وكالة الملك والجوائز الكبرى</h3>
          <p className="text-[10px] opacity-80 mt-0.5">انضم الآن وشارك في التحديات الأسبوعية واربح آلاف العملات</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner flex-shrink-0">
          <Trophy className="w-8 h-8 text-amber-900" />
        </div>
      </div>

      {/* Categories Horizontal Tabs (تظهر فقط في تبويب الغرف الصوتية) */}
      {subView === 'recommend' && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ROOMS FEED LIST (Sogo Vertical Feed Style) */}
      <div className="space-y-3.5">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            لا توجد غرف متاحة حالياً في هذا القسم. قم بإنشاء غرفة جديدة وابدأ البث! ✨
          </div>
        ) : (
          filteredRooms.map((room) => {
            return (
              <motion.div
                key={room.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => openRoom(room)}
                className="relative p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer group flex items-center gap-3.5"
              >
                {/* Room Thumbnail / Host Avatar */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-inner">
                  <img
                    src={room.cover_url || room.host?.profile_photo}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 start-1 px-1.5 py-0.2 rounded bg-black/60 text-[8px] font-bold text-emerald-400">
                    LIVE
                  </span>
                </div>

                {/* Room Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {room.title}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>{room.audience_count}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                    {room.description || room.host?.display_name || 'غرفة دردشة تفاعلية'}
                  </p>

                  {/* Badges / Tags */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 text-[9px] font-bold border border-brand-200 dark:border-brand-800">
                      {room.category}
                    </span>
                    {room.type === 'video' && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 text-[9px] font-bold flex items-center gap-1">
                        <Video className="w-3 h-3" /> فيديو
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
};