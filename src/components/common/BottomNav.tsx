// ============================================================================
// MingleUp Bottom Navigation Bar (SUGO Style with Friends Tab Integrated)
// ============================================================================

import React from 'react';
import { Flame, Radio, MessageCircle, Users, Sparkles, User } from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import { ChatService } from '../../services/chatService';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setActiveConversation } = useApp();
  const { lang } = useLang();
  const { user } = useAuth();

  // Calculate unread messages
  const conversations = ChatService.getConversations();
  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'discover',
      label: lang === 'ar' ? 'اكتشف' : 'Discover',
      icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'party',
      label: lang === 'ar' ? 'الغرف' : 'Party',
      icon: <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 animate-pulse" />,
    },
    {
      id: 'messages',
      label: lang === 'ar' ? 'الرسائل' : 'Messages',
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      badge: totalUnreadMessages,
    },
    {
      id: 'friends', // تبويب الأصدقاء المضاف رسمياً
      label: lang === 'ar' ? 'الأصدقاء' : 'Friends',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500" />,
    },
    {
      id: 'wallet', // نستخدم معرف wallet برمجياً لللحظات
      label: lang === 'ar' ? 'اللحظات' : 'Moments',
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />,
    },
    {
      id: 'profile',
      label: lang === 'ar' ? 'الملف' : 'Profile',
      icon: user?.profile_photo ? (
        <img 
          src={user.profile_photo} 
          alt={user.display_name} 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-current"
        />
      ) : (
        <User className="w-5 h-5 sm:w-6 sm:h-6" />
      ),
    },
  ];

  const handleTabClick = (tabId: NavTab) => {
    if (tabId === 'messages') {
      setActiveConversation(null);
    }
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/80 shadow-2xl transition-colors">
      <div className="max-w-lg mx-auto px-1 h-16 flex items-center justify-between">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-brand-600 dark:text-brand-400 scale-105 font-bold' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -end-2 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[8.5px] sm:text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[55px]">{item.label}</span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="absolute -bottom-1 w-4 h-1 bg-gradient-to-r from-brand-600 to-rose-500 rounded-full shadow-sm shadow-brand-500/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};