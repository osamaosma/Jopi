// ============================================================================
// jopi Private Chat Screen & Original UI Restored (SUGO Style Integrated - Realtime Fixed)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendsTab } from './FriendsTab';
import { 
  ArrowLeft, ArrowRight, Phone, Video, MoreVertical, 
  Send, Mic, Gift as GiftIcon, Image as ImageIcon, 
  Smile, CheckCheck, Play, Pause, ShieldAlert, Ban, UserPlus, Search, Menu, Bell, Users
} from 'lucide-react';
import { Message, Conversation, User } from '../../types';
import { ChatService } from '../../services/chatService';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Avatar } from '../common/Avatar';
import { supabase } from '../../services/supabaseClient';

const QUICK_EMOJIS = ['❤️', '😍', '🔥', '☕', '✨', '🌹', '👏', '😂', '🎉', '🥰'];

export const ChatScreen: React.FC = () => {
  const { 
    activeConversation, 
    setActiveConversation, 
    startCall, 
    setGiftModal, 
    setReportModal, 
    setViewingUser,
    showToast,
    setNotificationsOpen,
    unreadNotifsCount
  } = useApp();
  const { user: currentUser } = useAuth();
  const { t, isRTL, lang } = useLang();

  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const partner = activeConversation?.partner;

  // الحفاظ على المحادثة الحالية وتثبيتها محلياً حتى لا تفقد عند الرجوع
  useEffect(() => {
    if (activeConversation && partner) {
      const convs = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
      const index = convs.findIndex(c => c.id === activeConversation.id || c.partner?.id === partner.id);
      if (index >= 0) {
        convs[index] = { 
          ...convs[index], 
          partner: { ...convs[index].partner, ...partner },
          unread_count: 0, 
          updated_at: new Date().toISOString() 
        };
      } else {
        convs.unshift({
          id: activeConversation.id,
          partner: partner,
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      StorageService.set(STORAGE_KEYS.CONVERSATIONS, convs);
    }
    setConversations(ChatService.getConversations());
  }, [activeConversation]);

  // تفعيل الاتصال اللحظي الفوري مع الاستماع للرسائل وتحديث القراءة (UPDATE) وفرز زمني تصاعدي
  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const currentPartner = activeConversation.partner;

    const loadMessages = async () => {
      const msgs = await ChatService.getMessages(activeConversation.id);
      // فرز زمني صارم: الرسائل القديمة في الأعلى والجديدة في الأسفل
      const sorted = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(sorted);
      // تحديث حالة القراءة في السيرفر والمحلي عند فتح المحادثة
      ChatService.markAsRead(activeConversation.id);
    };

    loadMessages();

    const channelName = `realtime-chat-sync-${activeConversation.id}-${currentUser.id}-${Date.now()}`;
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: '*', // الاستماع للـ INSERT والـ UPDATE معاً
          schema: 'public', 
          table: 'messages'
        },
        (payload) => {
          const raw = payload.new as any;
          if (!raw) return;

          const isOurChat = 
            (raw.sender_id === currentUser.id && raw.receiver_id === currentPartner?.id) ||
            (raw.sender_id === currentPartner?.id && raw.receiver_id === currentUser.id) ||
            raw.conversation_id === activeConversation.id;

          if (!isOurChat) return;

          const formattedMsg: Message = {
            id: raw.id,
            conversation_id: raw.conversation_id,
            sender_id: raw.sender_id,
            receiver_id: raw.receiver_id,
            message_type: raw.message_type || 'text',
            text: raw.text || raw.content,
            media_url: raw.media_url,
            media_duration: raw.media_duration,
            is_read: raw.is_read ?? false,
            is_delivered: raw.is_delivered ?? true,
            created_at: raw.created_at,
          };

          // تحديث حالة الرسالة إذا قرأها الطرف الآخر (تحول الصح للأزرق)
          if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === formattedMsg.id ? { ...m, is_read: formattedMsg.is_read } : m));
            return;
          }

          // إضافة الرسالة الجديدة مع ترتيبها في أسفل المحادثة
          setMessages(prev => {
            if (prev.some(m => m.id === formattedMsg.id)) {
              return prev.map(m => m.id === formattedMsg.id ? formattedMsg : m);
            }
            const updated = [...prev, formattedMsg];
            return updated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });

          // إذا كانت الرسالة واردة لك وأنت داخل الشاشة، اجعلها مقروءة فوراً
          if (formattedMsg.receiver_id === currentUser.id) {
            ChatService.markAsRead(activeConversation.id);
          } else {
            ChatService.receiveIncomingMessage(formattedMsg);
          }
          setConversations(ChatService.getConversations());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [activeConversation?.id, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSendMessage = async (customText?: string, type: 'text' | 'voice' | 'image' | 'gift' = 'text', mediaUrl?: string, duration?: number) => {
    if (!activeConversation || !partner || !currentUser) return;
    const textToSend = customText || inputText.trim();
    if (!textToSend && type === 'text') return;

    try {
      const newMsg = await ChatService.sendMessage({
        conversationId: activeConversation.id,
        receiverId: partner.id,
        messageType: type,
        text: textToSend,
        mediaUrl,
        mediaDuration: duration,
        partnerProfile: partner,
      });

      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        const updated = [...prev, newMsg];
        return updated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      setConversations(ChatService.getConversations());
      setInputText('');
      setShowEmojiBar(false);
    } catch (error) {
      console.error('[ChatScreen] Error sending message:', error);
      showToast(lang === 'ar' ? 'تعذر إرسال الرسالة، تحقق من الاتصال' : 'Failed to send message', 'error');
    }
  };

  const handleSendVoiceNote = () => {
    setIsRecording(false);
    const duration = Math.max(2, recordSeconds);
    handleSendMessage(`تسجيل صوتي (0:${duration < 10 ? '0' : ''}${duration})`, 'voice', 'mock_audio.mp3', duration);
    showToast('تم إرسال التسجيل الصوتي 🎙️', 'success');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(lang === 'ar' ? 'جاري إرسال الصورة...' : 'Sending image...', 'info');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      await handleSendMessage(lang === 'ar' ? 'أرسل صورة 📸' : 'Sent an image 📸', 'image', base64Url);
      showToast(lang === 'ar' ? 'تم إرسال الصورة بنجاح' : 'Image sent successfully', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleAudioPlay = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none pb-24">
        
        {/* الشريط العلوي للتبويبات وخيارات الإدارة */}
        <div className="px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`text-lg font-bold transition cursor-pointer relative pb-1 ${
                activeTab === 'chats' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {lang === 'ar' ? 'الرسائل' : 'Messages'}
              {activeTab === 'chats' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-brand-600 to-rose-500 rounded-full" />
              )}
            </button>

            <button 
              onClick={() => setActiveTab('friends')}
              className={`text-lg font-bold transition cursor-pointer relative pb-1 ${
                activeTab === 'friends' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {lang === 'ar' ? 'الأصدقاء' : 'Contacts'}
              {activeTab === 'friends' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-brand-600 to-rose-500 rounded-full" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setActiveTab('friends')}
              className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowAddMenu(prev => !prev)}
                className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Options"
              >
                <Menu className="w-5 h-5" />
              </button>

              {showAddMenu && (
                <div className="absolute end-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      setActiveTab('friends');
                    }}
                    className="w-full px-4 py-3 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-brand-500" />
                    <span>Add (إضافة)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      showToast('تم تحديد الكل كمقروء', 'info');
                    }}
                    className="w-full px-4 py-3 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-800 dark:text-slate-100 cursor-pointer border-t border-slate-100 dark:border-slate-700"
                  >
                    <span>Ignore Unreads</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      showToast('تم الحذف بنجاح', 'info');
                    }}
                    className="w-full px-4 py-3 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 text-rose-600 dark:text-rose-400 cursor-pointer border-t border-slate-100 dark:border-slate-700"
                  >
                    <span>Bulk Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === 'chats' ? (
          <div className="p-4 space-y-3">
            <div className="relative mb-4">
              <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث في المحادثات والمطابقات ...' : 'Search conversations...'}
                className="w-full py-2.5 ps-10 pe-4 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/50 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div 
              onClick={() => setNotificationsOpen(true)}
              className="p-3.5 rounded-2xl bg-purple-600/10 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition relative"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md relative">
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Interaction notifications</h4>
                  <span className="text-[10px] text-slate-400">الآن</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  {unreadNotifsCount > 0 ? `لديك ${unreadNotifsCount} إشعارات تفاعل جديدة بانتظارك` : "You're invited to become a Super Admin..."}
                </p>
              </div>
              {unreadNotifsCount > 0 ? (
                <span className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              ) : (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">1</span>
              )}
            </div>

            <div 
              onClick={() => showToast('غرفة الدردشة الفعالة', 'info')}
              className="p-3.5 rounded-2xl bg-emerald-600/10 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">My chat room</h4>
                  <span className="text-[10px] text-slate-400">17:00</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">The rooms you joined are active</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between px-1 mb-2 text-xs font-bold text-slate-400">
                <span>MESSAGES TITLE</span>
                <span>{conversations.length} محادثات</span>
              </div>

              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {lang === 'ar' ? 'لا توجد محادثات حالياً' : 'No conversations yet'}
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition cursor-pointer shadow-sm"
                    >
                      <Avatar
                        src={conv.partner?.profile_photo}
                        name={conv.partner?.display_name || 'User'}
                        size="md"
                        isOnline={conv.partner?.is_online}
                        isVerified={conv.partner?.is_verified}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white flex items-center gap-1">
                            <span>{conv.partner?.display_name}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'AM 04:42'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {typeof conv.last_message === 'string' 
                            ? conv.last_message 
                            : (conv.last_message as any)?.text || (lang === 'ar' ? 'ابدأ المحادثة الآن...' : 'Start chatting now...')}
                        </p>
                      </div>
                      {conv.unread_count ? (
                        <span className="min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          currentUser && (
            <div className="flex-1 overflow-y-auto">
              <FriendsTab 
                currentUserId={currentUser.id} 
                onStartChat={(friend: User) => {
                  setActiveConversation({
                    id: `conv_${friend.id}`,
                    partner: friend,
                    unread_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                }} 
              />
            </div>
          )
        )}
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-white select-none transition-colors">
      
      {/* CHAT HEADER */}
      <div className="h-16 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveConversation(null)}
            className="p-2 -ms-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setViewingUser(partner)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Avatar
              src={partner.profile_photo}
              name={partner.display_name}
              size="sm"
              isOnline={partner.is_online}
              isVerified={partner.is_verified}
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                <span>{partner.display_name}</span>
              </h3>
              <p className="text-[11px] text-emerald-500 font-semibold leading-tight">
                {partner.is_online ? t('onlineNow') : 'نشط مؤخراً'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => startCall(partner, 'voice')}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95 cursor-pointer"
            title={t('callVoice')}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => startCall(partner, 'video')}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95 cursor-pointer"
            title={t('callVideo')}
          >
            <Video className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute end-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs font-semibold">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setGiftModal({ isOpen: true, targetUser: partner, conversationId: activeConversation.id });
                  }}
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-purple-600 dark:text-purple-400 cursor-pointer"
                >
                  <GiftIcon className="w-4 h-4" />
                  <span>{t('sendGift')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setReportModal({ isOpen: true, targetUser: partner });
                  }}
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-amber-600 dark:text-amber-400 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t('reportUser')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setViewingUser(partner);
                  }}
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>{t('blockUser')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl p-3 shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-tr from-brand-600 to-rose-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none'
                }`}
              >
                {msg.message_type === 'gift' && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/15">
                    <span className="text-3xl animate-bounce">
                      {msg.gift_data?.icon || '🎁'}
                    </span>
                    <div>
                      <div className="text-xs font-bold">
                        {msg.gift_data?.name_ar || 'هدية مميزة'}
                      </div>
                      <div className="text-[10px] opacity-80">
                        {msg.gift_data?.coin_price} {t('coins')}
                      </div>
                    </div>
                  </div>
                )}

                {msg.message_type === 'image' && msg.media_url && (
                  <div className="rounded-xl overflow-hidden mb-1.5 max-h-56">
                    <img src={msg.media_url} alt="Media" className="w-full h-full object-cover" />
                  </div>
                )}

                {msg.message_type === 'voice' && (
                  <div className="flex items-center gap-3 min-w-[180px] py-1">
                    <button
                      onClick={() => toggleAudioPlay(msg.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer ${
                        isMe ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ms-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {[3, 6, 9, 5, 8, 4, 7, 3, 6, 8, 4, 7, 5].map((height, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            playingAudioId === msg.id ? 'bg-white animate-pulse' : (isMe ? 'bg-white/70' : 'bg-slate-400')
                          }`}
                          style={{ height: `${height * 2.2}px` }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] opacity-80 font-mono">
                      0:{msg.media_duration || 12}
                    </span>
                  </div>
                )}

                {msg.text && msg.message_type !== 'voice' && (
                  <p className="text-xs leading-relaxed font-normal">
                    {msg.text}
                  </p>
                )}

                <div className={`flex items-center gap-1 justify-end mt-1 text-[9px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <CheckCheck className={`w-3.5 h-3.5 ${msg.is_read ? 'text-cyan-300' : 'text-white/60'}`} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-24 shadow-sm"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-2 h-2 rounded-full bg-brand-500"
              />
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK EMOJI BAR */}
      <AnimatePresence>
        {showEmojiBar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto"
          >
            {QUICK_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setInputText(prev => prev + emoji)}
                className="text-xl p-1.5 hover:scale-125 transition active:scale-95 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VOICE RECORDING OVERLAY BAR */}
      {isRecording && (
        <div className="px-4 py-3 bg-rose-500 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span className="text-xs font-bold">{t('voiceRecording')}</span>
            <span className="text-xs font-mono font-bold">0:{recordSeconds < 10 ? '0' : ''}{recordSeconds}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(false)}
              className="p-1.5 rounded-lg bg-black/20 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-3 py-1.5 rounded-lg bg-white text-rose-600 text-xs font-bold shadow cursor-pointer"
            >
              إرسال
            </button>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 z-20">
        <button
          onClick={() => setGiftModal({ isOpen: true, targetUser: partner, conversationId: activeConversation.id })}
          className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:scale-105 transition active:scale-95 shadow-sm cursor-pointer"
          title={t('sendGift')}
        >
          <GiftIcon className="w-5 h-5" />
        </button>

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageSelect} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Attach Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowEmojiBar(prev => !prev)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('typeMessagePlaceholder')}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
        />

        {inputText.trim() ? (
          <button
            onClick={() => handleSendMessage()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md shadow-brand-500/30 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsRecording(true)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
            title="Record Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};