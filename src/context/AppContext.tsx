// ============================================================================
// jopi Global Application Context (Production Safe Version)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Conversation, CallSession, FilterPreferences, 
  CallType, VoiceRoom, Message 
} from '../types';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { CallService } from '../services/callService';
import { WalletService } from '../services/walletService';
import { NotificationService } from '../services/notificationService';
import { socketService } from '../services/socketService';
import { ChatService } from '../services/chatService';
import { supabase } from '../services/supabaseClient'; 

export type NavTab = 'discover' | 'party' | 'messages' | 'matches' | 'wallet' | 'moments' | 'profile' | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  text: string;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  
  activeRoom: VoiceRoom | null;
  isRoomMinimized: boolean;
  openRoom: (room: VoiceRoom) => void;
  closeRoom: () => void;
  minimizeRoom: () => void;
  maximizeRoom: () => void;
  createRoomModalOpen: boolean;
  setCreateRoomModalOpen: (open: boolean) => void;
  roomGiftModal: { isOpen: boolean; room: VoiceRoom | null; targetName: string; targetCount: number };
  setRoomGiftModal: (data: { isOpen: boolean; room: VoiceRoom | null; targetName: string; targetCount: number }) => void;

  viewingUser: User | null;
  setViewingUser: (user: User | null) => void;
  matchCelebration: { isOpen: boolean; matchedUser: User | null };
  setMatchCelebration: (data: { isOpen: boolean; matchedUser: User | null }) => void;
  giftModal: { isOpen: boolean; targetUser: User | null; conversationId?: string };
  setGiftModal: (data: { isOpen: boolean; targetUser: User | null; conversationId?: string }) => void;
  filterModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  editProfileOpen: boolean;
  setEditProfileOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  reportModal: { isOpen: boolean; targetUser: User | null };
  setReportModal: (data: { isOpen: boolean; targetUser: User | null }) => void;
  
  callSession: CallSession | null;
  startCall: (targetUser: User, type: CallType) => void;
  acceptCall: () => void;
  endActiveCall: () => void;
  toggleCallMute: () => void;
  toggleCallSpeaker: () => void;
  toggleCallVideo: () => void;
  switchCallCamera: () => void;

  filters: FilterPreferences;
  updateFilters: (newFilters: Partial<FilterPreferences>) => void;
  resetFilters: () => void;

  deckRefreshKey: number;
  refreshDeck: () => void;

  coinBalance: number;
  refreshWallet: () => void;

  unreadNotifsCount: number;
  refreshNotifications: () => void;

  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  shouldOpenTopUp: boolean;
  setShouldOpenTopUp: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_FILTERS: FilterPreferences = {
  age_min: 18,
  age_max: 35,
  gender_preference: 'everyone',
  country: 'all',
  max_distance_km: 50,
  online_only: false,
  verified_only: false,
  selected_interests: [],
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('discover');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [shouldOpenTopUp, setShouldOpenTopUp] = useState<boolean>(false);

  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState<boolean>(false);
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState<boolean>(false);
  const [roomGiftModal, setRoomGiftModal] = useState<{ isOpen: boolean; room: VoiceRoom | null; targetName: string; targetCount: number }>({
    isOpen: false,
    room: null,
    targetName: '',
    targetCount: 1,
  });

  const openRoom = (room: VoiceRoom) => {
    setActiveRoom(room);
    setIsRoomMinimized(false);
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser) {
      socketService.joinRoom(room.id, currentUser);
    }
  };

  const closeRoom = () => {
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (activeRoom && currentUser) {
      socketService.leaveRoom(activeRoom.id, currentUser);
    }
    setActiveRoom(null);
    setIsRoomMinimized(false);
  };

  const minimizeRoom = () => setIsRoomMinimized(true);
  const maximizeRoom = () => setIsRoomMinimized(false);

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{ isOpen: boolean; matchedUser: User | null }>({
    isOpen: false,
    matchedUser: null,
  });
  const [giftModal, setGiftModal] = useState<{ isOpen: boolean; targetUser: User | null; conversationId?: string }>({
    isOpen: false,
    targetUser: null,
  });
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [editProfileOpen, setEditProfileOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; targetUser: User | null }>({
    isOpen: false,
    targetUser: null,
  });

  const [callSession, setCallSession] = useState<CallSession | null>(null);

  const [deckRefreshKey, setDeckRefreshKey] = useState<number>(0);
  const refreshDeck = () => setDeckRefreshKey(prev => prev + 1);

  const [filters, setFilters] = useState<FilterPreferences>(() => {
    const saved = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, null);
    return saved?.filters || DEFAULT_FILTERS;
  });

  const updateFilters = (newFilters: Partial<FilterPreferences>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, {});
      StorageService.set(STORAGE_KEYS.USER_SETTINGS, { ...settings, filters: updated });
      return updated;
    });
    refreshDeck();
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, {});
    StorageService.set(STORAGE_KEYS.USER_SETTINGS, { ...settings, filters: DEFAULT_FILTERS });
    refreshDeck();
  };

  const [coinBalance, setCoinBalance] = useState<number>(() => WalletService.getCoinBalance());
  const refreshWallet = () => setCoinBalance(WalletService.getCoinBalance());

  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(() => NotificationService.getUnreadCount());
  const refreshNotifications = () => setUnreadNotifsCount(NotificationService.getUnreadCount());

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- عداد وقت المكالمة ---
  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (callSession?.status === 'connected') {
      timerInterval = setInterval(() => {
        setCallSession(prev => {
          if (!prev) return null;
          return { ...prev, duration_seconds: prev.duration_seconds + 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [callSession?.status, callSession?.id]);

  // --- تبادل حزم WebRTC لفتح الصوت والفيديو (مع إصلاح الـ Race Condition بنظام Ping-Pong) ---
  useEffect(() => {
    if (!callSession || callSession.status !== 'connected') return;

    const channelName = `webrtc_signal_${callSession.caller.id}_${callSession.receiver.id}`;
    const webrtcChannel = supabase.channel(channelName);

    CallService.onIceCandidate = (candidate) => {
      webrtcChannel.send({ type: 'broadcast', event: 'ice_candidate', payload: { candidate } });
    };

    // 1. المستقبل يتلقى سؤال المتصل ويرد عليه بتأكيد أنه جاهز تماماً
    webrtcChannel.on('broadcast', { event: 'caller_ping' }, () => {
      const isCaller = (callSession as any).isOutgoing;
      if (!isCaller) {
        webrtcChannel.send({ type: 'broadcast', event: 'receiver_ready', payload: {} });
      }
    });

    // 2. المتصل يتلقى التأكيد فيبدأ فوراً بإرسال حزم الاتصال الحقيقية (Offer)
    webrtcChannel.on('broadcast', { event: 'receiver_ready' }, async () => {
      const isCaller = (callSession as any).isOutgoing;
      if (isCaller) {
        const offer = await CallService.generateOffer();
        if (offer) {
          webrtcChannel.send({ type: 'broadcast', event: 'offer', payload: { offer } });
        }
      }
    });

    // 3. المستقبل يستقبل حزم الاتصال ويرد عليها
    webrtcChannel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
      const isCaller = (callSession as any).isOutgoing;
      if (!isCaller) {
        const answer = await CallService.handleOfferAndCreateAnswer(payload.offer);
        if (answer) {
          webrtcChannel.send({ type: 'broadcast', event: 'answer', payload: { answer } });
        }
      }
    });

    // 4. المتصل يتلقى الرد ويتم الاتصال
    webrtcChannel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
      await CallService.handleAnswer(payload.answer);
    });

    webrtcChannel.on('broadcast', { event: 'ice_candidate' }, async ({ payload }) => {
      await CallService.handleIceCandidate(payload.candidate);
    });

    webrtcChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const isCaller = (callSession as any).isOutgoing;
        if (!isCaller) {
          webrtcChannel.send({ type: 'broadcast', event: 'receiver_ready', payload: {} });
        } else {
          webrtcChannel.send({ type: 'broadcast', event: 'caller_ping', payload: {} });
        }
      }
    });

    return () => {
      CallService.onIceCandidate = null;
      supabase.removeChannel(webrtcChannel);
    };
  }, [callSession?.status, callSession?.id]);

  const startCall = async (targetUser: User, type: CallType) => {
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (!currentUser) return;

    const session: CallSession & { isOutgoing?: boolean } = {
      id: `call-${Date.now()}`,
      caller: currentUser,
      receiver: targetUser,
      call_type: type,
      status: 'ringing',
      duration_seconds: 0,
      is_muted: false,
      is_speaker_on: true,
      is_video_enabled: type === 'video',
      started_at: new Date().toISOString(),
      isOutgoing: true,
    };

    setCallSession(session as CallSession);

    await CallService.initMediaStream(type);
    CallService.startCall(targetUser, type);
    socketService.initiateCall(targetUser.id, currentUser, type);
  };

  const acceptCall = () => {
    setCallSession(prev => {
      if (!prev) return null;

      CallService.initMediaStream(prev.call_type).then(() => {
        setCallSession(current => {
          if (!current) return null;
          const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
          if (currentUser) {
            (socketService as any).acceptCall?.(current.caller.id, currentUser);
          }
          return { ...current, status: 'connected' };
        });
      });

      return prev;
    });
  };

  const endActiveCall = () => {
    setCallSession(prev => {
      if (!prev) return null;
      const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      const targetId = prev.caller.id === currentUser?.id ? prev.receiver.id : prev.caller.id;
      socketService.endCall(targetId);
      CallService.endCall(prev);
      showToast('المكالمة انتهت', 'info');
      return null;
    });
  };

  const toggleCallMute = () => {
    setCallSession(prev => prev ? CallService.toggleMute(prev) : null);
  };

  const toggleCallSpeaker = () => {
    setCallSession(prev => prev ? CallService.toggleSpeaker(prev) : null);
  };

  const toggleCallVideo = () => {
    setCallSession(prev => prev ? CallService.toggleVideo(prev) : null);
  };

  const switchCallCamera = () => {
    setCallSession(prev => prev ? CallService.switchCamera(prev) : null);
  };

  useEffect(() => {
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const isAuthenticated = StorageService.get<boolean>(STORAGE_KEYS.IS_AUTHENTICATED, false);

    if (!currentUser || !isAuthenticated || !currentUser.id || currentUser.id.startsWith('user-')) {
      return; 
    }

    const stopAutoGreetings = ChatService.startAutoGreetingScheduler((msg: Message) => {
      refreshNotifications();
      showToast(`💬 رسالة جديدة: "${msg.text?.slice(0, 30)}..."`, 'info');
    });

    socketService.init(currentUser);

    socketService.onMatchAlert(({ matchedUser }) => {
      setMatchCelebration({ isOpen: true, matchedUser });
      showToast(`🎉 إنه تطابق حقيقي مع ${matchedUser.display_name}!`, 'success');
    });

    socketService.onNewMessage((message: Message) => {
      ChatService.receiveIncomingMessage(message);
      refreshNotifications();
      showToast(`💬 رسالة جديدة من ${message.sender_id}`, 'info');
    });

    socketService.onIncomingCall(({ caller, callType }) => {
      if (caller.id === currentUser.id) return;

      const incomingSession: CallSession & { isOutgoing?: boolean } = {
        id: `call-${Date.now()}`,
        caller, 
        receiver: currentUser, 
        call_type: callType,
        status: 'ringing',
        duration_seconds: 0,
        is_muted: false,
        is_speaker_on: true,
        is_video_enabled: callType === 'video',
        started_at: new Date().toISOString(),
        isOutgoing: false, 
      };
      setCallSession(incomingSession as CallSession);
      showToast(`📞 مكالمة واردة من ${caller.display_name}...`, 'info');
    });

    socketService.onCallTerminated(() => {
      CallService.endCall();
      setCallSession(null);
      showToast('تم إنهاء المكالمة من الطرف الآخر', 'info');
    });

    socketService.onCallConnected(() => {
       setCallSession(prev => prev ? { ...prev, status: 'connected' } : null);
    });

    return () => {
      stopAutoGreetings();
    };
  }, []);

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      activeConversation,
      setActiveConversation,
      activeRoom,
      isRoomMinimized,
      openRoom,
      closeRoom,
      minimizeRoom,
      maximizeRoom,
      createRoomModalOpen,
      setCreateRoomModalOpen,
      roomGiftModal,
      setRoomGiftModal,
      viewingUser,
      setViewingUser,
      matchCelebration,
      setMatchCelebration,
      giftModal,
      setGiftModal,
      filterModalOpen,
      setFilterModalOpen,
      editProfileOpen,
      setEditProfileOpen,
      notificationsOpen,
      setNotificationsOpen,
      reportModal,
      setReportModal,
      callSession,
      startCall,
      acceptCall,
      endActiveCall,
      toggleCallMute,
      toggleCallSpeaker,
      toggleCallVideo,
      switchCallCamera,
      filters,
      updateFilters,
      resetFilters,
      deckRefreshKey,
      refreshDeck,
      coinBalance,
      refreshWallet,
      unreadNotifsCount,
      refreshNotifications,
      toasts,
      showToast,
      removeToast,
      shouldOpenTopUp,
      setShouldOpenTopUp,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};