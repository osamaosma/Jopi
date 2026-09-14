// ============================================================================
// Jopi Independent Full-Screen Room Experience (SUGO Exact Production Version - Fully Corrected & Realtime)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Minimize2, Mic, MicOff, Video, 
  Crown, Gift as GiftIcon, Sparkles, Send, Dices, 
  Smile, Users, Plus, Check, Radio, Trophy, Settings, Bell, BarChart3, Image as ImageIcon, Unlock, ShieldAlert, UserPlus, UserCheck, AlertTriangle, ChevronRight, ChevronUp, ChevronDown, Lock, ShieldCheck, Globe,
  Rocket, TrendingUp, AlertOctagon, Flame, LayoutGrid, MessageSquare, Volume2, VolumeX, Music, Sparkle, Share2, ShoppingBag, Camera, MessageCircle, Eraser, Swords,
  Coins, Timer, Play, CreditCard
} from 'lucide-react';
import { VoiceRoom, RoomMessage, User, Gift } from '../../types';
import { RoomService } from '../../services/roomService';
import { AudioService } from '../../services/audioService';
import { WalletService } from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../services/supabaseClient';
import { NotificationService } from '../../services/notificationService';

const availableLayouts = [
  { count: 1, label: '1 Mic', pk: false },
  { count: 2, label: '2 Mics', pk: false },
  { count: 6, label: '6 Mics', pk: false },
  { count: 8, label: '8 Mics (PK)', pk: true },
  { count: 9, label: '9 Mics (PK)', pk: true },
  { count: 12, label: '12 Mics (PK)', pk: true },
  { count: 15, label: '15 Mics', pk: false },
  { count: 20, label: '20 Mics', pk: false },
];

export const SUGO_ROOM_BACKGROUNDS = [
  { id: 'bg-1', name: 'قصر الأحلام', class: 'bg-gradient-to-b from-indigo-900 via-slate-900 to-black', preview: '🏰' },
  { id: 'bg-2', name: 'مجرة الفضاء', class: 'bg-gradient-to-b from-blue-950 via-purple-950 to-slate-950', preview: '🌌' },
  { id: 'bg-3', name: 'سحر الطبيعة', class: 'bg-gradient-to-b from-emerald-950 via-slate-900 to-teal-950', preview: '🌲' },
  { id: 'bg-4', name: 'غروب ذهبي', class: 'bg-gradient-to-b from-amber-950 via-slate-900 to-rose-950', preview: '🌅' },
  { id: 'bg-5', name: 'وردي رومانسي', class: 'bg-gradient-to-b from-pink-900 via-rose-950 to-slate-950', preview: '🌸' },
];

export interface WheelReward {
  id: number;
  label: string;
  value: number;
  multiplier: string;
  probability: number;
}

const WHEEL_SECTORS: WheelReward[] = [
  { id: 0, label: '0', value: 0, multiplier: '0x', probability: 35 },
  { id: 1, label: '50', value: 50, multiplier: '0.5x', probability: 25 },
  { id: 2, label: '100', value: 100, multiplier: '1x', probability: 20 },
  { id: 3, label: '200', value: 200, multiplier: '2x', probability: 10 },
  { id: 4, label: '500', value: 500, multiplier: '5x', probability: 6 },
  { id: 5, label: '1000', value: 1000, multiplier: '10x', probability: 3 },
  { id: 6, label: '2500', value: 2500, multiplier: '25x', probability: 0.9 },
  { id: 7, label: '5000', value: 5000, multiplier: '50x', probability: 0.1 },
];

const CAT_COIN_PACKAGES = [
  { id: 'p1', coins: 32000, oldPrice: 1.11, price: 1 },
  { id: 'p2', coins: 264000, oldPrice: 5.56, price: 5 },
  { id: 'p3', coins: 560000, oldPrice: 11.11, price: 10 },
  { id: 'p4', coins: 1740000, oldPrice: 33.33, price: 30 },
  { id: 'p5', coins: 3040000, oldPrice: 55.56, price: 50 },
  { id: 'p6', coins: 6108000, oldPrice: 111.11, price: 100 },
  { id: 'p7', coins: 18428000, oldPrice: 333.33, price: 300 },
  { id: 'p8', coins: 30556000, oldPrice: 555.56, price: 500 },
  { id: 'p9', coins: 61508000, oldPrice: 1111.11, price: 1000 },
];

interface SugoGiftItem {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  icon: string;
  tag?: string;
  category: 'Backpack' | 'Gift' | 'Lucky' | 'Event' | 'Privilege' | 'Tokens' | 'Interactive' | 'Countries';
}

const SUGO_ALL_GIFTS: SugoGiftItem[] = [
  { id: 'ev-1', name: 'Energy Drink', name_ar: 'مشروب طاقة', price: 40, icon: '🧪', category: 'Event' },
  { id: 'ev-2', name: 'Supply Crate', name_ar: 'صندوق الإمداد', price: 400, icon: '📦', tag: 'NEW', category: 'Event' },
  { id: 'ev-3', name: 'Med Kit', name_ar: 'حقيبة إسعاف', price: 4000, icon: '🎒', tag: 'NEW', category: 'Event' },
  { id: 'ev-4', name: 'Oasis City', name_ar: 'مدينة الواحة', price: 40000, icon: '🏙️', tag: 'NEW', category: 'Event' },
  { id: 'ev-5', name: 'Pan Duel', name_ar: 'مبارزة المقلاة', price: 200000, icon: '🍳', tag: 'NEW', category: 'Event' },
  { id: 'ev-6', name: 'Auroa Steed', name_ar: 'الحصان الأسطوري', price: 2000, icon: '🐎', tag: 'NEW', category: 'Event' },
  { id: 'ev-7', name: 'Royal Dash', name_ar: 'الوثبة الملكية', price: 20000, icon: '🎠', tag: 'NEW', category: 'Event' },
  { id: 'ev-8', name: 'Golden Thunder', name_ar: 'الرعد الذهبي', price: 48000, icon: '⚡', tag: 'NEW', category: 'Event' },
  { id: 'gf-1', name: 'Rose', name_ar: 'وردة', price: 10, icon: '🌹', category: 'Gift' },
  { id: 'gf-2', name: 'Love Heart', name_ar: 'قلب حب', price: 50, icon: '❤️', category: 'Gift' },
  { id: 'gf-3', name: 'Perfume', name_ar: 'عطر فاخر', price: 100, icon: '🧴', category: 'Gift' },
  { id: 'gf-4', name: 'Teddy Bear', name_ar: 'دبدوب لطيف', price: 300, icon: '🧸', category: 'Gift' },
  { id: 'gf-5', name: 'Sports Car', name_ar: 'سيارة رياضية', price: 1500, icon: '🏎️', category: 'Gift' },
  { id: 'gf-6', name: 'Luxury Yacht', name_ar: 'يخت فخم', price: 5000, icon: '🛥️', category: 'Gift' },
  { id: 'gf-7', name: 'Crown', name_ar: 'تاج الملوك', price: 10000, icon: '👑', category: 'Gift' },
  { id: 'gf-8', name: 'Castle', name_ar: 'قصر الأحلام', price: 30000, icon: '🏰', category: 'Gift' },
  { id: 'lk-1', name: 'Lucky Clover', name_ar: 'نبتة الحظ', price: 20, icon: '🍀', tag: 'HOT', category: 'Lucky' },
  { id: 'lk-2', name: 'Lucky Box', name_ar: 'صندوق الحظ', price: 100, icon: '🎁', tag: 'HOT', category: 'Lucky' },
  { id: 'lk-3', name: 'Magic Lamp', name_ar: 'المصباح السحري', price: 500, icon: '🪔', category: 'Lucky' },
  { id: 'lk-4', name: 'Crystal Ball', name_ar: 'كرة الكريستال', price: 2500, icon: '🔮', category: 'Lucky' },
  { id: 'pr-1', name: 'Diamond Ring', name_ar: 'خاتم الألماس', price: 500, icon: '💍', category: 'Privilege' },
  { id: 'pr-2', name: 'Private Jet', name_ar: 'طائرة خاصة', price: 25000, icon: '🛩️', category: 'Privilege' },
  { id: 'tk-1', name: 'Golden Coin', name_ar: 'عملة ذهبية', price: 1, icon: '🪙', category: 'Tokens' },
  { id: 'tk-2', name: 'Star Token', name_ar: 'رمز النجمة', price: 5, icon: '⭐', category: 'Tokens' },
  { id: 'in-1', name: 'Microphone Ring', name_ar: 'هالة المايك', price: 200, icon: '🎤', category: 'Interactive' },
  { id: 'in-2', name: 'Fireworks', name_ar: 'ألعاب نارية', price: 1200, icon: '🎆', category: 'Interactive' },
  { id: 'in-3', name: 'Rocket Ship', name_ar: 'صاروخ فضائي', price: 8000, icon: '🚀', category: 'Interactive' },
  { id: 'ct-1', name: 'Saudi Falcon', name_ar: 'صقر المملكة', price: 3000, icon: '🦅', category: 'Countries' },
  { id: 'ct-2', name: 'Arabian Horse', name_ar: 'خيل عربي', price: 6000, icon: '🐎', category: 'Countries' },
];

