// ============================================================================
// jopi Messages & System Notifications Screen (SUGO Style Final Fix)
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Bell, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { Avatar } from '../common/Avatar';

export const MatchesScreen: React.FC = () => {
  const { setActiveConversation, setActiveTab } = useApp();
  const { t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');

  // فتح المحادثة المباشرة
  const handleOpenChat = (partner: any) => {
    setActiveConversation({
      id: `conv-${partner.id}`,
      partner,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActiveTab('messages');
  };

  // محادثات النظام والعائلات الثابتة (مطابقة لتطبيق سوجو)
  const sugoSystemChats = [
    {
      id: 'sys-notif',
      name: 'Interaction notifications',
      lastMessage: 'You\'re invited to become a Super Admin...',
      time: '18:25',
      icon: <Bell className="w-5 h-5 text-white" />,
      bg: 'bg-purple-600',
      badge: 1
    },
    {
      id: 'sys-room',
      name: 'My chat room',
      lastMessage: 'The rooms you joined are active',
      time: '17:00',
      icon: <Users className="w-5 h-5 text-white" />,
      bg: 'bg-emerald-500',
      badge: 0
    },
    {
      id: 'sugo-team',
      name: 'SUGO TEAM',
      lastMessage: 'System Notice: رسالة شكر واستقبال ✨',
      time: '23:02',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      badge: 0,
      verified: true
    },
    {
      id: 'family-uchiha',
      name: 'UCHIHA Family',
      lastMessage: 'Jojo: منورين الغرفة يا شباب .. ❤️',
      time: '01:11',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isFamily: true,
      badge: 3
    }
  ];

  // المحادثات الشخصية المباشرة (مطابقة للصورة تماماً لضمان عدم ظهورها فارغة)
  const directChats = [
    {
      id: 'user-1',
      display_name: 'ريان العتيبي',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastMessage: 'مساء الورد! صوتك أو ملفك لفت انتباهي، من أي مدينة أنت؟ 💥',
      time: 'AM 04:42',
      unread_count: 1,
      is_online: true,
      is_verified: true
    },
    {
      id: 'user-2',
      display_name: 'عمر الفاروق',
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      lastMessage: 'مرحباً! لاحظت اهتماماتك المشتركة معي وحبيت أسلم عليك 😊',
      time: 'AM 04:48',
      unread_count: 5,
      is_online: true,
      is_verified: true
    },
    {
      id: 'user-3',
      display_name: 'نور الهدى',
      profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      lastMessage: 'مرحباً بك! أعجبنى حسابك جدّاً، هل أنت متفرغ للحديث قليلاً؟ ✨',
      time: 'AM 04:35',
      unread_count: 5,
      is_online: true,
      is_verified: false
    },
    {
      id: 'user-4',
      display_name: 'سارة خالد',
      profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      lastMessage: 'مرحباً بك! أعجبنى حسابك جدّاً، هل أنت متفرغ للحديث قليلاً؟ ✨',
      time: 'AM 04:47',
      unread_count: 5,
      is_online: true,
      is_verified: true
    },
    {
      id: 'user-5',
      display_name: 'ليلى المنصور',
      profile_photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      lastMessage: 'مرحباً! لاحظت اهتماماتك المشتركة معي وحبيت أسلم عليك 😊',
      time: 'AM 05:01',
      unread_count: 5,
      is_online: true,
      is_verified: true
    }
  ];

  const filteredChats = directChats.filter(c => 
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في المحادثات والمطابقات..."
          className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {/* SUGO Style System & Family Notifications */}
      <div className="space-y-2 mb-4">
        {sugoSystemChats.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.icon ? (
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center shadow-md flex-shrink-0`}>
                  {item.icon}
                </div>
              ) : (
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                  <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </h3>
                  {item.isFamily && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 text-[9px] font-bold border border-blue-500/20">Family</span>
                  )}
                  {item.verified && (
                    <span className="text-blue-500 text-xs font-bold">✔</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {item.lastMessage}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
              {item.badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RECENT CONVERSATIONS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('messagesTitle')}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {filteredChats.length} محادثات
          </span>
        </div>

        <div className="space-y-2">
          {filteredChats.map(chat => (
            <motion.div
              key={chat.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenChat(chat)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-pointer transition"
            >
              <Avatar
                src={chat.profile_photo}
                name={chat.display_name}
                size="md"
                isOnline={chat.is_online}
                isVerified={chat.is_verified}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {chat.display_name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {chat.time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {chat.lastMessage}
                  </p>

                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 animate-pulse">
                    {chat.unread_count}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};