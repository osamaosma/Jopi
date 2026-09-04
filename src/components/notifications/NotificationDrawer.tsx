// ============================================================================
// MingleUp Notifications Center Drawer
// Categorized activity feed (Matches, Likes, Gifts, Messages, System)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Heart, Sparkles, Gift as GiftIcon, 
  MessageCircle, X, Check, CheckCheck 
} from 'lucide-react';
import { Notification } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const NotificationDrawer: React.FC = () => {
  const { 
    notificationsOpen, 
    setNotificationsOpen, 
    refreshNotifications,
    setActiveTab,
    setActiveConversation
  } = useApp();
  const { t, lang } = useLang();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notificationsOpen) {
      setNotifications(NotificationService.getNotifications());
    }
  }, [notificationsOpen]);

  if (!notificationsOpen) return null;

  const handleMarkAllRead = () => {
    NotificationService.markAllAsRead();
    setNotifications(NotificationService.getNotifications());
    refreshNotifications();
  };

  const handleNotificationClick = (notif: Notification) => {
    NotificationService.markAsRead(notif.id);
    refreshNotifications();
    setNotificationsOpen(false);

    if (notif.type === 'new_match' || notif.type === 'new_message' || notif.type === 'gift_received') {
      setActiveTab('messages');
    } else if (notif.type === 'system') {
      setActiveTab('wallet');
    } else if (notif.type === 'new_like') {
      setActiveTab('matches');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'gift_received':
        return <GiftIcon className="w-4 h-4 text-purple-500" />;
      case 'new_like':
        return <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'new_message':
        return <MessageCircle className="w-4 h-4 text-brand-500" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl border-s border-slate-200 dark:border-slate-800 flex flex-col text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="font-extrabold text-sm">مركز الإشعارات</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMarkAllRead}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-semibold flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span>قراءة الكل</span>
              </button>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                    !notif.is_read
                      ? 'bg-brand-50/60 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800/60 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lang === 'ar' ? (notif.title_ar || notif.title) : notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {lang === 'ar' ? (notif.body_ar || notif.body) : notif.body}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">لا توجد إشعارات جديدة</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
