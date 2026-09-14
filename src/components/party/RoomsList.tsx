// ============================================================================
// Jopi Rooms List Component (Pure Cloud Realtime Version)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Plus, Crown, Sparkles, Volume2 } from 'lucide-react';
import { VoiceRoom, RoomCategory } from '../../types';
import { RoomService } from '../../services/roomService';
import { supabase } from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';

interface RoomsListProps {
  selectedCategory: RoomCategory;
  onSelectRoom: (room: VoiceRoom) => void;
  onCreateRoomClick: () => void;
}

export const RoomsList: React.FC<RoomsListProps> = ({ selectedCategory, onSelectRoom, onCreateRoomClick }) => {
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useApp();

  // جلب الغرف وتفعيل التحديث اللحظي (Realtime)
  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      setLoading(true);
      const data = await RoomService.getRooms(selectedCategory);
      if (isMounted) {
        setRooms(data);
        setLoading(false);
      }
    };

    loadRooms();

    // الاستماع لأي تغيّر لحظي في جدول الغرف (إنشاء، حذف، تعديل)
    const channel = supabase
      .channel('public:voice_rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'voice_rooms' },
        async () => {
          const updatedData = await RoomService.getRooms(selectedCategory);
          if (isMounted) {
            setRooms(updatedData);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* رأس القسم وزر إنشاء غرفة */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-pink-500 animate-pulse" />
            غرف الحفلات الصوتية
          </h2>
          <p className="text-xs text-slate-400">انضم إلى الأصدقاء وتحدث على المايكات الحية</p>
        </div>
        
        <button
          onClick={onCreateRoomClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إنشاء غرفة</span>
        </button>
      </div>

      {/* حالة التحميل */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-800/50 animate-pulse border border-slate-700/50" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        /* في حال عدم وجود غرف نشطة */
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <Volume2 className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-sm font-bold text-white mb-1">لا توجد غرف نشطة حالياً</h3>
          <p className="text-xs text-slate-400 mb-4">كن أول من يبدأ حفلة صوتية جديدة الآن!</p>
          <button
            onClick={onCreateRoomClick}
            className="px-5 py-2.5 rounded-full bg-pink-600 text-white text-xs font-bold cursor-pointer"
          >
            أنشئ غرفتك الآن
          </button>
        </div>
      ) : (
        /* عرض شبكة الغرف */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRoom(room)}
              className={`relative rounded-3xl p-4 overflow-hidden border border-white/10 shadow-xl cursor-pointer flex flex-col justify-between h-44 ${room.bg_theme || 'bg-gradient-to-b from-indigo-900 to-slate-950'}`}
            >
              {/* طبقة شفافة لتحسين وضوح النص */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />

              {/* الجزء العلوي: عدد الحضور وتصنيف الغرفة */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-pink-300 border border-white/10 flex items-center gap-1">
                  <Users className="w-3 h-3 text-pink-400" />
                  <span>{room.seats?.filter(s => s.user).length || 1} مستخدم</span>
                </span>
                
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  مباشر
                </span>
              </div>

              {/* الجزء السفلي: عنوان الغرفة وصورة المضيف */}
              <div className="relative z-10 flex items-center gap-3 mt-auto">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow-md">
                  <img src={room.cover_url || room.host?.profile_photo} alt="" className="w-full h-full object-cover" />
                  <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute bottom-0 end-0" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-black text-white truncate mb-0.5">{room.title}</h3>
                  <p className="text-[10px] text-slate-300 truncate">المضيف: {room.host?.display_name || 'مستخدم'}</p>
                  <p className="text-[9px] text-amber-300 mt-0.5 font-mono">ID: {room.id.slice(-6)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};