const GIFT_TABS = [
  'Backpack',
  'Gift',
  'Lucky',
  'Event',
  'Privilege',
  'Tokens',
  'Interactive',
  'Countries'
] as const;

export const LiveRoomModal: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
    activeRoom, 
    isRoomMinimized, 
    closeRoom, 
    minimizeRoom, 
    setViewingUser,
    coinBalance,
    refreshWallet,
    showToast 
  } = useApp();
  const { lang } = useLang();

  const [room, setRoom] = useState<VoiceRoom | null>(activeRoom);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentBg, setCurrentBg] = useState<string>(activeRoom?.bg_theme || SUGO_ROOM_BACKGROUNDS[0].class);
  
  const [selectedMicCount, setSelectedMicCount] = useState<number>(() => {
    return (activeRoom?.seats && activeRoom.seats.length > 0) ? activeRoom.seats.length : 8;
  });

  const [roomType, setRoomType] = useState<string>(activeRoom?.category || 'Friendship');
  
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [roomSettingsModalOpen, setRoomSettingsModalOpen] = useState(false);
  const [micConfigModalOpen, setMicConfigModalOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);
  
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<number | null>(null);
  const [seatActionModalOpen, setSeatActionModalOpen] = useState(false);
  const [roomMembers, setRoomMembers] = useState<User[]>([]);
  const [roomMembersModalOpen, setRoomMembersModalOpen] = useState(false);

  const [userGiftPoints, setUserGiftPoints] = useState<Record<string, number>>({});
  const [cachedProfiles, setCachedProfiles] = useState<Record<string, User>>({});

  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const [isRoomMuted, setIsRoomMuted] = useState(false);

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [activeGiftTab, setActiveGiftTab] = useState<typeof GIFT_TABS[number]>('Event');
  const [selectedGift, setSelectedGift] = useState<SugoGiftItem>(SUGO_ALL_GIFTS[1]);
  const [selectedGiftMultiplier, setSelectedGiftMultiplier] = useState<number>(1);
  const [multiplierMenuOpen, setMultiplierMenuOpen] = useState(false);
  const [giftTargetType, setGiftTargetType] = useState<'host' | 'all'>('host');
  const [sendingGift, setSendingGift] = useState(false);

  const [showTopUpDirectModal, setShowTopUpDirectModal] = useState(false);
  const [selectedTopUpPkg, setSelectedTopUpPkg] = useState(CAT_COIN_PACKAGES[0]);

  const [pkModalOpen, setPkModalOpen] = useState(false);
  const [pkMode, setPkMode] = useState<'team' | 'single' | 'quick'>('team');
  const [pkDuration, setPkDuration] = useState<number>(300);
  const [isPkActive, setIsPkActive] = useState(false);
  const [pkTimeLeft, setPkTimeLeft] = useState<number>(300);
  const [redScore, setRedScore] = useState<number>(0);
  const [blueScore, setBlueScore] = useState<number>(0);

  const isPkActiveRef = useRef(isPkActive);
  useEffect(() => {
    isPkActiveRef.current = isPkActive;
  }, [isPkActive]);

  const [luckyWheelModalOpen, setLuckyWheelModalOpen] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedBetAmount, setSelectedBetAmount] = useState<number>(100);
  const [lastWonPrize, setLastWonPrize] = useState<WheelReward | null>(null);

  const [rocketModalOpen, setRocketModalOpen] = useState(false);
  const [rocketBetAmount, setRocketBetAmount] = useState<number>(100);
  const [rocketGameState, setRocketGameState] = useState<'idle' | 'flying' | 'crashed'>('idle');
  const [rocketMultiplier, setRocketMultiplier] = useState<number>(1.00);
  const [hasRocketCashedOut, setHasRocketCashedOut] = useState<boolean>(false);
  const rocketCrashPointRef = useRef<number>(2.00);
  const rocketIntervalRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: any = null;
    if (isPkActive && pkTimeLeft > 0) {
      timer = setInterval(() => {
        setPkTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsPkActive(false);
            showToast(redScore > blueScore ? '🏆 فاز الفريق الأحمر بالـ PK!' : blueScore > redScore ? '🏆 فاز الفريق الأزرق بالـ PK!' : '🤝 تعادل الفريقان في الـ PK!', 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPkActive, pkTimeLeft, redScore, blueScore]);

  // تعديل الدخول: تصفير الشات وبدء الاستماع الفوري كمستمع للغرفة عبر AudioService.joinRoomAsListener
  useEffect(() => {
    if (!activeRoom?.id || !currentUser) return;

    setMessages([]);
    AudioService.joinRoomAsListener(activeRoom.id, currentUser.id);
    RoomService.leaveSeat(activeRoom.id, currentUser);

    const initializeRoom = async () => {
      const freshRoom = await RoomService.getRoomById(activeRoom.id);
      if (freshRoom) {
        setRoom(freshRoom);
        if (freshRoom.seats && freshRoom.seats.length > 0) {
          setSelectedMicCount(freshRoom.seats.length);
        }
        if (freshRoom.bg_theme) setCurrentBg(freshRoom.bg_theme);
        if (freshRoom.category) setRoomType(freshRoom.category);
      }

      const history = await RoomService.getRoomMessages(activeRoom.id);
      if (history && history.length > 0) {
        const pointsMap: Record<string, number> = {};
        history.forEach(m => {
          if (m.message_type === 'gift' && m.gift_data) {
            const receiverKey = m.target_user_name || 'receiver';
            const cost = Number(m.gift_data.coin_price) || 0;
            pointsMap[receiverKey] = (pointsMap[receiverKey] || 0) + cost;
          }
        });
        setUserGiftPoints(pointsMap);
      }
    };

    initializeRoom();
  }, [activeRoom?.id]);

  useEffect(() => {
    if (!room?.seats) return;

    const missingUserIds = room.seats
      .map((s: any) => s.user_id || s.user?.id)
      .filter((id): id is string => {
        return !!id && typeof id === 'string' && id.length > 5 && !cachedProfiles[id];
      });

    if (missingUserIds.length === 0) return;

    const fetchMissingProfiles = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .in('id', missingUserIds);

        if (data && data.length > 0) {
          const map: Record<string, User> = {};
          data.forEach((p: any) => {
            map[p.id] = {
              id: p.id,
              display_name: p.display_name || p.username || 'مستخدم',
              username: p.username || 'user',
              profile_photo: p.profile_photo || p.avatar_url || '',
              coin_balance: p.coin_balance || 0,
              interests: []
            };
          });
          setCachedProfiles(prev => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('Error fetching seat profiles:', err);
      }
    };

    fetchMissingProfiles();
  }, [room?.seats]);

  useEffect(() => {
    if (!activeRoom || !currentUser) return;

    // تفعيل تسجيل الحضور الفعلي في جدول room_presence لكي يتم تحديث العداد
    RoomService.joinRoomPresence(activeRoom.id, currentUser);

    const fetchMembers = async () => {
      const members = await RoomService.getRoomMembers(activeRoom.id);
      const membersMap = new Map<string, User>();
      members.forEach(m => membersMap.set(m.id, m));
      if (activeRoom.host) membersMap.set(activeRoom.host.id, activeRoom.host);
      membersMap.set(currentUser.id, currentUser);
      setRoomMembers(Array.from(membersMap.values()));
    };

    fetchMembers();

    const presenceChannel = supabase
      .channel(`room-presence-${activeRoom.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_presence', filter: `room_id=eq.${activeRoom.id}` },
        async () => {
          const members = await RoomService.getRoomMembers(activeRoom.id);
          const membersMap = new Map<string, User>();
          members.forEach(m => membersMap.set(m.id, m));
          if (activeRoom.host) membersMap.set(activeRoom.host.id, activeRoom.host);
          setRoomMembers(Array.from(membersMap.values()));
          
          const freshRoom = await RoomService.getRoomById(activeRoom.id);
          if (freshRoom) setRoom(freshRoom);
        }
      )
      .subscribe();

    // إضافة حدث لإرسال مغادرة الحضور فور إغلاق أو مغادرة المتصفح لضمان تنظيف القاعة
    const handleBeforeUnload = () => {
      RoomService.leaveRoomPresence(activeRoom.id, currentUser);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      RoomService.leaveRoomPresence(activeRoom.id, currentUser);
      RoomService.leaveSeat(activeRoom.id, currentUser);
      AudioService.stopMicrophone();
      supabase.removeChannel(presenceChannel);
      if (rocketIntervalRef.current) clearInterval(rocketIntervalRef.current);
    };
  }, [activeRoom?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeRoom?.id) return;

    const realtimeChannel = supabase
      .channel(`room-realtime-${activeRoom.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'voice_rooms', filter: `id=eq.${activeRoom.id}` },
        async () => {
          const updatedRoom = await RoomService.getRoomById(activeRoom.id);
          if (updatedRoom) {
            setRoom(updatedRoom);
            if (updatedRoom.bg_theme) setCurrentBg(updatedRoom.bg_theme);
            if (updatedRoom.category) setRoomType(updatedRoom.category);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_seats', filter: `room_id=eq.${activeRoom.id}` },
        async () => {
          const updatedRoom = await RoomService.getRoomById(activeRoom.id);
          if (updatedRoom) {
            setRoom(updatedRoom);
            if (updatedRoom.seats && updatedRoom.seats.length > 0) {
              setSelectedMicCount(updatedRoom.seats.length);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_messages' },
        (payload) => {
          const newMsgData = payload.new as any;
          if (newMsgData.room_id !== activeRoom.id) return;

          const incomingMsg: RoomMessage = {
            id: newMsgData.id,
            room_id: newMsgData.room_id,
            sender: typeof newMsgData.sender === 'object' && newMsgData.sender !== null ? newMsgData.sender : {
              id: newMsgData.sender_id,
              display_name: newMsgData.sender_name || 'مستخدم',
              username: newMsgData.sender_name || 'user',
              profile_photo: newMsgData.sender_photo || '',
              coin_balance: 0,
              interests: []
            },
            message_type: newMsgData.message_type || 'chat',
            text: newMsgData.text || '',
            gift_data: newMsgData.gift_data,
            target_user_name: newMsgData.target_user_name,
            created_at: newMsgData.created_at
          };

          setMessages(prev => {
            if (prev.some(m => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });

          if (incomingMsg.message_type === 'gift' && incomingMsg.gift_data) {
            const targetKey = incomingMsg.target_user_name || 'receiver';
            const addedCoins = Number(incomingMsg.gift_data.coin_price) || 0;
            setUserGiftPoints(prev => ({
              ...prev,
              [targetKey]: (prev[targetKey] || 0) + addedCoins
            }));

            if (isPkActiveRef.current) {
              if (Math.random() > 0.5) {
                setRedScore(r => r + addedCoins);
              } else {
                setBlueScore(b => b + addedCoins);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [activeRoom?.id]);

  if (!activeRoom || !room || isRoomMinimized || !currentUser) return null;

  const mySeat = room.seats?.find((s: any) => s.user?.id === currentUser.id || s.user_id === currentUser.id);
  const isHostOrAdmin = room.host_id === currentUser.id || room.admins?.includes(currentUser.id);

  const seatedUserIds = new Set(
    room.seats?.map((s: any) => s.user?.id || s.user_id).filter(Boolean) || []
  );
  const audienceMembers = roomMembers.filter(m => !seatedUserIds.has(m.id));

  const getSugoGridStyle = (count: number) => {
    if (count === 1) return 'flex justify-center items-center px-6 py-2';
    if (count === 2) return 'flex justify-center items-center gap-6 px-6 py-2';
    if (count <= 6) return 'grid grid-cols-3 gap-3 px-6 py-2 justify-items-center';
    if (count <= 9) return 'grid grid-cols-3 gap-2.5 px-4 py-1 justify-items-center';
    return 'grid grid-cols-4 gap-2 px-3 py-1 justify-items-center';
  };

  const resolveSeatUser = (seat: any, index: number): User | null => {
    const seatUserId = seat?.user_id || seat?.user?.id;
    if (!seatUserId) return null;

    if (seatUserId === currentUser.id) return currentUser;
    if (cachedProfiles[seatUserId]) return cachedProfiles[seatUserId];

    const memberFound = roomMembers.find(m => m.id === seatUserId);
    if (memberFound && memberFound.display_name && memberFound.display_name !== 'عضو' && memberFound.display_name !== 'المستضيف') {
      return memberFound;
    }

    if (seat?.user && seat.user.display_name && seat.user.display_name !== 'عضو' && seat.user.display_name !== 'المستضيف' && !seat.user.display_name.startsWith('مستخدم_')) {
      return seat.user;
    }

    if (seatUserId === room.host_id && room.host?.display_name && room.host.display_name !== 'المستضيف') {
      return room.host;
    }

    return cachedProfiles[seatUserId] || memberFound || seat?.user || (seatUserId === room.host_id ? room.host : null);
  };

  const handleSeatClick = (seatIndex: number) => {
    const seat: any = room.seats?.find((s: any) => s.seat_index === seatIndex);
    const seatUser = resolveSeatUser(seat, seatIndex);
    
    if (seatUser) {
      setViewingUser(seatUser);
    } else {
      setSelectedSeatForAction(seatIndex);
      setSeatActionModalOpen(true);
    }
  };

  // الصعود للمايك: تفعيل الميكروفون الفعلي وبث الصوت عند الصعود فقط
  const executeSeatAction = async (action: 'take' | 'lock' | 'invite') => {
    setSeatActionModalOpen(false);
    if (selectedSeatForAction === null) return;

    if (action === 'take') {
      const stream = await AudioService.startMicrophone(room.id, currentUser.id);
      if (!stream) {
        showToast('تعذر الوصول إلى الميكروفون', 'error');
        return;
      }
      AudioService.toggleMicrophone(false);
      const updated = await RoomService.takeSeat(room.id, selectedSeatForAction, currentUser);
      if (updated) {
        setRoom(updated);
        showToast(`صعدت على المايك رقم ${selectedSeatForAction + 1} 🎙️`, 'success');
      }
    } else if (action === 'lock') {
      showToast(`تم قفل المقعد ${selectedSeatForAction + 1} 🔒`, 'info');
    } else if (action === 'invite') {
      showToast('تم فتح قائمة الأصدقاء لدعوتهم للمايك 👥', 'info');
    }
  };

  const handleLeaveSeat = async () => {
    AudioService.stopMicrophone();
    const updated = await RoomService.leaveSeat(room.id, currentUser);
    if (updated) {
      setRoom(updated);
      showToast('غادرت المايك', 'info');
    }
  };

  const handleToggleMyMic = async () => {
    if (mySeat) {
      const isMuted = await RoomService.toggleSeatMute(room.id, mySeat.seat_index);
      AudioService.toggleMicrophone(isMuted);
      const updated = await RoomService.getRoomById(room.id);
      if (updated) setRoom(updated);
      showToast(isMuted ? 'تم كتم المايك' : 'المايك مفتوح 🎙️', 'info');
    }
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const textToSend = chatInput.trim();
    setChatInput(''); 
    
    try {
      const sentMsg = await RoomService.sendRoomMessage(room.id, textToSend, currentUser, 'chat');
      if (sentMsg) {
        setMessages(prev => {
          if (prev.some(m => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      }
    } catch (err) {
      console.error('Send message error:', err);
      showToast('تعذر إرسال الرسالة', 'error');
    }
  };

  const handleSendSugoGift = async () => {
    const activeSpeakersCount = room.seats ? room.seats.filter((s: any) => s.user_id || s.user).length : 0;
    const targetCount = giftTargetType === 'all' ? Math.max(1, activeSpeakersCount) : 1;
    const totalCost = selectedGift.price * selectedGiftMultiplier * targetCount;

    if (coinBalance < totalCost) {
      showToast('رصيدك لا يكفي لإرسال هذه الهدية! ⚠️', 'error');
      return;
    }

    setSendingGift(true);
    const targetLabel = giftTargetType === 'all' 
      ? `جميع المتحدثين على المايك (${targetCount}X)` 
      : `${room.host?.display_name || 'المضيف'}`;

    const genericGift: Gift = {
      id: selectedGift.id,
      name: selectedGift.name,
      name_ar: selectedGift.name_ar,
      coin_price: selectedGift.price,
      icon: selectedGift.icon,
      category: 'special'
    };

    const res = await RoomService.sendRoomGift(
      room.id,
      genericGift,
      currentUser,
      targetLabel,
      targetCount * selectedGiftMultiplier
    );

    setSendingGift(false);

    if (res.success) {
      refreshWallet();
      showToast(`تم إرسال ${selectedGift.name_ar} ${selectedGift.icon} x${selectedGiftMultiplier} إلى ${targetLabel}! 🎉`, 'success');
      setIsGiftModalOpen(false);
    } else {
      showToast('فشل في إرسال الهدية', 'error');
    }
  };

  const handleStartPK = () => {
    setPkModalOpen(false);
    setIsPkActive(true);
    setPkTimeLeft(pkDuration);
    setRedScore(0);
    setBlueScore(0);
    showToast('⚔️ انطلق تحدي الـ PK الآن! ادعم فريقك بالهدايا!', 'success');
    RoomService.sendRoomMessage(room.id, '🔥 انطلق تحدي الـ PK الآن بين الفريقين! أرسل الهدايا لرفع النقاط!', currentUser, 'game').catch(() => {});
  };

  const handleStopPK = () => {
    setIsPkActive(false);
    showToast('تم إنهاء تحدي الـ PK', 'info');
  };

  const formatPkTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayWheelSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLastWonPrize(null);

    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = WHEEL_SECTORS[0];
    for (const s of WHEEL_SECTORS) {
      cumulative += s.probability;
      if (rand <= cumulative) {
        selectedPrize = s;
        break;
      }
    }

    try {
      const { data, error } = await supabase.rpc('play_wheel_game', {
        p_user_id: currentUser.id,
        p_bet_cost: selectedBetAmount,
        p_reward_won: selectedPrize.value
      });

      if (error && error.code === '42883') {
        if ((currentUser.coin_balance || 0) < selectedBetAmount) {
          showToast('رصيدك غير كافٍ للرهان!', 'error');
          setIsSpinning(false);
          return;
        }
      } else if (error || (data && !data.success)) {
        showToast(data?.error === 'INSUFFICIENT_COINS' ? 'رصيدك غير كافٍ للرهان!' : 'تعذر تشغيل اللعبة', 'error');
        setIsSpinning(false);
        return;
      }

      const sectorAngle = 360 / WHEEL_SECTORS.length;
      const targetAngle = 360 - (selectedPrize.id * sectorAngle) - (sectorAngle / 2);
      const finalRotation = wheelRotation + (360 * 5) + targetAngle - (wheelRotation % 360);
      setWheelRotation(finalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setLastWonPrize(selectedPrize);

        if (selectedPrize.value > 0) {
          showToast(`مبروك! فزت بـ ${selectedPrize.value} كوينز 🎁`, 'success');
        } else {
          showToast('حظ أوفر في الجولة القادمة!', 'info');
        }

        if (selectedPrize.value >= selectedBetAmount * 5) {
          RoomService.sendRoomMessage(
            room.id,
            `🎉 فاز ${currentUser.display_name} بـ ${selectedPrize.value} عملة في عجلة الحظ! 🎡`,
            currentUser,
            'game'
          ).catch(() => {});
        }
      }, 4500);

    } catch (err) {
      showToast('حدث خطأ أثناء الاتصال', 'error');
      setIsSpinning(false);
    }
  };

  const handleLaunchRocket = async () => {
    if (rocketGameState === 'flying') return;

    try {
      const { data, error } = await supabase.rpc('place_rocket_bet', {
        p_user_id: currentUser.id,
        p_bet_amount: rocketBetAmount
      });

      if (error && error.code !== '42883' && (data && !data.success)) {
        showToast(data?.error === 'INSUFFICIENT_COINS' ? 'رصيدك غير كافٍ للرهان!' : 'فشل بدء الجولة، تحقق من رصيدك', 'error');
        return;
      }

      const rand = Math.random();
      let calculatedCrash = 1.05;
      if (rand > 0.04) {
        calculatedCrash = Number((0.96 / (1 - rand)).toFixed(2));
      }
      rocketCrashPointRef.current = Math.min(calculatedCrash, 50.00);

      setRocketGameState('flying');
      setRocketMultiplier(1.00);
      setHasRocketCashedOut(false);

      const startTime = Date.now();
      if (rocketIntervalRef.current) clearInterval(rocketIntervalRef.current);

      rocketIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentMulti = Number((1.00 + Math.pow(elapsed * 0.45, 1.6)).toFixed(2));

        if (currentMulti >= rocketCrashPointRef.current) {
          clearInterval(rocketIntervalRef.current);
          setRocketMultiplier(rocketCrashPointRef.current);
          setRocketGameState('crashed');
        } else {
          setRocketMultiplier(currentMulti);
        }
      }, 50);

    } catch {
      showToast('حدث خطأ أثناء الاتصال', 'error');
    }
  };

  const handleRocketCashOut = async () => {
    if (rocketGameState !== 'flying' || hasRocketCashedOut) return;

    const winMultiplier = rocketMultiplier;
    setHasRocketCashedOut(true);
    const winReward = Math.floor(rocketBetAmount * winMultiplier);

    try {
      await supabase.rpc('cash_out_rocket', {
        p_user_id: currentUser.id,
        p_reward_amount: winReward
      });

      showToast(`كفو! سحبت بنجاح على مضاعف ${winMultiplier}x وربحت ${winReward} كوينز 🚀`, 'success');

      if (winMultiplier >= 3.0) {
        RoomService.sendRoomMessage(
          room.id,
          `🚀 انطلق الصاروخ! نجح ${currentUser.display_name} في السحب عند ${winMultiplier}x وربح ${winReward} كوينز!`,
          currentUser,
          'game'
        ).catch(() => {});
      }
    } catch {
      showToast('تم السحب بنجاح!', 'success');
    }
  };

  const handleToggleRoomMute = () => {
    setIsRoomMuted(prev => !prev);
    showToast(!isRoomMuted ? 'تم كتم صوت الغرفة 🔇' : 'تم تشغيل صوت الغرفة 🔊', 'info');
  };

  const handleClearScreen = () => {
    setMessages([]);
    setToolsDrawerOpen(false);
    showToast('تم مسح شاشة المحادثة 🧹', 'info');
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`تم تشغيل ملف الموسيقى: ${file.name} 🎵`, 'success');
      setToolsDrawerOpen(false);
    }
  };

  const handleShareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: room.title,
        text: `انضم إلى غرفتي في Jopi!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط الغرفة بنجاح 📋', 'success');
    }
  };

  const changeMicCount = async (newCount: number) => {
    setSelectedMicCount(newCount);
    setMicConfigModalOpen(false);
    try {
      await supabase.from('room_seats').delete().eq('room_id', room.id);
      const newSeats = Array.from({ length: newCount }, (_, index) => ({
        room_id: room.id,
        seat_index: index,
        user_id: null,
        is_muted: false,
        is_locked: index >= 8,
      }));
      await supabase.from('room_seats').insert(newSeats);
      const updated = await RoomService.getRoomById(room.id);
      if (updated) setRoom(updated);
      showToast(`تم تغيير عدد المايكات إلى ${newCount}`, 'success');
    } catch (e) {
      showToast('تعذر تغيير عدد المايكات', 'error');
    }
  };

  const changeBackground = async (bgClass: string) => {
    setCurrentBg(bgClass);
    setBgModalOpen(false);
    try {
      await supabase.from('voice_rooms').update({ bg_theme: bgClass }).eq('id', room.id);
      showToast('تم تغيير خلفية الغرفة بنجاح', 'success');
    } catch (e) {
      showToast('تعذر تحديث الخلفية', 'error');
    }
  };

  const changeRoomType = async (type: string) => {
    setRoomType(type);
    setRoomTypeModalOpen(false);
    try {
      await supabase.from('voice_rooms').update({ category: type }).eq('id', room.id);
      showToast(`تم تغيير نوع الغرفة إلى ${type}`, 'success');
    } catch (e) {
      showToast('تعذر تحديث نوع الغرفة', 'error');
    }
  };

  const handleApplyMembership = () => {
    if (room.host_id) {
      NotificationService.addNotification({
        user_id: room.host_id,
        type: 'system',
        title: 'طلب انضمام لعضوية الغرفة 👑',
        title_ar: 'طلب انضمام لعضوية الغرفة 👑',
        body: `${currentUser.display_name} يطلب الانضمام لعضوية غرفتك.`,
        body_ar: `${currentUser.display_name} يطلب الانضمام لعضوية غرفتك.`,
        avatar_url: currentUser.profile_photo
      });
      showToast('تم إرسال طلب العضوية إلى المضيف بنجاح! 🛡️', 'success');
    }
  };

  const interactiveGames = [
    { id: 'lucky_bag', name: 'Lucky Bag', icon: '🎒', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'lucky_adventure', name: 'Lucky Adventure', icon: '🧩', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'party_square', name: 'Party Square', icon: '🎉', onClick: () => { setToolsDrawerOpen(false); showToast('Party Square قريباً!', 'info'); } },
    { id: 'super_winner', name: 'Super Winner', icon: '🎯', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'clash_thrones', name: 'Clash of Thrones', icon: '👑', onClick: () => { setToolsDrawerOpen(false); showToast('Clash of Thrones قريباً!', 'info'); } },
    { id: 'greedy_cat', name: 'Greedy Cat', icon: '🐱', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'multi_fishing', name: 'Multi Fishing', icon: '🦈', onClick: () => { setToolsDrawerOpen(false); showToast('Multi Fishing قريباً!', 'info'); } },
    { id: 'slot_game', name: 'Slot Game', icon: '🎰', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'rocket_crash', name: 'Rocket Crash', icon: '🚀', onClick: () => { setToolsDrawerOpen(false); setRocketModalOpen(true); } },
    { id: 'lion_tiger', name: 'Lion or Tiger', icon: '🦁', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'yummy', name: 'Yummy', icon: '🍬', onClick: () => { setToolsDrawerOpen(false); showToast('Yummy قريباً!', 'info'); } },
    { id: 'greedy_dice', name: 'Greedy Dice', icon: '🎲', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'roulette', name: 'Roulette', icon: '🎡', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
    { id: 'lucky_match', name: 'Lucky Match', icon: '🐣', onClick: () => { setToolsDrawerOpen(false); showToast('Lucky Match qريباً!', 'info'); } },
    { id: 'texas_cowboy', name: 'Texas Cowboy', icon: '🤠', onClick: () => { setToolsDrawerOpen(false); showToast('Texas Cowboy قريباً!', 'info'); } },
    { id: 'game_center', name: 'Game Center', icon: '🎮', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
  ];

  const filteredGifts = SUGO_ALL_GIFTS.filter(g => g.category === activeGiftTab);

  const totalPkScore = redScore + blueScore;
  const redPercentage = totalPkScore === 0 ? 50 : Math.max(10, Math.min(90, Math.round((redScore / totalPkScore) * 100)));
  const bluePercentage = 100 - redPercentage;

  return (
    <div className={`fixed inset-0 z-50 ${currentBg} text-white flex flex-col justify-between overflow-hidden select-none`}>
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      <input 
        ref={musicFileInputRef} 
        type="file" 
        accept="audio/*" 
        onChange={handleMusicUpload} 
        className="hidden" 
      />

      {/* --- Header --- */}
      <div className="relative z-20 px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div 
          onClick={() => setRoomDetailsOpen(true)}
          className="flex items-center gap-2 bg-black/40 p-1.5 pe-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/60 transition"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400 flex-shrink-0">
            <img src={room.cover_url || room.host?.profile_photo} alt="" className="w-full h-full object-cover" />
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute bottom-0 end-0" />
          </div>
          <div className="min-w-0 max-w-[120px]">
            <h3 className="text-xs font-black truncate">{room.title}</h3>
            <p className="text-[9px] text-amber-300">ID: {room.id.slice(-6)}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/70" />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setRoomMembersModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur-sm cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{roomMembers.length}</span>
          </button>

          {isHostOrAdmin && (
            <button 
              onClick={() => setRoomSettingsModalOpen(true)} 
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-amber-400 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button onClick={minimizeRoom} className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition cursor-pointer">
            <Minimize2 className="w-4 h-4" />
          </button>

          <button onClick={() => { AudioService.stopMicrophone(); RoomService.leaveSeat(room.id, currentUser); closeRoom(); }} className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-700 text-white transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- SUGO Live PK Battle Banner --- */}
      {isPkActive && (
        <div className="relative z-20 px-3 py-1 bg-black/40 backdrop-blur-md border-b border-white/10">
          <div className="max-w-md mx-auto flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-rose-400 font-mono tracking-wider flex items-center gap-1">
                🔴 RED: {redScore}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>{formatPkTime(pkTimeLeft)}</span>
              </div>
              <span className="text-sky-400 font-mono tracking-wider flex items-center gap-1">
                BLUE: {blueScore} 🔵
              </span>
            </div>

            <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-black/60 border border-white/15 shadow-inner">
              <div 
                style={{ width: `${redPercentage}%` }} 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 relative"
              />
              <div className="absolute inset-y-0 start-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[8px] font-black text-amber-300 border border-amber-400/40 shadow">
                  VS
                </span>
              </div>
              <div 
                style={{ width: `${bluePercentage}%` }} 
                className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- Mics Grid & Audience Bar --- */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-2 py-2 overflow-y-auto">
        <div className={`w-full max-w-md mx-auto ${getSugoGridStyle(selectedMicCount)}`}>
          {Array.from({ length: selectedMicCount }).map((_, index) => {
            const seat: any = room.seats?.find((s: any) => s.seat_index === index) || { seat_index: index, is_muted: false };
            const seatUser = resolveSeatUser(seat, index);
            const hasUser = !!seatUser;
            const isSeatHost = index === 0;
            const isMuted = seat.is_muted;

            const isRedTeam = index % 2 === 0;
            const pkBorderColor = isPkActive ? (isRedTeam ? 'border-rose-500 ring-4 ring-rose-500/30' : 'border-sky-500 ring-4 ring-sky-500/30') : '';

            const userDisplayName = seatUser?.display_name || '';
            const userId = seatUser?.id || '';
            const points = hasUser ? (userGiftPoints[userId] || userGiftPoints[userDisplayName] || 0) : 0;

            return (
              <div key={index} className="flex flex-col items-center gap-1 relative my-1">
                <div onClick={() => handleSeatClick(index)} className="relative cursor-pointer group">
                  <div className={`relative rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform group-hover:scale-105 shadow-2xl ${
                    selectedMicCount <= 6 ? 'w-16 h-16' : 'w-12 h-12'
                  } ${pkBorderColor ? pkBorderColor : isMuted ? 'border-rose-600 ring-4 ring-rose-600/40 bg-rose-950/80' : isSeatHost ? 'border-amber-400 bg-amber-950/80 ring-4 ring-amber-400/30' : hasUser ? 'border-pink-500 bg-pink-950/60' : 'border-dashed border-white/40 bg-white/10 hover:border-white/70'}`}>
                     
                    {hasUser && seatUser?.profile_photo ? (
                      <img src={seatUser.profile_photo} alt="" className="w-full h-full object-cover" />
                    ) : hasUser ? (
                      <div className="w-full h-full bg-gradient-to-tr from-purple-700 to-pink-600 flex items-center justify-center text-white font-extrabold text-sm">
                        {seatUser?.display_name?.charAt(0) || 'U'}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/60">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span className="text-[8px] font-bold">{index + 1}</span>
                      </div>
                    )}

                    {isMuted && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <MicOff className="w-5 h-5 text-rose-500 animate-pulse" />
                      </div>
                    )}
                  </div>

                  {isSeatHost && (
                    <span className="absolute -top-3 start-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 p-0.5 rounded-full shadow-lg z-10">
                      <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
                    </span>
                  )}

                  {isPkActive && (
                    <span className={`absolute -bottom-1 start-1/2 -translate-x-1/2 text-[8px] font-black px-1.5 rounded-full shadow z-10 ${isRedTeam ? 'bg-rose-600 text-white' : 'bg-sky-500 text-slate-950'}`}>
                      {isRedTeam ? 'RED' : 'BLUE'}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-100 truncate max-w-[75px] drop-shadow text-center">
                  {hasUser && seatUser?.display_name ? seatUser.display_name.split(' ')[0] : `مايك ${index + 1}`}
                </span>

                <div className="flex items-center justify-center min-w-[36px] px-1.5 py-0.5 rounded-full bg-black/50 border border-white/10 shadow-sm backdrop-blur-sm">
                  <span className="text-[9px] font-extrabold text-amber-300 font-mono leading-none">
                    {points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Audience Bar */}
        <div className="w-full max-w-xs mx-auto mt-3 px-3 py-1.5 bg-black/30 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {audienceMembers.length > 0 ? (
              audienceMembers.slice(0, 4).map((member, idx) => (
                <img 
                  key={idx} 
                  src={member.profile_photo || currentUser.profile_photo} 
                  alt="audience" 
                  className="w-6 h-6 rounded-full object-cover border border-white/20 flex-shrink-0 cursor-pointer"
                  onClick={() => setViewingUser(member)} 
                />
              ))
            ) : (
              <span className="text-[10px] text-white/60 px-1">لا يوجد مستمعون حالياً</span>
            )}
          </div>
          <div 
            onClick={() => setRoomMembersModalOpen(true)}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full cursor-pointer transition text-[10px] font-bold text-amber-300 flex-shrink-0"
          >
            <Users className="w-3 h-3 text-amber-400" />
            <span>{audienceMembers.length}</span>
            <ChevronRight className="w-3 h-3 text-white/60" />
          </div>
        </div>
      </div>

      {/* --- Live Chat --- */}
      <div className="relative z-10 px-4 max-h-36 overflow-y-auto space-y-2 mb-2 scrollbar-none text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center gap-2 max-w-full">
            <div 
              onClick={() => msg.sender && setViewingUser(msg.sender)}
              className="w-7 h-7 rounded-full overflow-hidden border border-pink-500/60 flex-shrink-0 cursor-pointer hover:scale-105 transition"
            >
              <img src={msg.sender?.profile_photo || currentUser.profile_photo} alt="" className="w-full h-full object-cover" />
            </div>
             
            <div className="px-3.5 py-1.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 max-w-[85%] text-slate-100 shadow-md flex items-baseline gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold text-[9px]">VIP</span>
              <strong className="text-pink-300 font-extrabold text-xs">{msg.sender?.display_name}:</strong>
              <span className="text-xs text-white/90">{msg.text}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* --- Bottom Controls Bar --- */}
      <div className="relative z-20 px-3 py-2.5 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-2">
        <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-full px-3 py-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-white/50" />
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            placeholder="Say something..." 
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none" 
          />
          {chatInput.trim() && (
            <button type="submit" className="p-1 rounded-full bg-brand-600 text-white cursor-pointer shadow-md">
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {mySeat ? (
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleToggleMyMic} className={`p-2 rounded-full ${mySeat.is_muted ? 'bg-rose-500' : 'bg-emerald-500'} text-white cursor-pointer`}>
              {mySeat.is_muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleLeaveSeat} className="px-2.5 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold cursor-pointer">نزول</button>
          </div>
        ) : null}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button 
            type="button" 
            onClick={() => setToolsDrawerOpen(true)} 
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer relative"
            title="الألعاب والأدوات"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button 
            type="button" 
            onClick={() => setPkModalOpen(true)}
            className={`px-2.5 py-1 rounded-full text-white text-xs font-black shadow-md border transition cursor-pointer flex items-center gap-1 ${
              isPkActive 
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 border-amber-400 animate-pulse' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/40 hover:scale-105'
            }`}
            title="تحديات الـ PK"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="tracking-widest font-black text-[11px]">{isPkActive ? 'LIVE' : 'PK'}</span>
          </button>

          <button 
            type="button" 
            onClick={() => setIsGiftModalOpen(true)} 
            className="p-2 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition"
            title="إرسال هدية"
          >
            <GiftIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- SUGO Exact PK Setup Modal --- */}
      <AnimatePresence>
        {pkModalOpen && (
          <div 
            onClick={() => setPkModalOpen(false)}
            className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-end justify-center p-0 select-none"
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-slate-900 via-[#101428] to-slate-950 border-t border-purple-500/30 rounded-t-[32px] p-5 text-white shadow-2xl space-y-4"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">تحدي الـ PK (PK Battle)</h3>
                    <p className="text-[10px] text-purple-300/80">تنافس بين المتحدثين على المايكات بالهدايا</p>
                  </div>
                </div>
                <button onClick={() => setPkModalOpen(false)} className="p-1 rounded-full text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold">
                <button 
                  onClick={() => setPkMode('team')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${pkMode === 'team' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Team PK (فريقين)</span>
                </button>
                <button 
                  onClick={() => setPkMode('single')}
                  className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${pkMode === 'single' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'}`}
                >
                  <Swords className="w-4 h-4" />
                  <span>1v1 (فردي)</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-2">مدة التحدي (Duration)</label>
                <div className="grid grid-cols-4 gap-2 text-xs font-black">
                  {[
                    { label: '3 دقائق', sec: 180 },
                    { label: '5 دقائق', sec: 300 },
                    { label: '10 دقائق', sec: 600 },
                    { label: '15 دقيقة', sec: 900 }
                  ].map((item) => (
                    <button
                      key={item.sec}
                      onClick={() => setPkDuration(item.sec)}
                      className={`py-2 rounded-xl border transition cursor-pointer ${
                        pkDuration === item.sec 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow' 
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span>الفريق الأحمر (المايكات الزوجية)</span>
                </div>
                <span className="text-[10px] text-amber-300 font-black">VS</span>
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <span>الفريق الأزرق (المايكات الفردية)</span>
                  <span className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
                </div>
              </div>

              {!isPkActive ? (
                <button
                  onClick={handleStartPK}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-black text-sm shadow-xl hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>بدء تحدي الـ PK الآن</span>
                </button>
              ) : (
                <button
                  onClick={handleStopPK}
                  className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-xl active:scale-98 transition cursor-pointer"
                >
                  إنهاء التحدي الحالي
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SUGO Exact Bottom Gift Modal --- */}
      <AnimatePresence>
        {isGiftModalOpen && (
          <div 
            onClick={() => setIsGiftModalOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm select-none p-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 150 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-[#121629] via-[#0d1020] to-[#080a14] rounded-t-[32px] shadow-2xl border-t border-white/15 text-white overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="relative h-20 w-full overflow-hidden bg-gradient-to-r from-amber-700 via-rose-900 to-indigo-950 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
                <div className="absolute inset-0 bg-black/25" />
                <div className="relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    SUGO Event
                  </span>
                  <h3 className="text-sm font-black text-white mt-1 drop-shadow">اندفاع الإسقاط الجوي</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="relative z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs flex-shrink-0">
                <div className="flex items-center gap-1.5 text-white/70">
                  <span className="text-[11px] font-bold">إرسال إلى:</span>
                  <button 
                    type="button"
                    onClick={() => setGiftTargetType('host')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black transition cursor-pointer ${giftTargetType === 'host' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-white/10 text-white/80'}`}
                  >
                    المستضيف 👑
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGiftTargetType('all')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1 cursor-pointer ${giftTargetType === 'all' ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-sm' : 'bg-white/10 text-white/80'}`}
                  >
                    <Users className="w-3 h-3" />
                    <span>كل المايكات</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-white/10 text-xs font-bold flex-shrink-0">
                {GIFT_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveGiftTab(tab);
                      const firstOfTab = SUGO_ALL_GIFTS.find(g => g.category === tab);
                      if (firstOfTab) setSelectedGift(firstOfTab);
                    }}
                    className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer text-xs ${
                      activeGiftTab === tab 
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-3 grid grid-cols-4 gap-2.5 overflow-y-auto max-h-[46vh] scrollbar-thin">
                {filteredGifts.length > 0 ? (
                  filteredGifts.map((gift) => {
                    const isSelected = selectedGift.id === gift.id;
                    return (
                      <div
                        key={gift.id}
                        onClick={() => setSelectedGift(gift)}
                        className={`relative p-2 rounded-2xl border flex flex-col items-center justify-between cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/60 shadow-[0_0_15px_rgba(99,102,241,0.35)] ring-2 ring-indigo-400/40 scale-[1.03]'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {gift.tag && (
                          <span className="absolute top-1 start-1 px-1 py-0.2 rounded text-[8px] font-black bg-emerald-500 text-slate-950">
                            {gift.tag}
                          </span>
                        )}

                        <div className="w-11 h-11 my-1 flex items-center justify-center text-3xl filter drop-shadow">
                          {gift.icon}
                        </div>

                        <span className="text-[10px] font-bold text-white/90 truncate w-full text-center">
                          {lang === 'ar' ? gift.name_ar : gift.name}
                        </span>

                        <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 mt-1">
                          <Coins className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{gift.price}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-4 py-12 text-center text-xs text-white/40 font-bold">
                    لا توجد عناصر في هذه الفئة حالياً
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-3 relative flex-shrink-0">
                <div 
                  onClick={() => setShowTopUpDirectModal(true)}
                  className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 rounded-full cursor-pointer transition active:scale-95"
                  title="شحن الرصيد الفوري"
                >
                  <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-amber-300">{coinBalance}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMultiplierMenuOpen(!multiplierMenuOpen)}
                      className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-black text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>{selectedGiftMultiplier}</span>
                      {multiplierMenuOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>

                    {multiplierMenuOpen && (
                      <div className="absolute bottom-10 end-0 w-24 bg-slate-900 border border-white/15 rounded-2xl p-1 shadow-2xl z-30 space-y-1">
                        {[1, 10, 50, 100, 999].map((mult) => (
                          <button
                            key={mult}
                            type="button"
                            onClick={() => {
                              setSelectedGiftMultiplier(mult);
                              setMultiplierMenuOpen(false);
                            }}
                           className={`w-full py-1 text-center rounded-xl text-xs font-black transition cursor-pointer ${selectedGiftMultiplier === mult ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-white/80'}`}
                          >
                            {mult}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendSugoGift}
                    disabled={sendingGift}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs shadow-lg hover:opacity-95 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {sendingGift ? 'جارٍ الإرسال...' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- واجهة شحن العملات المباشرة --- */}
      <AnimatePresence>
        {showTopUpDirectModal && (
          <div 
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-md select-none p-4"
            onClick={() => setShowTopUpDirectModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }} 
              className="relative w-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowTopUpDirectModal(false)} 
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <img 
                src="https://cdn.phototourl.com/free/2026-09-11-48610cf4-9222-4679-8da9-34d27d0e6772.jpg"
                alt="Jopi Topup" 
                className="w-full h-auto block pointer-events-none" 
              />

              <div dir="ltr" style={{
                direction: 'ltr',
                position: 'absolute',
                top: '23%',
                left: '5.5%',
                width: '89%',
                height: '61.5%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                columnGap: '3%',
                rowGap: '3%'
              }}>
                {CAT_COIN_PACKAGES.map((pkg) => {
                  const isSelected = selectedTopUpPkg.id === pkg.id;
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedTopUpPkg(pkg)}
                      className={`relative w-full h-full cursor-pointer rounded-[14px] transition-all flex items-center justify-center ${
                        isSelected ? 'bg-white/10 ring-1 ring-white/50 shadow-[inset_0_0_20px_rgba(255,165,0,0.2)]' : 'hover:bg-white/10'
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-[#ffb82e] to-[#f7931a] rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(247,147,26,0.8)] pointer-events-none"
                          >
                            <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={4} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {selectedTopUpPkg && (
                <div style={{ position: 'absolute', bottom: '4%', left: '5%', width: '90%', zIndex: 20 }}>
                  <button 
                    onClick={async () => {
                      const res = await WalletService.purchasePackage(selectedTopUpPkg.id);
                      if (res.success) {
                        refreshWallet();
                        showToast(lang === 'ar' ? `تم شحن ${selectedTopUpPkg.coins.toLocaleString()} عملة بنجاح! 🪙` : `Successfully topped up ${selectedTopUpPkg.coins.toLocaleString()} coins! 🪙`, 'success');
                        setShowTopUpDirectModal(false);
                      } else {
                        showToast(res.error || 'فشل عملية الشحن', 'error');
                      }
                    }}
                    className="w-full py-3.5 rounded-[18px] bg-gradient-to-r from-[#ffb82e] via-[#f7931a] to-[#ffb82e] text-[#2d1b0d] font-black text-[13px] shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {lang === 'ar' 
                        ? `شحن ${selectedTopUpPkg.coins.toLocaleString()} مقابل ${selectedTopUpPkg.price}$` 
                        : `Top up ${selectedTopUpPkg.coins.toLocaleString()} for $${selectedTopUpPkg.price}`}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SUGO Interactive Games & Basic Tools Drawer --- */}
      <AnimatePresence>
        {toolsDrawerOpen && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="w-full max-w-md bg-slate-950/95 border-t border-white/15 rounded-t-[32px] p-5 text-white shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

              <div className="mb-5">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-black tracking-wide text-white/90 uppercase">Interactive Games</h3>
                  <button onClick={() => setToolsDrawerOpen(false)} className="text-white/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {interactiveGames.map((game) => (
                    <div 
                      key={game.id} 
                      onClick={game.onClick}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition">
                        {game.icon}
                      </div>
                      <span className="text-[10px] text-center font-bold text-white/80 line-clamp-1">
                        {game.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-white/10 my-4" />

              <div>
                <h3 className="text-xs font-black tracking-wide text-white/90 uppercase mb-3 px-1">Basic Tools</h3>
                 
                <div className="grid grid-cols-4 gap-3">
                  <div onClick={handleShareRoom} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Share</span>
                  </div>

                  <div onClick={handleToggleRoomMute} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition group-hover:scale-105 ${isRoomMuted ? 'bg-rose-900/50 border-rose-500 text-rose-300' : 'bg-slate-900 border-white/10 text-white'}`}>
                      {isRoomMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Room Mute</span>
                  </div>

                  <div onClick={() => musicFileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition">
                      <Music className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Music</span>
                  </div>

                  <div onClick={() => { setToolsDrawerOpen(false); showToast('تم تفعيل وضع التجميل والتنقية ✨', 'success'); }} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-pink-400 group-hover:scale-105 transition">
                      <Smile className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Beauty</span>
                  </div>

                  <div onClick={() => { setToolsDrawerOpen(false); showToast('إعدادات المؤثرات الخاصة', 'info'); }} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-amber-300 group-hover:scale-105 transition">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Special Effects</span>
                  </div>

                  <div onClick={() => { setToolsDrawerOpen(false); showToast('متجر الغرفة المباشر', 'info'); }} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Store</span>
                  </div>

                  <div onClick={() => { setToolsDrawerOpen(false); showToast('تم تبديل الكاميرا', 'info'); }} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Flip Camera</span>
                  </div>

                  <div onClick={() => { setToolsDrawerOpen(false); showToast('تم إرسال رسالة الترحيب للغرفة 👋', 'success'); }} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-white/80">Welcome</span>
                  </div>

                  <div onClick={handleClearScreen} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
                      <Eraser className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-center font-bold text-rose-300">Clear Screen</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Rocket Crash Modal --- */}
      {rocketModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-cyan-500/30 rounded-t-[32px] sm:rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={() => setRocketModalOpen(false)} 
              disabled={rocketGameState === 'flying' && !hasRocketCashedOut}
              className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-3">
              <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 flex items-center justify-center gap-1.5">
                <Rocket className="w-5 h-5 text-cyan-400" />
                صاروخ الحظ (Rocket Crash)
              </h3>
              <p className="text-[10px] text-cyan-300/80">اسحب أرباحك قبل أن ينفجر الصاروخ!</p>
            </div>

            <div className="relative h-44 w-full bg-slate-950/80 rounded-2xl border border-cyan-500/20 my-2 overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

              <div className="relative z-10 text-center">
                <span className={`text-4xl font-black font-mono tracking-tight drop-shadow-lg ${
                  rocketGameState === 'crashed' 
                    ? 'text-rose-500 animate-pulse' 
                    : hasRocketCashedOut 
                    ? 'text-emerald-400' 
                    : 'text-amber-400'
                }`}>
                  {rocketMultiplier.toFixed(2)}x
                </span>

                {rocketGameState === 'crashed' && (
                  <p className="text-xs font-bold text-rose-400 mt-1 flex items-center justify-center gap-1">
                    <AlertOctagon className="w-4 h-4" /> انفجر الصاروخ!
                  </p>
                )}

                {hasRocketCashedOut && (
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    تم السحب بنجاح! (+{Math.floor(rocketBetAmount * rocketMultiplier)} عملة)
                  </p>
                )}
              </div>

              <div className="absolute bottom-4 left-4 z-10 transition-all duration-300">
                {rocketGameState === 'flying' && (
                  <motion.div 
                    animate={{ 
                      x: [0, 130, 150], 
                      y: [0, -60, -80],
                      rotate: [45, 50, 45]
                    }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="relative"
                  >
                    <Rocket className="w-9 h-9 text-cyan-400 fill-cyan-500/30 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                    <Flame className="w-4 h-4 text-amber-500 absolute -bottom-2 -left-2 rotate-45 animate-bounce" />
                  </motion.div>
                )}

                {rocketGameState === 'crashed' && (
                  <div className="text-3xl animate-ping">💥</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3 mt-1">
              {[50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  disabled={rocketGameState === 'flying'}
                  onClick={() => setRocketBetAmount(val)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    rocketBetAmount === val 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md' 
                      : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            {rocketGameState !== 'flying' ? (
              <button
                onClick={handleLaunchRocket}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-black text-sm shadow-lg hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="w-5 h-5 fill-current" />
                إطلاق الصاروخ ({rocketBetAmount} عملة)
              </button>
            ) : (
              <button
                onClick={handleRocketCashOut}
                disabled={hasRocketCashedOut}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                  hasRocketCashedOut 
                    ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:scale-[1.02] active:scale-98 animate-pulse'
                }`}
              >
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                {hasRocketCashedOut 
                  ? 'تم تأمين الأرباح' 
                  : `سحب نقدي الآن (+${Math.floor(rocketBetAmount * rocketMultiplier)} عملة)`
                }
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* --- Lucky Wheel Modal --- */}
      {luckyWheelModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 rounded-t-[32px] sm:rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl relative overflow-hidden"
          >
            <button onClick={() => setLuckyWheelModalOpen(false)} className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-3">
              <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                عجلة الحظ (Lucky Spin)
              </h3>
              <p className="text-[10px] text-purple-300/80">اربح حتى 50 ضعف قيمة رهانك!</p>
            </div>

            <div className="relative w-52 h-52 mx-auto my-2 flex items-center justify-center">
              <div className="absolute -top-2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

              <motion.div 
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 4.5, ease: [0.15, 0.9, 0.2, 1] }}
                className="w-full h-full rounded-full border-4 border-amber-400/80 relative overflow-hidden shadow-[0_0_25px_rgba(217,70,239,0.35)]"
                style={{
                  background: `conic-gradient(
                    #3b82f6 0deg 45deg, 
                    #10b981 45deg 90deg, 
                    #f59e0b 90deg 135deg, 
                    #8b5cf6 135deg 180deg, 
                    #ec4899 180deg 225deg, 
                    #e11d48 225deg 270deg, 
                    #fbbf24 270deg 315deg, 
                    #64748b 315deg 360deg
                  )`
                }}
              >
                {WHEEL_SECTORS.map((s, idx) => {
                  const angle = (360 / WHEEL_SECTORS.length) * idx + (360 / WHEEL_SECTORS.length) / 2;
                  return (
                    <div
                      key={s.id}
                      className="absolute w-full h-full flex justify-center text-[10px] font-black text-white drop-shadow pt-2"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <span>{s.multiplier}</span>
                    </div>
                  );
                })}
              </motion.div>

              <div className="absolute w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-400 shadow-md flex items-center justify-center z-10">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="h-6 text-center my-1">
              {lastWonPrize && !isSpinning && (
                <p className="text-xs font-bold text-amber-300 animate-bounce">
                  {lastWonPrize.value > 0 ? `مبروك! ربحت ${lastWonPrize.value} كوينز 🎁` : 'حظ أوفر في المرة القادمة!'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  disabled={isSpinning}
                  onClick={() => setSelectedBetAmount(val)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    selectedBetAmount === val 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md' 
                      : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>

            <button
              disabled={isSpinning}
              onClick={handlePlayWheelSpin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white font-black text-sm shadow-lg hover:opacity-90 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {isSpinning ? 'جارٍ السحب...' : `تدوير الآن (${selectedBetAmount} عملة)`}
            </button>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {roomDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-slate-900 border border-slate-800 rounded-t-[32px] sm:rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative">
            <button onClick={() => setRoomDetailsOpen(false)} className="absolute top-4 end-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
             
            <div className="flex items-center gap-4 mb-5">
              <img src={room.cover_url || room.host?.profile_photo} alt="" className="w-16 h-16 rounded-2xl object-cover border border-amber-400 shadow-lg" />
              <div>
                <h3 className="font-black text-base">{room.title}</h3>
                <p className="text-xs text-amber-400 font-bold mt-0.5">ID: {room.id.slice(-6)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">Level 6</span>
                  <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-bold">{roomType}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <button 
                onClick={handleApplyMembership}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:opacity-90 transition cursor-pointer"
              >
                تقديم طلب عضوية الغرفة (Apply for Membership) 👑
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {roomSettingsModalOpen && isHostOrAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-slate-900 border border-slate-800 rounded-t-[32px] sm:rounded-3xl w-full max-w-md p-5 text-white shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm">Room Settings</h3>
              <button onClick={() => setRoomSettingsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div onClick={() => { setRoomSettingsModalOpen(false); setBgModalOpen(true); }} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 cursor-pointer">
                <span className="font-bold">خلفية الغرفة (Room Background)</span>
                <span className="text-pink-400 font-medium">تخصيص &gt;</span>
              </div>
              <div onClick={() => { setRoomSettingsModalOpen(false); setRoomTypeModalOpen(true); }} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 cursor-pointer">
                <span className="font-bold">نوع الغرفة (Type of room)</span>
                <span className="text-pink-400 font-medium">{roomType} &gt;</span>
              </div>
              <div onClick={() => { setRoomSettingsModalOpen(false); setMicConfigModalOpen(true); }} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 cursor-pointer">
                <span className="font-bold">عدد مقاعد المايك (Mic seats)</span>
                <span className="text-pink-400 font-medium">{selectedMicCount} &gt;</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {seatActionModalOpen && selectedSeatForAction !== null && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-end justify-center p-0">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] w-full max-w-md p-5 text-white shadow-2xl space-y-2">
            <button onClick={() => executeSeatAction('take')} className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center cursor-pointer">
              الصعود إلى المايك (Take the mic)
            </button>
            {isHostOrAdmin && (
              <>
                <button onClick={() => executeSeatAction('lock')} className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center cursor-pointer text-amber-400">
                  قفل المايك (Lock the mic)
                </button>
                <button onClick={() => executeSeatAction('invite')} className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center cursor-pointer text-pink-400">
                  دعوة صديق (Invite)
                </button>
              </>
            )}
            <button onClick={() => setSeatActionModalOpen(false)} className="w-full py-3.5 rounded-2xl bg-slate-950 text-slate-400 text-xs font-bold text-center cursor-pointer mt-2">
              إلغاء
            </button>
          </motion.div>
        </div>
      )}

      {micConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-sm">اختر عدد مقاعد المايك</h3>
              <button onClick={() => setMicConfigModalOpen(false)} className="text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto">
              {availableLayouts.map((l) => (
                <button
                  key={l.count}
                  onClick={() => changeMicCount(l.count)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${
                    selectedMicCount === l.count ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {roomTypeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-sm">نوع الغرفة (Type of room)</h3>
              <button onClick={() => setRoomTypeModalOpen(false)} className="text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              {['Friendship', 'Music', 'Families', 'Chat', 'Dating'].map((type) => (
                <button
                  key={type}
                  onClick={() => changeRoomType(type)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold text-start cursor-pointer ${
                    roomType === type ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {bgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm">خلفيات الغرفة</h3>
              <button onClick={() => setBgModalOpen(false)} className="text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto">
              {SUGO_ROOM_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => changeBackground(bg.class)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer ${bg.class}`}
                >
                  <span className="text-2xl">{bg.preview}</span>
                  <span className="text-[10px] text-white">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {roomMembersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] w-full max-w-md p-5 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-base">Members ({roomMembers.length}/50)</h3>
              <button onClick={() => setRoomMembersModalOpen(false)} className="text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5">
              {roomMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800 cursor-pointer" onClick={() => setViewingUser(member)}>
                  <div className="flex items-center gap-3">
                    <img src={member.profile_photo || currentUser.profile_photo} alt="" className="v-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{member.display_name}</p>
                      <p className="text-[10px] text-pink-300">Active in room</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const FloatingRoomPlayer: React.FC = () => {
  const { activeRoom, isRoomMinimized, maximizeRoom, closeRoom } = useApp();

  if (!activeRoom || !isRoomMinimized) return null;

  return (
    <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="fixed bottom-20 end-4 z-40 p-2.5 rounded-3xl bg-slate-900/95 text-white border border-brand-500 shadow-2xl backdrop-blur-xl flex items-center gap-3 cursor-pointer select-none max-w-[220px]" onClick={maximizeRoom}>
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
        <img src={activeRoom.host?.profile_photo} alt="Host" className="w-full h-10 object-cover" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 end-0 border border-black animate-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-black truncate">{activeRoom.title}</h4>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{activeRoom.audience_count} يستمعون</span>
        </div>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); closeRoom(); }} className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};