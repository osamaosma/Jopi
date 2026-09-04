// ============================================================================
// MingleUp Private Chat Screen
// Real-time chat with text, voice notes, gifts, emojis, typing indicator & call triggers
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Phone, Video, MoreVertical, 
  Send, Mic, Gift as GiftIcon, Image as ImageIcon, 
  Smile, CheckCheck, Play, Pause, ShieldAlert, Ban,
  Volume2, Sparkles, X
} from 'lucide-react';
import { Message, Conversation, Gift } from '../../types';
import { ChatService } from '../../services/chatService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { Avatar } from '../common/Avatar';

const QUICK_EMOJIS = ['❤️', '😍', '🔥', '☕', '✨', '🌹', '👏', '😂', '🎉', '🥰'];

export const ChatScreen: React.FC = () => {
  const { 
    activeConversation, 
    setActiveConversation, 
    startCall, 
    setGiftModal, 
    setReportModal, 
    setViewingUser,
    showToast 
  } = useApp();
  const { user: currentUser } = useAuth();
  const { t, isRTL } = useLang();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Voice Recording Simulator
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Audio Playback simulation
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partner = activeConversation?.partner;

  // Load messages, mark read & subscribe to Supabase Realtime
  useEffect(() => {
    if (!activeConversation) return;

    // Load initial messages
    const msgs = ChatService.getMessages(activeConversation.id);
    setMessages(msgs);
    ChatService.markAsRead(activeConversation.id);

    // Setup Supabase Realtime listener for new incoming messages
    const subscription = ChatService.subscribeToMessages(activeConversation.id, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeConversation?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice recording timer
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

  if (!activeConversation || !partner) return null;

  const handleSendMessage = async (customText?: string, type: 'text' | 'voice' | 'image' = 'text', mediaUrl?: string, duration?: number) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend && type === 'text') return;

    const newMsg = await ChatService.sendMessage({
      conversationId: activeConversation.id,
      receiverId: partner.id,
      messageType: type,
      text: textToSend,
      mediaUrl,
      mediaDuration: duration,
    });

    setMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    setInputText('');
    setShowEmojiBar(false);

    // Trigger simulated bot reply
    setIsTyping(true);
    ChatService.triggerSimulatedReply(
      activeConversation.id,
      partner.id,
      type === 'voice' ? 'voice' : 'default',
      (reply) => {
        setIsTyping(false);
        setMessages(prev => {
          if (prev.some(m => m.id === reply.id)) return prev;
          return [...prev, reply];
        });
      }
    );
  };

  const handleSendVoiceNote = () => {
    setIsRecording(false);
    const duration = Math.max(2, recordSeconds);
    handleSendMessage(`تسجيل صوتي (0:${duration < 10 ? '0' : ''}${duration})`, 'voice', 'mock_audio.mp3', duration);
    showToast('تم إرسال التسجيل الصوتي 🎙️', 'success');
  };

  const handleSendMockPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
    ];
    const photoUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    handleSendMessage('أرسل صورة 📸', 'image', photoUrl);
    showToast('تمت مشاركة الصورة بنجاح', 'success');
  };

  const toggleAudioPlay = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-white select-none transition-colors">
      
      {/* CHAT HEADER */}
      <div className="h-16 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => setActiveConversation(null)}
            className="p-2 -ms-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>

          {/* Partner Info */}
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

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          {/* Voice Call */}
          <button
            onClick={() => startCall(partner, 'voice')}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95"
            title={t('callVoice')}
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => startCall(partner, 'video')}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 transition active:scale-95"
            title={t('callVideo')}
          >
            <Video className="w-4 h-4" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-purple-600 dark:text-purple-400"
                >
                  <GiftIcon className="w-4 h-4" />
                  <span>{t('sendGift')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setReportModal({ isOpen: true, targetUser: partner });
                  }}
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-amber-600 dark:text-amber-400"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t('reportUser')}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setViewingUser(partner);
                  }}
                  className="w-full px-4 py-2.5 text-start hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-rose-600 dark:text-rose-400"
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
              {/* Message Bubble */}
              <div
                className={`max-w-[78%] rounded-2xl p-3 shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-tr from-brand-600 to-rose-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none'
                }`}
              >
                {/* 1. GIFT MESSAGE */}
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

                {/* 2. IMAGE MESSAGE */}
                {msg.message_type === 'image' && msg.media_url && (
                  <div className="rounded-xl overflow-hidden mb-1.5 max-h-56">
                    <img src={msg.media_url} alt="Media" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* 3. VOICE NOTE MESSAGE */}
                {msg.message_type === 'voice' && (
                  <div className="flex items-center gap-3 min-w-[180px] py-1">
                    <button
                      onClick={() => toggleAudioPlay(msg.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 shadow-md ${
                        isMe ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ms-0.5" />
                      )}
                    </button>

                    {/* Animated waveform bars */}
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

                {/* 4. TEXT CONTENT */}
                {msg.text && msg.message_type !== 'voice' && (
                  <p className="text-xs leading-relaxed font-normal">
                    {msg.text}
                  </p>
                )}

                {/* Time & Read Status */}
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

        {/* TYPING INDICATOR */}
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
                className="text-xl p-1.5 hover:scale-125 transition active:scale-95"
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
              className="p-1.5 rounded-lg bg-black/20 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handleSendVoiceNote}
              className="px-3 py-1.5 rounded-lg bg-white text-rose-600 text-xs font-bold shadow"
            >
              إرسال
            </button>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 z-20">
        
        {/* Gift Trigger */}
        <button
          onClick={() => setGiftModal({ isOpen: true, targetUser: partner, conversationId: activeConversation.id })}
          className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:scale-105 transition active:scale-95 shadow-sm"
          title={t('sendGift')}
        >
          <GiftIcon className="w-5 h-5" />
        </button>

        {/* Photo Attachment */}
        <button
          onClick={handleSendMockPhoto}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Attach Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Emoji Trigger */}
        <button
          onClick={() => setShowEmojiBar(prev => !prev)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('typeMessagePlaceholder')}
          className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
        />

        {/* Voice Note Record / Text Send Button */}
        {inputText.trim() ? (
          <button
            onClick={() => handleSendMessage()}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md shadow-brand-500/30 hover:scale-105 active:scale-95 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsRecording(true)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-slate-200 transition active:scale-95"
            title="Record Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};