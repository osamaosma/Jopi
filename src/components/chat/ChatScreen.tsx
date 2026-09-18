// ============================================================================
// jopi Private Chat Screen & Original UI Restored (SUGO Style Integrated - Realtime Fixed)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FriendsTab } from './FriendsTab';
import { 
  ArrowLeft, ArrowRight, Phone, Video, MoreVertical, 
  Send, Mic, Gift as GiftIcon, Image as ImageIcon, 
  Smile, CheckCheck, Play, Pause, ShieldAlert, Ban, UserPlus, Search, Menu, Bell, Users,
  Pin, Trash2, ChevronRight, ChevronLeft, X, Heart, Trophy, Sparkles
} from 'lucide-react';
import { Message, Conversation, User } from '../../types';
import { ChatService } from '../../services/chatService';
import { RelationshipService, CoupleRelationship } from '../../services/relationshipService';
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

  // حالة القائمة السفلية للضغط المطول
  const [selectedLongPressConv, setSelectedLongPressConv] = useState<Conversation | null>(null);
  const longPressTimerRef = useRef<any>(null);

  // حالة نافذة إعدادات الدردشة
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [remarkInput, setRemarkInput] = useState('');

  // حالات نافذة العلاقة والقلب/الزهرة
  const [showCoupleModal, setShowCoupleModal] = useState(false);
  const [coupleMenuOpen, setCoupleMenuOpen] = useState(false);
  const [relationship, setRelationship] = useState<CoupleRelationship | null>(null);

  // حالة الدرج الجانبي العائم للأمنيات (Wishlist Side Drawer)
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const partner = activeConversation?.partner;

  // جلب وتحديث بيانات العلاقة عند فتح أي محادثة
  useEffect(() => {
    if (currentUser && partner) {
      setRelationship(RelationshipService.getRelationship(currentUser.id, partner.id));
    }
  }, [currentUser, partner]);

  useEffect(() => {
    const handleRelUpdate = () => {
      if (currentUser && partner) {
        setRelationship(RelationshipService.getRelationship(currentUser.id, partner.id));
      }
    };
    window.addEventListener('jopi_relationship_updated', handleRelUpdate);
    return () => window.removeEventListener('jopi_relationship_updated', handleRelUpdate);
  }, [currentUser, partner]);

  // الاستماع لتحديثات المحادثات في الوقت الحقيقي لتحديث القائمة دون الحاجة لـ Refresh
  useEffect(() => {
    const updateList = () => {
      setConversations(ChatService.getConversations());
    };

    updateList();
    window.addEventListener('jopi_conversation_updated', updateList);
    return () => {
      window.removeEventListener('jopi_conversation_updated', updateList);
    };
  }, [activeConversation]);

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
  }, [activeConversation, partner]);

  // تفعيل الاتصال اللحظي الفوري مع الاستماع للرسائل وتحديث القراءة وفرز زمني تصاعدي
  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const currentPartner = activeConversation.partner;

    const loadMessages = async () => {
      const msgs = await ChatService.getMessages(activeConversation.id, currentPartner?.id);
      const sorted = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(sorted);
      void ChatService.markAsRead(activeConversation.id, currentPartner?.id);
    };

    void loadMessages();

    const channelName = `realtime-chat-sync-${activeConversation.id}-${currentUser.id}-${Date.now()}`;
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: '*',
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

          if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === formattedMsg.id ? { ...m, is_read: formattedMsg.is_read } : m));
            return;
          }

          setMessages(prev => {
            if (prev.some(m => m.id === formattedMsg.id)) {
              return prev.map(m => m.id === formattedMsg.id ? formattedMsg : m);
            }
            const updated = [...prev, formattedMsg];
            return updated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });

          if (formattedMsg.receiver_id === currentUser.id) {
            void ChatService.markAsRead(activeConversation.id, currentPartner?.id);
          } else {
            void ChatService.receiveIncomingMessage(formattedMsg);
          }
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

  const handleTouchStart = (conv: Conversation) => {
    longPressTimerRef.current = setTimeout(() => {
      setSelectedLongPressConv(conv);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleDeleteOnly = (conv: Conversation) => {
    ChatService.deleteConversationOnly(conv.id);
    setSelectedLongPressConv(null);
    showToast(lang === 'ar' ? 'تم حذف المحادثة من القائمة' : 'Conversation deleted from list', 'info');
  };

  const handleDeleteWithChat = async (conv: Conversation) => {
    await ChatService.deleteConversationAndChat(conv.id, conv.partner?.id);
    setSelectedLongPressConv(null);
    showToast(lang === 'ar' ? 'تم حذف المحادثة وسجل الرسائل' : 'Conversation and chat deleted', 'success');
  };

  const handleTogglePin = (conv: Conversation) => {
    const isPinned = ChatService.togglePinConversation(conv.id);
    setSelectedLongPressConv(null);
    showToast(
      isPinned 
        ? (lang === 'ar' ? 'تم تثبيت المحادثة في الأعلى 📌' : 'Pinned to top') 
        : (lang === 'ar' ? 'تم إلغاء التثبيت' : 'Unpinned'),
      'info'
    );
  };

  const handleBlockUser = (conv: Conversation) => {
    if (conv.partner?.id) {
      ChatService.blockUser(conv.partner.id);
      setSelectedLongPressConv(null);
      showToast(lang === 'ar' ? 'تم حظر المستخدم بنجاح' : 'User blocked successfully', 'info');
    }
  };

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

      // إضافة نقطة ألفة للدردشة النصية
      RelationshipService.addChatIntimacyPoints(currentUser.id, partner.id);

      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        const updated = [...prev, newMsg];
        return updated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
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

  // الهدية الحالية النشطة في شريط الأمنيات
  const activeWish = relationship?.wishlist?.[0];

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white select-none pb-24">
        
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
                  {conversations.map((conv) => {
                    const isPinned = Boolean((conv as any).is_pinned);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setSelectedLongPressConv(conv);
                        }}
                        onTouchStart={() => handleTouchStart(conv)}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={() => handleTouchStart(conv)}
                        onMouseUp={handleTouchEnd}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition cursor-pointer shadow-sm relative ${
                          isPinned 
                            ? 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-300/80 dark:border-brand-800/80' 
                            : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <Avatar
                          src={conv.partner?.profile_photo}
                          name={(conv.partner as any)?.remark || conv.partner?.display_name || 'User'}
                          size="md"
                          isOnline={conv.partner?.is_online}
                          isVerified={conv.partner?.is_verified}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{(conv.partner as any)?.remark || conv.partner?.display_name}</span>
                              {isPinned && <Pin className="w-3 h-3 text-brand-500 fill-brand-500 rotate-45" />}
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
                    );
                  })}
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

        {/* BOTTOM ACTION SHEET FOR LONG PRESS */}
        <AnimatePresence>
          {selectedLongPressConv && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs">
              <div 
                className="fixed inset-0" 
                onClick={() => setSelectedLongPressConv(null)} 
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden pb-8"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3" />
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <button
                    onClick={() => handleDeleteOnly(selectedLongPressConv)}
                    className="w-full py-4 px-6 text-center text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer"
                  >
                    Delete conversations only
                  </button>
                  <button
                    onClick={() => handleDeleteWithChat(selectedLongPressConv)}
                    className="w-full py-4 px-6 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer"
                  >
                    Delete conversations and chat
                  </button>
                  <button
                    onClick={() => handleTogglePin(selectedLongPressConv)}
                    className="w-full py-4 px-6 text-center text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer"
                  >
                    {(selectedLongPressConv as any).is_pinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    onClick={() => handleBlockUser(selectedLongPressConv)}
                    className="w-full py-4 px-6 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 transition cursor-pointer"
                  >
                    Block
                  </button>
                </div>
                <div className="px-4 mt-3">
                  <button
                    onClick={() => setSelectedLongPressConv(null)}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
            onClick={() => {
              setRemarkInput((partner as any)?.remark || '');
              setShowChatSettings(true);
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-98 transition"
          >
            <Avatar
              src={partner.profile_photo}
              name={(partner as any)?.remark || partner.display_name}
              size="sm"
              isOnline={partner.is_online}
              isVerified={partner.is_verified}
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                <span>{(partner as any)?.remark || partner.display_name}</span>
              </h3>
              <p className="text-[11px] text-emerald-500 font-semibold leading-tight">
                {partner.is_online ? t('onlineNow') : 'نشط مؤخراً'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => startCall(partner, 'voice')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95 cursor-pointer"
            title={t('callVoice')}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => startCall(partner, 'video')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95 cursor-pointer"
            title={t('callVideo')}
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setRemarkInput((partner as any)?.remark || '');
              setShowChatSettings(true);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Chat Settings"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. شارة العلاقة العائمة: قلب (ارتباط) أو زهرة (صداقة) فوق حقل الأمنيات مباشرة على اليمين */}
      {relationship && !relationship.is_hidden && (
        <div className="absolute top-20 end-3 z-30 flex flex-col items-center pointer-events-auto">
          <button
            onClick={() => setShowCoupleModal(true)}
            className="flex flex-col items-center hover:scale-105 active:scale-95 transition cursor-pointer"
            title={relationship.relationship_type === 'couple' ? 'Couple Relationship' : 'Friendship'}
          >
            <div className="relative flex items-center justify-center filter drop-shadow-md">
              {relationship.relationship_type === 'couple' ? (
                <span className="text-3xl animate-couple-heart">💖</span>
              ) : (
                <span className="text-3xl animate-couple-heart">🌸</span>
              )}
            </div>

            <div className={`mt-0.5 px-2 py-0.5 rounded-full text-white text-[9px] font-black font-mono shadow-xs border border-white/60 ${
              relationship.relationship_type === 'couple' 
                ? 'bg-pink-400' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
            }`}>
              {relationship.current_points}
            </div>
          </button>
        </div>
      )}

      {/* 2. درج الأمنيات الجانبي العائم للإناث تحت شارة العلاقة مباشرة كما في الصورة */}
      {partner.gender === 'female' && relationship && activeWish && (
        <div className="absolute top-36 end-0 z-30 pointer-events-auto">
          <AnimatePresence initial={false} mode="wait">
            {wishlistDrawerOpen ? (
              <motion.div
                key="open"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                className="relative flex items-center bg-gradient-to-l from-purple-300 via-pink-200 to-indigo-200 dark:from-purple-900/90 dark:via-pink-950/80 dark:to-indigo-950/90 rounded-s-2xl p-2 shadow-xl border-s-2 border-y-2 border-pink-300/80 dark:border-pink-600/50"
              >
                {/* سهم الإغلاق / الطي */}
                <button
                  onClick={() => setWishlistDrawerOpen(false)}
                  className="p-1 text-white/80 hover:text-white cursor-pointer"
                  title="Hide"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* صورة الهدية وشريط التقدم 0/10 */}
                <div 
                  onClick={() => setGiftModal({ isOpen: true, targetUser: partner, conversationId: activeConversation.id })}
                  className="flex flex-col items-center ms-1 cursor-pointer"
                >
                  <div className="w-11 h-11 flex items-center justify-center text-3xl filter drop-shadow animate-bounce-subtle">
                    {activeWish.icon || '💄'}
                  </div>
                  <div className="w-14 h-1.5 bg-white/50 dark:bg-black/40 rounded-full mt-1 overflow-hidden">
                    <div className="w-1/10 h-full bg-pink-500 rounded-full" />
                  </div>
                  <span className="text-[8px] font-black text-pink-600 dark:text-pink-300 font-mono mt-0.5">
                    {activeWish.is_fulfilled ? '10/10' : '0/10'}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0 }}
                onClick={() => setWishlistDrawerOpen(true)}
                className="flex items-center justify-center w-5 h-12 bg-gradient-to-l from-purple-400 to-pink-400 text-white rounded-s-xl shadow-lg cursor-pointer hover:w-6 transition-all"
                title="Show Wishlist"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CHAT SETTINGS FULL SCREEN */}
      <AnimatePresence>
        {showChatSettings && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-white"
          >
            <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChatSettings(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>
                <h2 className="text-base font-bold">Chat Settings</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div 
                onClick={() => {
                  setShowChatSettings(false);
                  setViewingUser(partner);
                }}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={partner.profile_photo} name={partner.display_name} size="md" />
                  <div>
                    <h3 className="text-sm font-bold">{partner.display_name}</h3>
                    <p className="text-xs text-slate-400">ID: {partner.id?.slice(0, 8)}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                <div className="p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-2">Write a remark</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={remarkInput}
                      onChange={(e) => setRemarkInput(e.target.value)}
                      placeholder={partner.display_name}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        ChatService.updatePartnerRemark(partner.id, remarkInput.trim());
                        showToast('تم تحديث اللقب بنجاح', 'success');
                      }}
                      className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-700"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await ChatService.deleteConversationAndChat(activeConversation.id, partner.id);
                    setMessages([]);
                    setShowChatSettings(false);
                    showToast('تم مسح سجل الرسائل بالكامل', 'info');
                  }}
                  className="w-full p-4 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <span>Delete chat history</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <div className="p-4 flex items-center justify-between">
                  <span>Top (تثبيت في الأعلى)</span>
                  <input
                    type="checkbox"
                    checked={Boolean((activeConversation as any).is_pinned)}
                    onChange={() => {
                      const pinned = ChatService.togglePinConversation(activeConversation.id);
                      (activeConversation as any).is_pinned = pinned;
                      showToast(pinned ? 'تم التثبيت في الأعلى 📌' : 'تم إلغاء التثبيت', 'info');
                    }}
                    className="w-5 h-5 accent-brand-600 rounded-md cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    ChatService.blockUser(partner.id);
                    setShowChatSettings(false);
                    setActiveConversation(null);
                    showToast('تم حظر المستخدم', 'info');
                  }}
                  className="w-full p-4 flex items-center justify-between text-start text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <span>Block</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setShowChatSettings(false);
                    setReportModal({ isOpen: true, targetUser: partner });
                  }}
                  className="w-full p-4 flex items-center justify-between text-start text-amber-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <span>Report User</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setShowChatSettings(false);
                    showToast('تم إلغاء المتابعة', 'info');
                  }}
                  className="w-full py-3.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-300 transition cursor-pointer"
                >
                  Unfollow
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة بطاقة العلاقة الفاخرة (COUPLE INTIMACY MODAL مطابقة للفيديو) */}
      <AnimatePresence>
        {showCoupleModal && relationship && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
            <div className="fixed inset-0" onClick={() => setShowCoupleModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-gradient-to-b from-pink-100 via-rose-50/50 to-white dark:from-slate-900 dark:via-pink-950/20 dark:to-slate-900 rounded-[32px] shadow-2xl border border-pink-200 dark:border-pink-900/40 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 flex items-center justify-between border-b border-pink-200/50 dark:border-slate-800">
                <button 
                  onClick={() => setShowCoupleModal(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Trophy className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </button>
                <h3 className="font-black text-sm text-pink-900 dark:text-pink-200">
                  {relationship.relationship_title || 'Couple'}
                </h3>
                <div className="relative">
                  <button 
                    onClick={() => setCoupleMenuOpen(!coupleMenuOpen)}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>

                  {coupleMenuOpen && (
                    <div className="absolute end-0 top-8 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-20 text-xs font-semibold">
                      <button
                        onClick={() => {
                          const nextType = relationship.relationship_type === 'couple' ? 'friendship' : 'couple';
                          RelationshipService.setRelationshipType(relationship.id, nextType);
                          setCoupleMenuOpen(false);
                          showToast(nextType === 'couple' ? 'تم التحويل إلى ارتباط (قلب 💖)' : 'تم التحويل إلى صداقة (زهرة 🌸)', 'success');
                        }}
                        className="w-full px-4 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {relationship.relationship_type === 'couple' ? 'Switch to Friendship 🌸' : 'Switch to Couple 💖'}
                      </button>
                      <button
                        onClick={() => {
                          RelationshipService.toggleHideRelationship(relationship.id);
                          setCoupleMenuOpen(false);
                          showToast('تم تغيير حالة الظهور', 'info');
                        }}
                        className="w-full px-4 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Hide
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('Enter new relationship title:', relationship.relationship_title);
                          if (newName) {
                            RelationshipService.renameRelationship(relationship.id, newName.trim());
                            showToast('تم تغيير الاسم', 'success');
                          }
                          setCoupleMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setCoupleMenuOpen(false);
                          showToast('تفاصيل العلاقة نشطة ومستمرة', 'info');
                        }}
                        className="w-full px-4 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to end this relationship?')) {
                            RelationshipService.endRelationship(relationship.id);
                            setShowCoupleModal(false);
                            showToast('تم إنهاء العلاقة', 'info');
                          }
                        }}
                        className="w-full px-4 py-2 text-start text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-slate-100 dark:border-slate-700"
                      >
                        End
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 overflow-y-auto space-y-4">
                <div className="relative flex items-center justify-around py-3">
                  <div className="flex flex-col items-center">
                    <Avatar src={currentUser?.profile_photo} name={currentUser?.display_name || ''} size="lg" />
                    <span className="text-[11px] font-bold mt-1.5 truncate max-w-[80px]">{currentUser?.display_name}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs shadow-md border-2 border-white dark:border-slate-800">
                      {relationship.days_count} days {relationship.relationship_type === 'couple' ? '💖' : '🌸'}
                    </div>
                    <span className="w-16 h-0.5 bg-pink-300 dark:bg-pink-700 mt-2 rounded-full" />
                  </div>

                  <div className="flex flex-col items-center">
                    <Avatar src={partner.profile_photo} name={partner.display_name} size="lg" />
                    <span className="text-[11px] font-bold mt-1.5 truncate max-w-[80px]">{partner.display_name}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-pink-200/60 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-pink-600 dark:text-pink-400">Lv.{relationship.level}</span>
                    <span className="text-[10px] font-mono text-slate-500">{relationship.current_points} / {relationship.max_points_for_level}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (relationship.current_points / relationship.max_points_for_level) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-pink-600 dark:text-pink-400 mt-1.5 font-bold text-center">
                    Reach Lv.{relationship.level + 4}: Unlock Advanced relationship card background
                  </p>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-pink-200/60 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 block mb-2 text-center">✨ Token (الخواتم والأوسمة)</span>
                  <div className="flex items-center justify-center gap-4">
                    {relationship.tokens.map((token) => (
                      <div key={token.id} className="flex flex-col items-center p-2 rounded-xl bg-pink-50 dark:bg-slate-900 border border-pink-200 dark:border-slate-700">
                        <span className="text-2xl">{token.icon}</span>
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 mt-1">{token.name_ar}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-pink-200/60 dark:border-slate-700 space-y-2.5">
                  <span className="text-xs font-bold text-slate-500 block text-center">🏆 Tasks & Achievements</span>
                  
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100">[Gifts] Private Chat, Rooms</h4>
                      <p className="text-[9px] text-slate-400">+1/Each 800 Diamonds</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCoupleModal(false);
                        setGiftModal({ isOpen: true, targetUser: partner, conversationId: activeConversation.id });
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-[10px] font-black shadow-xs cursor-pointer active:scale-95"
                    >
                      GO
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100">[Chat] Private Messages</h4>
                      <p className="text-[9px] text-slate-400">+1/Chat Round • Daily limit 30 points</p>
                    </div>
                    <button
                      onClick={() => setShowCoupleModal(false)}
                      className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-xl text-[10px] font-black shadow-xs cursor-pointer active:scale-95"
                    >
                      GO
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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