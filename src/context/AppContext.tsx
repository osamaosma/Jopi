// ============================================================================
// MingleUp Global Application Context (Production Safe Version)
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

  const startCall = (targetUser: User, type: CallType) => {
    const session = CallService.startCall(targetUser, type);
    setCallSession(session);
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser) {
      socketService.initiateCall(targetUser.id, currentUser, type);
    }
  };

  const endActiveCall = () => {
    if (callSession) {
      socketService.endCall(callSession.receiver.id);
      CallService.endCall(callSession);
      setCallSession(null);
      showToast('المكالمة انتهت', 'info');
    }
  };

  const toggleCallMute = () => {
    if (callSession) setCallSession(CallService.toggleMute(callSession));
  };

  const toggleCallSpeaker = () => {
    if (callSession) setCallSession(CallService.toggleSpeaker(callSession));
  };

  const toggleCallVideo = () => {
    if (callSession) setCallSession(CallService.toggleVideo(callSession));
  };

  const switchCallCamera = () => {
    if (callSession) setCallSession(CallService.switchCamera(callSession));
  };

  // حماية التأكد من تسجيل الدخول الحقيقي قبل تشغيل الخدمات السحابية والترحيب التلقائي
  useEffect(() => {
    const currentUser = StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const isAuthenticated = StorageService.get<boolean>(STORAGE_KEYS.IS_AUTHENTICATED, false);

    if (!currentUser || !isAuthenticated || !currentUser.id || currentUser.id.startsWith('user-')) {
      return; // إيقاف الخدمات المؤقتة إذا لم يتم تسجيل الدخول بـ Supabase
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
      const incomingSession: CallSession = {
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
      };
      setCallSession(incomingSession);
      showToast(`📞 مكالمة واردة من ${caller.display_name}...`, 'info');
    });

    socketService.onCallTerminated(() => {
      setCallSession(null);
      showToast('تم إنهاء المكالمة من الطرف الآخر', 'info');
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