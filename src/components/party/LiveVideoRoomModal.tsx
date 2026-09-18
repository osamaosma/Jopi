// ============================================================================
// Jopi Independent Full-Screen Video & Party Room Experience (Jopi Ultimate Full Production Engine - Purple UI)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  X, Minimize2, Mic, MicOff, Video as VideoIcon, VideoOff, 
  Crown, Gift as GiftIcon, Sparkles, Send, Dices, 
  Smile, Users, Plus, Check, Radio, Trophy, Settings, Bell, BarChart3, Image as ImageIcon, Unlock, ShieldAlert, UserPlus, UserCheck, AlertTriangle, ChevronRight, ChevronUp, ChevronDown, Lock, ShieldCheck, Globe,
  Rocket, TrendingUp, AlertOctagon, Flame, LayoutGrid, MessageSquare, Volume2, VolumeX, Music, Sparkle, Share2, ShoppingBag, Camera, MessageCircle, Eraser, Swords,
  Coins, Timer, Play, CreditCard, HelpCircle, Search, Award, EyeOff, Eye, RefreshCw, LogOut, MoreVertical
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

export interface VideoSeat {
  seat_index: number;
  user_id: string | null;
  user?: User | null;
  is_muted: boolean;
  is_video_off: boolean;
}

export interface RoomLayoutConfig {
  id: string;
  label: string;
  videoCount: number;
  micCount: number;
  totalSeats: number;
}

const JOPI_ROOM_LAYOUTS: RoomLayoutConfig[] = [
  { id: 'l-1-5', label: '1 كاميرا لايف كبرى + 5 مايكات', videoCount: 1, micCount: 5, totalSeats: 6 },
  { id: 'l-1-9', label: '1 كاميرا لايف كبرى + 9 مايكات', videoCount: 1, micCount: 9, totalSeats: 10 },
  { id: 'l-med-4', label: '1 كاميرا متوسطة + 4 مايكات', videoCount: 1, micCount: 4, totalSeats: 5 },
  { id: 'l-2-4', label: '2 كاميرا + 4 مايكات', videoCount: 2, micCount: 4, totalSeats: 6 },
  { id: 'l-3-4', label: '3 كاميرات + 4 مايكات', videoCount: 3, micCount: 4, totalSeats: 7 },
  { id: 'l-4-4', label: '4 كاميرات + 4 مايكات', videoCount: 4, micCount: 4, totalSeats: 8 },
  { id: 'l-6-4', label: '6 كاميرات + 4 مايكات', videoCount: 6, micCount: 4, totalSeats: 10 },
  { id: 'l-6-9', label: '6 كاميرات + 9 مايكات', videoCount: 6, micCount: 9, totalSeats: 15 },
  { id: 'l-4-9', label: '4 كاميرات + 9 مايكات', videoCount: 4, micCount: 9, totalSeats: 13 },
];

export const JOPI_ROOM_BACKGROUNDS = [
  { id: 'bg-1', name: 'قصر الأحلام الأرجواني', class: 'bg-gradient-to-b from-[#1c143d] via-[#100d28] to-[#070614]', preview: '🏰' },
  { id: 'bg-2', name: 'مجرة البنفسج', class: 'bg-gradient-to-b from-[#2a1b4e] via-[#130f2c] to-[#080612]', preview: '🌌' },
  { id: 'bg-3', name: 'سحر الأرجوان', class: 'bg-gradient-to-b from-[#1e153a] via-[#120d26] to-[#05040a]', preview: '🌲' },
  { id: 'bg-4', name: 'غروب ملكي', class: 'bg-gradient-to-b from-[#321c3b] via-[#160d24] to-[#07050f]', preview: '🌅' },
  { id: 'bg-5', name: 'وردي سوجو', class: 'bg-gradient-to-b from-[#3b1c32] via-[#1f0d1c] to-[#0a0509]', preview: '🌸' },
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

interface JopiGiftItem {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  icon: string;
  tag?: string;
  category: 'Backpack' | 'Gift' | 'Lucky' | 'Event' | 'Privilege' | 'Tokens' | 'Interactive' | 'Countries';
}

const JOPI_ALL_GIFTS: JopiGiftItem[] = [
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

const MULTIPLIERS = [1, 10, 50, 100, 999];

const ROCKET_GOALS: Record<number, number> = {
  1: 640000,
  2: 1000000,
  3: 20000000,
  4: 50000000,
  5: 100000000,
};

export const LiveVideoRoomModal: React.FC = () => {
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

  // استرجاع وضمان وجود خلفية مخصصة للغرفة دائماً
  const [currentBg, setCurrentBg] = useState<string>(() => {
    if (!activeRoom?.id) return JOPI_ROOM_BACKGROUNDS[0].class;
    const savedBg = localStorage.getItem(`jopi_room_bg_${activeRoom.id}`);
    if (savedBg) return savedBg;
    const initialBg = activeRoom?.bg_theme || JOPI_ROOM_BACKGROUNDS[0].class;
    localStorage.setItem(`jopi_room_bg_${activeRoom.id}`, initialBg);
    return initialBg;
  });

  const [isChatVisible, setIsChatVisible] = useState<boolean>(true);

  // اختيار التخطيط النشط (Layout ID)
  const [activeLayoutId, setActiveLayoutId] = useState<string>(() => {
    if (!activeRoom?.id) return JOPI_ROOM_LAYOUTS[0].id;
    return localStorage.getItem(`jopi_room_layout_id_${activeRoom.id}`) || JOPI_ROOM_LAYOUTS[0].id;
  });

  const currentLayout = JOPI_ROOM_LAYOUTS.find(l => l.id === activeLayoutId) || JOPI_ROOM_LAYOUTS[0];

  const [selectedMicCount, setSelectedMicCount] = useState<number>(() => {
    if (!activeRoom?.id) return currentLayout.totalSeats;
    const savedMics = localStorage.getItem(`jopi_room_mics_${activeRoom.id}`);
    if (savedMics) return parseInt(savedMics, 10);
    return currentLayout.totalSeats;
  });

  const availableLayouts = JOPI_ROOM_LAYOUTS.map(l => ({ count: l.totalSeats, label: l.label, pk: l.totalSeats >= 8 }));

  const [seats, setSeats] = useState<VideoSeat[]>([]);
  const [selectedSeatForAction, setSelectedSeatForAction] = useState<number | null>(null);
  const [seatActionModalOpen, setSeatActionModalOpen] = useState(false);
  const [seatGiftPoints, setSeatGiftPoints] = useState<Record<number, number>>({});
  const [roomMembers, setRoomMembers] = useState<User[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  const [roomType, setRoomType] = useState<string>(activeRoom?.category || 'Friendship');
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [roomSettingsModalOpen, setRoomSettingsModalOpen] = useState(false);
  const [micConfigModalOpen, setMicConfigModalOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [roomTypeModalOpen, setRoomTypeModalOpen] = useState(false);
  const [roomMembersModalOpen, setRoomMembersModalOpen] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const [isRoomMuted, setIsRoomMuted] = useState(false);

  const [roomExitMenuOpen, setRoomExitMenuOpen] = useState(false);
  const [roomMoreMenuOpen, setRoomMoreMenuOpen] = useState(false);

  const [roomTasksModalOpen, setRoomTasksModalOpen] = useState(false);
  const [roomLevelModalOpen, setRoomLevelModalOpen] = useState(false);

  const [rocketTaskModalOpen, setRocketTaskModalOpen] = useState(false);
  const [rocketLevel, setRocketLevel] = useState<number>(1);
  const [roomFuelCoins, setRoomFuelCoins] = useState<number>(0);
  const [isRocketLaunching, setIsRocketLaunching] = useState<boolean>(false);
  const [rocketTab, setRocketTab] = useState<'visitors' | 'top1' | 'owner'>('visitors');

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

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [activeGiftTab, setActiveGiftTab] = useState<typeof GIFT_TABS[number]>('Gift');
  const [selectedGift, setSelectedGift] = useState<JopiGiftItem>(JOPI_ALL_GIFTS[8]);
  const [selectedGiftMultiplier, setSelectedGiftMultiplier] = useState<number>(1);
  const [multiplierMenuOpen, setMultiplierMenuOpen] = useState(false);
  const [giftTargetType, setGiftTargetType] = useState<'host' | 'all'>('host');
  const [sendingGift, setSendingGift] = useState(false);
  const [showTopUpDirectModal, setShowTopUpDirectModal] = useState(false);
  const [selectedTopUpPkg, setSelectedTopUpPkg] = useState(CAT_COIN_PACKAGES[0]);

  // حالة فتح نافذة الدردشة الخاصة بين الأصدقاء
  const [privateChatModalOpen, setPrivateChatModalOpen] = useState(false);

  const [pkModalOpen, setPkModalOpen] = useState(false);
  const [pkTab, setPkTab] = useState<'cross' | 'in_room'>('cross');
  const [randomMediaType, setRandomMediaType] = useState<'voice' | 'video'>('video');
  const [inRoomPkMode, setInRoomPkMode] = useState<'all' | 'battle'>('all');
  const [pkDuration, setPkDuration] = useState<number>(300);
  const [searchRoomId, setSearchRoomId] = useState('');

  const [isPkActive, setIsPkActive] = useState<boolean>(() => {
    if (!activeRoom?.id) return false;
    const savedActive = localStorage.getItem(`jopi_room_pk_active_${activeRoom.id}`);
    return savedActive === 'true';
  });

  const [pkTimeLeft, setPkTimeLeft] = useState<number>(() => {
    if (!activeRoom?.id) return 300;
    const savedTime = localStorage.getItem(`jopi_room_pk_time_${activeRoom.id}`);
    if (savedTime) {
      const parsed = parseInt(savedTime, 10);
      return parsed > 0 ? parsed : 0;
    }
    return 300;
  });

  const [redScore, setRedScore] = useState<number>(() => {
    if (!activeRoom?.id) return 0;
    const val = localStorage.getItem(`jopi_room_pk_red_${activeRoom.id}`);
    return val ? parseInt(val, 10) : 0;
  });

  const [blueScore, setBlueScore] = useState<number>(() => {
    if (!activeRoom?.id) return 0;
    const val = localStorage.getItem(`jopi_room_pk_blue_${activeRoom.id}`);
    return val ? parseInt(val, 10) : 0;
  });

  const [friendlyScore, setFriendlyScore] = useState<number>(() => {
    if (!activeRoom?.id) return 0;
    const val = localStorage.getItem(`jopi_room_pk_friendly_${activeRoom.id}`);
    return val ? parseInt(val, 10) : 0;
  });

  const [activePkType, setActivePkType] = useState<'friendly' | 'battle'>(() => {
    if (!activeRoom?.id) return 'battle';
    const val = localStorage.getItem(`jopi_room_pk_type_${activeRoom.id}`);
    return (val === 'friendly' || val === 'battle') ? val : 'battle';
  });

  const [pkResultModalOpen, setPkResultModalOpen] = useState(false);
  const [pkWinner, setPkWinner] = useState<'red' | 'blue' | 'draw' | 'friendly'>('draw');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);
  const isPkActiveRef = useRef(isPkActive);
  const roomChannelRef = useRef<any>(null);

  // مزامنة المقاعد عبر إرسال تحديث المقعد الفردي لمنع حذف الجالسين
  const syncSeatsToSupabase = async (newSeats: VideoSeat[], changedIndex?: number) => {
    if (!activeRoom?.id) return;
    try {
      await supabase.from('voice_rooms').update({ seats: newSeats }).eq('id', activeRoom.id);
    } catch (_) {}

    if (roomChannelRef.current) {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'seat_update',
        payload: { 
          seats: newSeats,
          changedSeat: changedIndex !== undefined ? newSeats[changedIndex] : null
        }
      });
    }
  };

  // جلب أعضاء الغرفة والمزامنة الحية عبر Supabase Presence والـ Realtime
  useEffect(() => {
    if (!activeRoom?.id || !currentUser) return;

    // الاتصال الصوتي الآمن
    const audioAny = AudioService as any;
    try {
      if (typeof audioAny.joinRoom === 'function') audioAny.joinRoom(activeRoom.id);
      else if (typeof audioAny.getInstance === 'function' && typeof audioAny.getInstance().joinRoom === 'function') audioAny.getInstance().joinRoom(activeRoom.id);
    } catch (err) {
      console.warn('AudioService join error:', err);
    }

    setRoomMembers(prev => {
      if (!prev.some(m => m.id === currentUser.id)) {
        return [...prev, currentUser];
      }
      return prev;
    });

    RoomService.getRoomMembers(activeRoom.id).then(members => {
      if (members && members.length > 0) {
        setRoomMembers(prev => {
          const map = new Map<string, User>();
          [...prev, ...members].forEach(u => u && u.id && map.set(u.id, u));
          return Array.from(map.values());
        });
      }
    }).catch(() => {});

    // جلب المقاعد المحفوظة فوراً وتعيينها
    supabase
      .from('voice_rooms')
      .select('seats')
      .eq('id', activeRoom.id)
      .single()
      .then(
        ({ data, error }) => {
          if (!error && data && Array.isArray(data.seats) && data.seats.length > 0) {
            setSeats(data.seats);
          }
        },
        () => {}
      );

    const cleanRoomId = activeRoom.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const roomChannel = supabase.channel(`room_presence_${cleanRoomId}`, {
      config: {
        presence: { key: currentUser.id }
      }
    });

    roomChannelRef.current = roomChannel;

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        const activeUsers: User[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user) activeUsers.push(p.user);
          });
        });
        if (activeUsers.length > 0) {
          setRoomMembers(prev => {
            const map = new Map<string, User>();
            [currentUser, ...prev, ...activeUsers].forEach(u => u && u.id && map.set(u.id, u));
            return Array.from(map.values());
          });
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((p: any) => p.user).filter(Boolean);
        setRoomMembers(prev => {
          const map = new Map<string, User>();
          [...prev, ...newUsers].forEach(u => u && u.id && map.set(u.id, u));
          return Array.from(map.values());
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftIds = new Set(leftPresences.map((p: any) => p.user?.id).filter(Boolean));
        setRoomMembers(prev => prev.filter(u => !leftIds.has(u.id) || u.id === currentUser.id));
      })
      .on('broadcast', { event: 'seat_update' }, (payload) => {
        const incomingSeats = payload.payload?.seats;
        const changed = payload.payload?.changedSeat;

        setSeats(prev => {
          if (changed && prev.length > 0) {
            return prev.map(s => s.seat_index === changed.seat_index ? changed : s);
          }
          if (Array.isArray(incomingSeats) && incomingSeats.length > 0) {
            return incomingSeats;
          }
          return prev;
        });
      })
      .on('broadcast', { event: 'request_current_seats' }, () => {
        setSeats(currentSeats => {
          if (currentSeats.some(s => s.user_id === currentUser.id) && roomChannelRef.current) {
            roomChannelRef.current.send({
              type: 'broadcast',
              event: 'seat_update',
              payload: { seats: currentSeats }
            });
          }
          return currentSeats;
        });
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_rooms',
          filter: `id=eq.${activeRoom.id}`
        },
        (payload: any) => {
          if (payload?.new) {
            const updatedRoom = payload.new as VoiceRoom;
            setRoom(updatedRoom);
            if (Array.isArray(payload.new.seats)) {
              setSeats(payload.new.seats);
            }
          }
        }
      );

    roomChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await roomChannel.track({
          user: currentUser,
          online_at: new Date().toISOString()
        });
        roomChannel.send({
          type: 'broadcast',
          event: 'request_current_seats',
          payload: { requester_id: currentUser.id }
        });
      }
    });

    return () => {
      const audioClean = AudioService as any;
      try {
        if (typeof audioClean.leaveRoom === 'function') audioClean.leaveRoom();
        else if (typeof audioClean.getInstance === 'function' && typeof audioClean.getInstance().leaveRoom === 'function') audioClean.getInstance().leaveRoom();
      } catch (err) {
        console.warn('AudioService leave error:', err);
      }
      roomChannel.untrack();
      supabase.removeChannel(roomChannel);
      roomChannelRef.current = null;
    };
  }, [activeRoom?.id, currentUser]);

  useEffect(() => {
    isPkActiveRef.current = isPkActive;
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_pk_active_${activeRoom.id}`, isPkActive ? 'true' : 'false');
    }
  }, [isPkActive, activeRoom?.id]);

  useEffect(() => {
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_pk_time_${activeRoom.id}`, pkTimeLeft.toString());
    }
  }, [pkTimeLeft, activeRoom?.id]);

  useEffect(() => {
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_pk_red_${activeRoom.id}`, redScore.toString());
      localStorage.setItem(`jopi_room_pk_blue_${activeRoom.id}`, blueScore.toString());
      localStorage.setItem(`jopi_room_pk_friendly_${activeRoom.id}`, friendlyScore.toString());
      localStorage.setItem(`jopi_room_pk_type_${activeRoom.id}`, activePkType);
    }
  }, [redScore, blueScore, friendlyScore, activePkType, activeRoom?.id]);

  const hostId = activeRoom?.host_id || activeRoom?.host?.id;
  const isHostOrAdmin = Boolean(
    currentUser?.id && (
      currentUser.id === hostId ||
      (Array.isArray(activeRoom?.admins) && activeRoom.admins.includes(currentUser.id))
    )
  );

  useEffect(() => {
    if (!activeRoom?.id) return;
    const stored = localStorage.getItem(`jopi_room_rocket_fuel_${activeRoom.id}`);
    const fuel = stored ? parseInt(stored, 10) : 0;
    setRoomFuelCoins(fuel);

    let lvl = 1;
    if (fuel >= ROCKET_GOALS[5]) lvl = 5;
    else if (fuel >= ROCKET_GOALS[4]) lvl = 4;
    else if (fuel >= ROCKET_GOALS[3]) lvl = 3;
    else if (fuel >= ROCKET_GOALS[2]) lvl = 2;
    else lvl = 1;
    setRocketLevel(lvl);
  }, [activeRoom?.id]);

  const triggerAutoRocketLaunch = (levelAchieved: number) => {
    setIsRocketLaunching(true);
    setRocketTaskModalOpen(true);
    showToast(`🚀 مبروك! بلغت هدايا الغرفة الهدف وانطلق صاروخ المستوى ${levelAchieved} تلقائياً!`, 'success');
    RoomService.sendRoomMessage(activeRoom?.id || '', `🚀 انطلق صاروخ المستوى ${levelAchieved} تلقائياً في الغرفة بعد تحقيق هدف الهدايا! 🎉`, currentUser, 'game').then(() => {}, () => {});

    setTimeout(() => {
      setIsRocketLaunching(false);
    }, 6000);
  };

  useEffect(() => {
    let timer: any = null;
    if (isPkActive && pkTimeLeft > 0) {
      timer = setInterval(() => {
        setPkTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsPkActive(false);
            if (activeRoom?.id) {
              localStorage.setItem(`jopi_room_pk_active_${activeRoom.id}`, 'false');
            }
            if (activePkType === 'friendly') {
              setPkWinner('friendly');
            } else {
              const winner = redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'draw';
              setPkWinner(winner);
            }
            setPkResultModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPkActive, pkTimeLeft, redScore, blueScore, activePkType, activeRoom?.id]);

  useEffect(() => {
    setSeats(prev => {
      if (prev.length > 0) return prev;
      return Array.from({ length: currentLayout.totalSeats }, (_, i) => ({
        seat_index: i,
        user_id: null,
        user: null,
        is_muted: false,
        is_video_off: false,
      }));
    });
  }, [currentLayout]);

  // تشغيل الصوت والمايك المحلي وضمان تفعيله للبث
  const startLocalMedia = async (isVideoNeeded: boolean) => {
    try {
      if (localStream && localStream.active) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = true;
        if (localVideoRef.current && isVideoNeeded) {
          localVideoRef.current.srcObject = localStream;
        }
        setIsMicOn(true);
        setIsCamOn(isVideoNeeded);
        return localStream;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoNeeded ? { facingMode: cameraFacingMode, width: { ideal: 640 }, height: { ideal: 640 } } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setLocalStream(stream);

      if (localVideoRef.current && isVideoNeeded) {
        localVideoRef.current.srcObject = stream;
      }
      setIsCamOn(isVideoNeeded);
      setIsMicOn(true);
      return stream;
    } catch {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        setLocalStream(audioStream);
        setIsCamOn(false);
        setIsMicOn(true);
        return audioStream;
      } catch {
        showToast('تعذر الوصول إلى الميكروفون أو الكاميرا', 'error');
        return null;
      }
    }
  };

  const stopLocalMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    const audioAny = AudioService as any;
    try {
      if (typeof audioAny.unpublishTrack === 'function') audioAny.unpublishTrack();
      else if (typeof audioAny.getInstance === 'function' && typeof audioAny.getInstance().unpublishTrack === 'function') audioAny.getInstance().unpublishTrack();
    } catch (e) {
      console.warn('Audio unpublish error:', e);
    }
  };

  const handleTakeSeat = async (targetIndex: number) => {
    setSeatActionModalOpen(false);
    const isVideoSeat = targetIndex < currentLayout.videoCount;
    const stream = await startLocalMedia(isVideoSeat);
    if (!stream) return;

    setSeats(prev => {
      const base = prev.length > 0 
        ? [...prev] 
        : Array.from({ length: currentLayout.totalSeats }, (_, i) => ({
            seat_index: i,
            user_id: null,
            user: null,
            is_muted: false,
            is_video_off: false,
          }));

      const updated = base.map(s => {
        // إخلاء مقعدي القديم فقط إن وجد
        if (s.user_id === currentUser?.id && s.seat_index !== targetIndex) {
          return { ...s, user_id: null, user: null, is_muted: false, is_video_off: false };
        }
        // الجلوس على المقعد الجديد
        if (s.seat_index === targetIndex) {
          return { 
            ...s, 
            user_id: currentUser?.id || null, 
            user: currentUser, 
            is_muted: false, 
            is_video_off: !isVideoSeat 
          };
        }
        // الإبقاء التام على المستخدمين الآخرين كما هم
        return s;
      });

      // مزامنة المقعد مع تحديد رقم المقعد المتغير
      syncSeatsToSupabase(updated, targetIndex);
      return updated;
    });

    showToast(`صعدت على المقعد ${targetIndex + 1} 🎙️`, 'success');
  };

  const handleLeaveSeat = () => {
    stopLocalMedia();
    setSeats(prev => {
      const updated = prev.map(s => {
        if (s.user_id === currentUser?.id) {
          return { ...s, user_id: null, user: null, is_muted: false, is_video_off: false };
        }
        return s;
      });
      syncSeatsToSupabase(updated);
      return updated;
    });
    showToast('غادرت المقعد', 'info');
  };

  const toggleLocalMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
      setSeats(prev => {
        const updated = prev.map(s => s.user_id === currentUser?.id ? { ...s, is_muted: !audioTrack.enabled } : s);
        syncSeatsToSupabase(updated);
        return updated;
      });
    }
  };

  const toggleLocalCam = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamOn(videoTrack.enabled);
      setSeats(prev => {
        const updated = prev.map(s => s.user_id === currentUser?.id ? { ...s, is_video_off: !videoTrack.enabled } : s);
        syncSeatsToSupabase(updated);
        return updated;
      });
    }
  };

  const flipCamera = async () => {
    const next = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(next);
    if (localStream) {
      await startLocalMedia(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom) return;

    const newMsg: RoomMessage = {
      id: Date.now().toString(),
      room_id: activeRoom.id,
      sender: currentUser,
      message_type: 'chat',
      text: chatInput.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendJopiGift = async () => {
    if (!activeRoom || !currentUser) return;

    const seatedSpeakers = seats.filter(s => s.user_id && s.user_id !== currentUser.id);
    const targetCount = giftTargetType === 'all' ? Math.max(1, seatedSpeakers.length) : 1;
    const totalCost = selectedGift.price * selectedGiftMultiplier * targetCount;

    if (coinBalance < totalCost) {
      showToast('رصيدك لا يكفي لإرسال هذه الهدية! ⚠️', 'error');
      return;
    }

    setSendingGift(true);
    try {
      const genericGift: Gift = {
        id: selectedGift.id,
        name: selectedGift.name,
        name_ar: selectedGift.name_ar,
        coin_price: selectedGift.price,
        icon: selectedGift.icon,
        category: 'special'
      };

      const targetLabel = giftTargetType === 'all' 
        ? `جميع الكاميرات (${targetCount}X)` 
        : `${activeRoom.host?.display_name || 'المستضيف'}`;

      await RoomService.sendRoomGift(
        activeRoom.id,
        genericGift,
        currentUser,
        targetLabel,
        selectedGiftMultiplier * targetCount
      );

      const perSeat = selectedGift.price * selectedGiftMultiplier;
      setSeatGiftPoints(prev => {
        const up = { ...prev };
        if (giftTargetType === 'all') {
          seats.forEach(s => {
            if (s.user_id) up[s.seat_index] = (up[s.seat_index] || 0) + perSeat;
          });
        } else {
          up[0] = (up[0] || 0) + perSeat;
        }
        return up;
      });

      const newFuel = roomFuelCoins + totalCost;
      setRoomFuelCoins(newFuel);
      localStorage.setItem(`jopi_room_rocket_fuel_${activeRoom.id}`, newFuel.toString());

      const prevLvl = rocketLevel;
      let nextLvl = prevLvl;
      if (newFuel >= ROCKET_GOALS[5]) nextLvl = 5;
      else if (newFuel >= ROCKET_GOALS[4]) nextLvl = 4;
      else if (newFuel >= ROCKET_GOALS[3]) nextLvl = 3;
      else if (newFuel >= ROCKET_GOALS[2]) nextLvl = 2;
      else if (newFuel >= ROCKET_GOALS[1]) nextLvl = 1;

      if (nextLvl > prevLvl && newFuel >= ROCKET_GOALS[nextLvl]) {
        setRocketLevel(nextLvl);
        triggerAutoRocketLaunch(nextLvl);
      } else if (newFuel >= ROCKET_GOALS[1] && prevLvl === 1 && !isRocketLaunching) {
        triggerAutoRocketLaunch(1);
      }

      if (isPkActiveRef.current) {
        if (activePkType === 'friendly') {
          setFriendlyScore(s => s + totalCost);
        } else {
          if (Math.random() > 0.5) setRedScore(r => r + totalCost);
          else setBlueScore(b => b + totalCost);
        }
      }

      refreshWallet();
      showToast(`تم إرسال ${selectedGift.name_ar} ${selectedGift.icon} x${selectedGiftMultiplier}! 🎉`, 'success');
      setIsGiftModalOpen(false);
    } catch {
      showToast('فشل في إرسال الهدية', 'error');
    } finally {
      setSendingGift(false);
    }
  };

  const handleStartPK = () => {
    setPkModalOpen(false);
    setIsPkActive(true);
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_pk_active_${activeRoom.id}`, 'true');
    }
    setPkTimeLeft(pkDuration);
    setRedScore(0);
    setBlueScore(0);
    setFriendlyScore(0);

    if (pkTab === 'in_room' && inRoomPkMode === 'all') {
      setActivePkType('friendly');
      showToast('🤝 انطلق التحدي الودي الموحد لجميع الكاميرات!', 'success');
    } else {
      setActivePkType('battle');
      showToast('⚔️ انطلق تحدي الـ PK المباشر بين الفرق!', 'success');
    }
  };

  const handleStopPK = () => {
    setIsPkActive(false);
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_pk_active_${activeRoom.id}`, 'false');
    }
    if (activePkType === 'friendly') {
      setPkWinner('friendly');
    } else {
      const winner = redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'draw';
      setPkWinner(winner);
    }
    setPkResultModalOpen(true);
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
      }, 4500);
    } catch {
      setIsSpinning(false);
    }
  };

  const handleLaunchRocketGame = async () => {
    if (rocketGameState === 'flying') return;
    setRocketGameState('flying');
    setRocketMultiplier(1.00);
    setHasRocketCashedOut(false);

    const rand = Math.random();
    let calculatedCrash = 1.05;
    if (rand > 0.04) {
      calculatedCrash = Number((0.96 / (1 - rand)).toFixed(2));
    }
    rocketCrashPointRef.current = Math.min(calculatedCrash, 50.00);

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
  };

  const handleRocketCashOut = () => {
    if (rocketGameState !== 'flying' || hasRocketCashedOut) return;
    setHasRocketCashedOut(true);
    const winReward = Math.floor(rocketBetAmount * rocketMultiplier);
    showToast(`كفو! سحبت بنجاح على مضاعف ${rocketMultiplier}x وربحت ${winReward} كوينز 🚀`, 'success');
  };

  const changeLayout = async (layoutId: string) => {
    setActiveLayoutId(layoutId);
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_layout_id_${activeRoom.id}`, layoutId);
    }
    const targetLayout = JOPI_ROOM_LAYOUTS.find(l => l.id === layoutId);
    if (targetLayout) {
      setSelectedMicCount(targetLayout.totalSeats);
      if (activeRoom?.id) {
        localStorage.setItem(`jopi_room_mics_${activeRoom.id}`, targetLayout.totalSeats.toString());
      }
    }
    setMicConfigModalOpen(false);
    showToast('تم تحديث وضعية وعرض الكاميرات والمايكات بنجاح 📐', 'success');
  };

  const changeBackground = async (bgClass: string) => {
    setCurrentBg(bgClass);
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_bg_${activeRoom.id}`, bgClass);
    }
    setBgModalOpen(false);
    showToast('تم تغيير خلفية الغرفة بنجاح 🎨', 'success');
  };

  const changeRoomType = async (type: string) => {
    setRoomType(type);
    setRoomTypeModalOpen(false);
    showToast(`تم تغيير نوع الغرفة إلى ${type}`, 'success');
  };

  const changeMicCount = async (newCount: number) => {
    setSelectedMicCount(newCount);
    if (activeRoom?.id) {
      localStorage.setItem(`jopi_room_mics_${activeRoom.id}`, newCount.toString());
    }
    setMicConfigModalOpen(false);
    showToast(`تم تعيين المقاعد إلى ${newCount}`, 'success');
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
    { id: 'lucky_match', name: 'Lucky Match', icon: '🐣', onClick: () => { setToolsDrawerOpen(false); showToast('Lucky Match قريباً!', 'info'); } },
    { id: 'texas_cowboy', name: 'Texas Cowboy', icon: '🤠', onClick: () => { setToolsDrawerOpen(false); showToast('Texas Cowboy قريباً!', 'info'); } },
    { id: 'game_center', name: 'Game Center', icon: '🎮', onClick: () => { setToolsDrawerOpen(false); setLuckyWheelModalOpen(true); } },
  ];

  useEffect(() => {
    return () => {
      stopLocalMedia();
      if (rocketIntervalRef.current) clearInterval(rocketIntervalRef.current);
    };
  }, []);

  if (!activeRoom || isRoomMinimized || !currentUser) return null;

  // التحقق من حالة المستخدم ومقعده الحالي
  const currentSeat = seats.find(s => s.user_id === currentUser.id);
  const isUserSeated = Boolean(currentSeat);
  const isUserOnVideoSeat = isUserSeated && currentSeat ? currentSeat.seat_index < currentLayout.videoCount : false;

  // جلب معرفات كل الجالسين على المايكات لإخفائهم من مستطيل الحضور السفلي مع الحفاظ على العدد الكلي
  const seatedUserIds = new Set(seats.map(s => s.user_id).filter(Boolean));
  const unseatedMembers = roomMembers.filter(m => !seatedUserIds.has(m.id));

  const totalPkScore = redScore + blueScore;
  const redPercentage = totalPkScore === 0 ? 50 : Math.max(10, Math.min(90, Math.round((redScore / totalPkScore) * 100)));
  const bluePercentage = 100 - redPercentage;
  const filteredGifts = JOPI_ALL_GIFTS.filter(g => g.category === activeGiftTab);

  return (
    <div className="fixed inset-0 z-50 text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* خلفية سوجو الأرجوانية الفاخرة المضمونة والمحفوظة */}
      <div className={`absolute inset-0 ${currentBg} -z-10`} />

      <input ref={musicFileInputRef} type="file" accept="audio/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) showToast(`تم تشغيل ملف الموسيقى: ${file.name} 🎵`, 'success');
      }} className="hidden" />

      {/* الشريط العلوي الدقيق بنمط سوجو الأرجواني */}
      <div className="relative z-20 px-3 pt-3 pb-2 flex items-center justify-between border-b border-[#7367f0]/20 bg-[#0f0d24]/60 backdrop-blur-xl">
        <div 
          onClick={() => setRoomLevelModalOpen(true)}
          className="flex items-center gap-2 cursor-pointer bg-[#181238]/80 p-1.5 pe-3 rounded-full border border-[#7367f0]/30 hover:bg-[#20184a] transition shadow-lg"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400">
            <img src={activeRoom.host?.profile_photo || ''} alt="" className="w-full h-full object-cover" />
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute bottom-0 end-0" />
          </div>
          <div className="min-w-0 max-w-[100px]">
            <h3 className="text-xs font-black truncate">{activeRoom.title}</h3>
            <span className="text-[9px] text-purple-300 font-mono">ID: {activeRoom.id.slice(-6)}</span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-200 font-black text-[9px] border border-purple-400/40">
            Lv.2
          </span>
        </div>

        {/* أزرار العلوي: مهام، صاروخ، زر الثلاث نقاط، وزر الخروج/الإغلاق المطور */}
        <div className="flex items-center gap-1.5">
          {/* مؤشر عدد الأشخاص المتواجدين */}
          <div 
            onClick={() => setRoomMembersModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181238]/80 border border-purple-500/30 text-xs font-bold text-purple-200 cursor-pointer shadow hover:bg-[#20184a] transition"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono">{roomMembers.length > 0 ? roomMembers.length : 1}</span>
          </div>

          <button 
            type="button"
            onClick={() => setRoomTasksModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#948aff] to-[#7367f0] border border-purple-400/40 text-[10px] font-black shadow-lg cursor-pointer text-white"
          >
            <span>📋 مهام الغرفة</span>
          </button>

          <button 
            type="button"
            onClick={() => setRocketTaskModalOpen(true)}
            className="p-2 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg hover:scale-105 transition cursor-pointer relative border border-purple-400/30"
            title="Rocket Task"
          >
            <Rocket className="w-4 h-4 text-amber-300" />
            {roomFuelCoins >= ROCKET_GOALS[1] && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-0 end-0 animate-ping" />
            )}
          </button>

          {/* زر الثلاث نقاط الجديد */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => { setRoomMoreMenuOpen(!roomMoreMenuOpen); setRoomExitMenuOpen(false); }}
              className="p-2 rounded-full bg-[#1b143a] hover:bg-[#251c52] border border-[#7367f0]/40 text-white shadow-md transition cursor-pointer flex items-center justify-center"
              title="المزيد من الخيارات"
            >
              <MoreVertical className="w-4 h-4 text-purple-300" />
            </button>

            {roomMoreMenuOpen && (
              <div className="absolute top-10 end-0 bg-[#130f2c] border border-purple-500/30 rounded-2xl p-1.5 shadow-2xl z-50 w-40 space-y-1">
                <button 
                  type="button" 
                  onClick={() => { setRoomMoreMenuOpen(false); setBgModalOpen(true); }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b143a] hover:bg-purple-900/40 text-xs font-bold text-purple-200 flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>خلفيات الغرفة</span>
                </button>
                {isHostOrAdmin && (
                  <button 
                    type="button" 
                    onClick={() => { setRoomMoreMenuOpen(false); setMicConfigModalOpen(true); }}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b143a] hover:bg-purple-900/40 text-xs font-bold text-purple-200 flex items-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل المايكات</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* زر إغلاق / خروج الغرفة */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => { setRoomExitMenuOpen(!roomExitMenuOpen); setRoomMoreMenuOpen(false); }}
              className="p-2 rounded-full bg-[#1b143a] hover:bg-[#251c52] border border-[#7367f0]/40 text-white shadow-md transition cursor-pointer flex items-center justify-center"
              title="خيارات الغرفة"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>

            {roomExitMenuOpen && (
              <div className="absolute top-10 end-0 bg-[#130f2c] border border-purple-500/30 rounded-2xl p-1.5 shadow-2xl z-50 w-36 space-y-1">
                <button 
                  type="button" 
                  onClick={() => { setRoomExitMenuOpen(false); minimizeRoom(); }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b143a] hover:bg-purple-900/40 text-xs font-bold text-purple-200 flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>تصغير الغرفة</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setRoomExitMenuOpen(false); stopLocalMedia(); closeRoom(); }}
                  className="w-full px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-xs font-bold text-rose-300 flex items-center gap-2 transition cursor-pointer border border-rose-500/30 shadow-sm"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>خروج الغرفة</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* شريط تحدي الـ PK الأرجواني المباشر */}
      {isPkActive && (
        <div className="relative z-20 px-3 py-1 bg-[#100d24]/80 backdrop-blur-md border-b border-purple-500/30 shadow-inner">
          <div className="max-w-md mx-auto flex flex-col gap-1">
            {activePkType === 'friendly' ? (
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-purple-300 font-mono flex items-center gap-1">✨ PK (All Mics)</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-200 font-mono text-xs border border-purple-400/40">
                  <Timer className="w-3.5 h-3.5 animate-spin" />
                  <span>{formatPkTime(pkTimeLeft)}</span>
                </div>
                <span className="text-amber-300 font-mono">{friendlyScore} 🪙</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-[11px] font-black">
                  <span className="text-rose-400 font-mono">🔴 RED: {redScore}</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/30 text-amber-300 font-mono text-xs border border-purple-400/40">
                    <Timer className="w-3.5 h-3.5 animate-spin" />
                    <span>{formatPkTime(pkTimeLeft)}</span>
                  </div>
                  <span className="text-sky-400 font-mono">BLUE: {blueScore} 🔵</span>
                </div>
                <div className="relative w-full h-2.5 rounded-full overflow-hidden flex bg-[#07050f] border border-purple-500/30">
                  <div style={{ width: `${redPercentage}%` }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300" />
                  <div style={{ width: `${bluePercentage}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* توزيع الكاميرات والمايكات المتناسقة حسب التخطيط المختار */}
      <div className="relative z-10 flex-1 px-3 py-2 flex flex-col justify-start gap-3 overflow-hidden">
        {currentLayout.videoCount === 1 && currentLayout.micCount >= 5 ? (
          <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center gap-2">
            {(() => {
              const seat = seats[0] || { seat_index: 0, user_id: null, is_muted: false, is_video_off: false };
              const isLocal = seat.user_id === currentUser.id;
              const hasUser = !!seat.user_id;
              return (
                <div className="relative bg-[#161138]/90 rounded-3xl overflow-hidden w-full h-[60%] flex flex-col items-center justify-center shadow-2xl border border-[#7367f0]/40">
                  {hasUser ? (
                    <>
                      {isLocal ? (
                        <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${seat.is_video_off ? 'hidden' : 'block'}`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#100d24]">
                          <img src={seat.user?.profile_photo || ''} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-purple-500 shadow-2xl" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#0f0d24]/80 text-[11px] font-black text-white border border-purple-500/20">{seat.user?.display_name}</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0f0d24]/90 border border-amber-400/40 shadow">
                          <Coins className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[9px] font-mono text-amber-300">{seatGiftPoints[0] || 0}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        if (isUserSeated) handleTakeSeat(0);
                        else { setSelectedSeatForAction(0); setSeatActionModalOpen(true); }
                      }} 
                      className="flex flex-col items-center gap-1.5 text-purple-300/60 hover:text-white transition cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl border border-dashed border-purple-400/40 flex items-center justify-center bg-[#1e1742]/50">
                        <VideoIcon className="w-5 h-5 text-purple-300" />
                      </div>
                      <span className="text-xs font-bold text-purple-200/80">تشغيل الكاميرا الرئيسية (Live)</span>
                    </button>
                  )}
                </div>
              );
            })()}

            <div className={`grid gap-2 w-full max-w-md mx-auto ${currentLayout.micCount <= 5 ? 'grid-cols-5' : 'grid-cols-5'}`}>
              {seats.slice(1, currentLayout.totalSeats).map((seat, sIdx) => {
                const actualIdx = sIdx + 1;
                const hasUser = !!seat.user_id;
                return (
                  <div key={actualIdx} className="flex flex-col items-center gap-1">
                    <div 
                      onClick={() => {
                        if (isUserSeated) handleTakeSeat(actualIdx);
                        else { setSelectedSeatForAction(actualIdx); setSeatActionModalOpen(true); }
                      }}
                      className="w-10 h-10 rounded-full bg-[#181238]/90 flex items-center justify-center cursor-pointer shadow border border-purple-500/30 overflow-hidden hover:border-purple-400 transition"
                    >
                      {hasUser ? (
                        <img src={seat.user?.profile_photo || ''} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-purple-300/40" />
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-purple-300/60">{actualIdx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 w-full max-w-md mx-auto">
            <div className={`grid gap-2 w-full ${currentLayout.videoCount === 1 ? 'grid-cols-1' : currentLayout.videoCount <= 2 ? 'grid-cols-2' : currentLayout.videoCount <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {seats.slice(0, currentLayout.videoCount).map((seat, idx) => {
                const isLocal = seat.user_id === currentUser.id;
                const hasUser = !!seat.user_id;
                return (
                  <div 
                    key={idx}
                    className="relative bg-[#161138]/90 rounded-2xl overflow-hidden aspect-[16/10] flex flex-col items-center justify-center shadow-lg border border-[#7367f0]/40"
                  >
                    {hasUser ? (
                      <>
                        {isLocal ? (
                          <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${seat.is_video_off ? 'hidden' : 'block'}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#100d24]">
                            <img src={seat.user?.profile_photo || ''} alt="" className="w-10 h-10 rounded-full object-cover border border-purple-500" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                          <span className="px-1.5 py-0.5 rounded bg-[#0f0d24]/80 text-[8px] font-black text-white">{seat.user?.display_name}</span>
                          <span className="text-[7px] font-mono text-amber-300">{seatGiftPoints[idx] || 0} 🪙</span>
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          if (isUserSeated) handleTakeSeat(idx);
                          else { setSelectedSeatForAction(idx); setSeatActionModalOpen(true); }
                        }} 
                        className="flex flex-col items-center gap-1 text-purple-300/50 hover:text-white transition cursor-pointer"
                      >
                        <VideoIcon className="w-4 h-4 text-purple-300" />
                        <span className="text-[9px]">Cam {idx + 1}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {currentLayout.micCount > 0 && (
              <div className={`grid gap-1.5 w-full ${currentLayout.micCount <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
                {seats.slice(currentLayout.videoCount, currentLayout.totalSeats).map((seat, sIdx) => {
                  const actualIdx = currentLayout.videoCount + sIdx;
                  const hasUser = !!seat.user_id;
                  return (
                    <div key={actualIdx} className="flex flex-col items-center gap-0.5">
                      <div 
                        onClick={() => {
                          if (isUserSeated) handleTakeSeat(actualIdx);
                          else { setSelectedSeatForAction(actualIdx); setSeatActionModalOpen(true); }
                        }}
                        className="w-10 h-10 rounded-full bg-[#181238]/90 flex items-center justify-center cursor-pointer shadow border border-purple-500/30 overflow-hidden hover:border-purple-400 transition"
                      >
                        {hasUser ? (
                          <img src={seat.user?.profile_photo || ''} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-purple-300/40" />
                        )}
                      </div>
                      <span className="text-[7px] font-bold text-purple-300/50">{actualIdx + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* شريط الأعضاء المتواجدين أسفل المايكات مباشرة */}
        <div 
          onClick={() => setRoomMembersModalOpen(true)}
          className="w-full max-w-xs mx-auto my-1 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-purple-500/30 flex items-center justify-between cursor-pointer shadow hover:bg-black/60 transition"
        >
          <div className="flex items-center -space-x-2 overflow-hidden rtl:space-x-reverse min-w-[32px] min-h-[24px]">
            {unseatedMembers.slice(0, 4).map((m, mIdx) => (
              <img key={m.id || mIdx} src={m.profile_photo || ''} alt="" className="w-6 h-6 rounded-full object-cover border border-purple-400" />
            ))}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-200">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>{roomMembers.length > 0 ? roomMembers.length : 1} متواجدون</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
          </div>
        </div>
      </div>

      {/* الشات التفاعلي */}
      <div className="relative z-10 px-3 flex flex-col justify-end">
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161138]/80 border border-purple-500/30 text-[9px] text-purple-200 hover:text-white transition cursor-pointer shadow"
          >
            {isChatVisible ? <EyeOff className="w-3 h-3 text-purple-300" /> : <Eye className="w-3 h-3 text-amber-400" />}
            <span>{isChatVisible ? 'إخفاء الشات' : 'إظهار الشات'}</span>
          </button>
        </div>

        <AnimatePresence>
          {isChatVisible && (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 250 }}
              onDragEnd={(_, info: PanInfo) => {
                if (info.offset.x > 80) setIsChatVisible(false);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              className="max-h-32 overflow-y-auto space-y-1.5 mb-2 scrollbar-none text-xs cursor-grab active:cursor-grabbing"
            >
              <div className="px-3 py-1.5 rounded-2xl bg-[#181238]/80 backdrop-blur-md border border-purple-500/30 text-[10px] text-purple-200 leading-relaxed max-w-[85%] shadow">
                Welcome to the chat room! Please keep the chat friendly and respectful.
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-2xl bg-[#161138]/90 backdrop-blur-md border border-purple-500/20 max-w-[85%] text-slate-100 shadow">
                    <strong className="text-amber-400 text-xs me-1">{msg.sender?.display_name}:</strong>
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* الشريط السفلي للتحكم */}
      <div className="relative z-20 px-3 py-2 bg-[#100d24]/90 backdrop-blur-xl border-t border-purple-500/30 flex items-center justify-between gap-2 shadow-2xl">
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-1.5 bg-[#1a133d] border border-purple-500/30 rounded-full px-3 py-1.5 shadow-inner">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="دردشة مع الحضور..."
            className="flex-1 bg-transparent text-xs text-white placeholder-purple-300/50 focus:outline-none"
          />
          {chatInput.trim() && (
            <button type="submit" className="p-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer shadow">
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {isUserSeated && (
          <div className="flex items-center gap-1">
            <button onClick={toggleLocalMic} className={`p-2 rounded-full cursor-pointer shadow ${isMicOn ? 'bg-purple-600 text-white' : 'bg-rose-600 text-white'}`} title={isMicOn ? 'كتم المايك' : 'تشغيل المايك'}>
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            {isUserOnVideoSeat && (
              <>
                <button onClick={toggleLocalCam} className={`p-2 rounded-full cursor-pointer shadow ${isCamOn ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`} title={isCamOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}>
                  {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button onClick={flipCamera} className="p-2 rounded-full bg-[#1b143a] border border-purple-500/30 text-white cursor-pointer" title="تبديل الكاميرا">
                  <RefreshCw className="w-4 h-4 text-purple-200" />
                </button>
              </>
            )}
            <button onClick={handleLeaveSeat} className="px-2.5 py-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold cursor-pointer shadow">
              نزول
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {/* زر المكعب الرباعي (LayoutGrid) */}
          {isHostOrAdmin && (
            <button 
              type="button"
              onClick={() => setMicConfigModalOpen(true)}
              className="p-2.5 rounded-full bg-[#1b143a] hover:bg-[#251c52] border border-purple-500/40 text-white shadow-md transition cursor-pointer"
              title="تعديل المايكات"
            >
              <LayoutGrid className="w-4 h-4 text-purple-300" />
            </button>
          )}

          {/* زر الدردشة الخاصة */}
          <button 
            type="button"
            onClick={() => setPrivateChatModalOpen(true)}
            className="p-2.5 rounded-full bg-[#1b143a] hover:bg-[#251c52] border border-purple-500/40 text-white shadow-md transition cursor-pointer relative"
            title="الدردشة الخاصة"
          >
            <MessageCircle className="w-4 h-4 text-purple-300" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 end-1" />
          </button>

          {/* زر التحدي PK */}
          {isHostOrAdmin && (
            <button 
              type="button"
              onClick={() => setPkModalOpen(true)}
              className={`p-2.5 rounded-full border text-white shadow-md transition cursor-pointer ${
                isPkActive ? 'bg-purple-700 border-purple-400 animate-pulse' : 'bg-[#1b143a] border-purple-500/40 hover:bg-[#251c52]'
              }`}
              title="تحدي الـ PK"
            >
              <Swords className="w-4 h-4 text-amber-300" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsGiftModalOpen(true)}
            className="p-2.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white cursor-pointer shadow-[0_0_15px_rgba(115,103,240,0.5)] hover:scale-105 active:scale-95 transition"
          >
            <GiftIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* نافذة أعضاء الغرفة */}
      <AnimatePresence>
        {roomMembersModalOpen && (
          <div onClick={() => setRoomMembersModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <h3 className="text-base font-black text-purple-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>أعضاء الغرفة المتواجدون ({roomMembers.length})</span>
                </h3>
                <button onClick={() => setRoomMembersModalOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>
              <div className="mt-4 space-y-2 overflow-y-auto max-h-[60vh]">
                {roomMembers.map((member, idx) => (
                  <div key={member.id || idx} className="p-3 rounded-2xl bg-[#1b143a]/70 border border-purple-500/20 flex items-center justify-between shadow">
                    <div className="flex items-center gap-3">
                      <img src={member.profile_photo || ''} alt="" className="w-10 h-10 rounded-full object-cover border border-purple-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{member.display_name}</h4>
                        <span className="text-[10px] text-purple-300/60 font-mono">ID: {member.id?.slice(-6)}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-600/30 text-purple-200 text-[10px] font-bold border border-purple-400/30">مشارك</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة الدردشة الخاصة */}
      <AnimatePresence>
        {privateChatModalOpen && (
          <div onClick={() => setPrivateChatModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <h3 className="text-base font-black text-purple-200 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span>الدردشة الخاصة (Private Chat)</span>
                </h3>
                <button onClick={() => setPrivateChatModalOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>
              <div className="py-8 text-center text-purple-300/60 text-xs">
                لا توجد رسائل خاصة حالياً. ابدأ المحادثة مع أصدقائك في الغرفة! 💬
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة خلفيات الغرفة المخصصة */}
      <AnimatePresence>
        {bgModalOpen && (
          <div onClick={() => setBgModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#130f2c] border border-purple-500/30 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <h3 className="font-bold text-sm flex items-center gap-2 text-purple-200">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>تغيير خلفية الغرفة المخصصة</span>
                </h3>
                <button onClick={() => setBgModalOpen(false)}><X className="w-4 h-4 text-white/60" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto p-1">
                {JOPI_ROOM_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => changeBackground(bg.class)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition cursor-pointer shadow ${
                      currentBg === bg.class ? 'bg-purple-600 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/40' : 'bg-[#1b143a]/70 border-purple-500/20 text-purple-200 hover:bg-[#251c52]'
                    }`}
                  >
                    <span className="text-2xl">{bg.preview}</span>
                    <span className="truncate w-full text-center">{bg.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة تحديد المايكات */}
      <AnimatePresence>
        {micConfigModalOpen && isHostOrAdmin && (
          <div onClick={() => setMicConfigModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#130f2c] border border-purple-500/30 rounded-3xl w-full max-w-sm p-5 text-white shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <h3 className="font-bold text-sm flex items-center gap-2 text-purple-200">
                  <LayoutGrid className="w-4 h-4 text-amber-400" />
                  <span>تحديد عدد كاميرات ومقاعد الغرفة</span>
                </h3>
                <button onClick={() => setMicConfigModalOpen(false)}><X className="w-4 h-4 text-white/60" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto">
                {availableLayouts.map((l) => (
                  <button
                    key={l.count}
                    onClick={() => changeMicCount(l.count)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition cursor-pointer shadow ${
                      selectedMicCount === l.count ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg' : 'bg-[#1b143a]/60 border-purple-500/20 text-purple-200 hover:bg-[#251c52]'
                    }`}
                  >
                    <span>{l.label}</span>
                    {selectedMicCount === l.count && <Check className="w-4 h-4 text-amber-300" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة مهام الغرفة */}
      <AnimatePresence>
        {roomTasksModalOpen && (
          <div onClick={() => setRoomTasksModalOpen(false)} className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <h3 className="text-base font-black text-purple-200">Room Tasks</h3>
                <button onClick={() => setRoomTasksModalOpen(false)}><X className="w-5 h-5 text-white/50" /></button>
              </div>
              <div className="mt-4 p-4 rounded-3xl bg-purple-950/40 border border-purple-500/30 space-y-2 shadow-inner">
                <h4 className="text-xs font-black text-amber-300">Room Growth Boost: Weekly Earnings</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-[#1b143a] border border-purple-500/20"><span className="text-amber-400 font-bold block">+1000 🪙</span><span className="text-purple-300/60">5000</span></div>
                  <div className="p-2 rounded-xl bg-[#1b143a] border border-purple-500/20"><span className="text-amber-400 font-bold block">+1550 🪙</span><span className="text-purple-300/60">15000</span></div>
                  <div className="p-2 rounded-xl bg-[#1b143a] border border-purple-500/20"><span className="text-amber-400 font-bold block">+3450 🪙</span><span className="text-purple-300/60">50000</span></div>
                  <div className="p-2 rounded-xl bg-[#1b143a] border border-purple-500/20"><span className="text-amber-400 font-bold block">+4000 🪙</span><span className="text-purple-300/60">100000</span></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <span className="text-xs font-black text-purple-200 block">Daily Room Activity Tasks</span>
                {[
                  { title: 'Share the room 1 times today', exp: '+10 EXP', prog: '0/1' },
                  { title: 'Host/Admin time on mic 60 mins today', exp: '+50 EXP', prog: '0/60' },
                  { title: 'Peak concurrent users reach 20 today', exp: '+30 EXP', prog: '1/20' },
                  { title: '3 users send gifts in room today', exp: '+100 EXP', prog: '0/3' },
                ].map((task, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#1b143a]/70 border border-purple-500/20 flex items-center justify-between shadow">
                    <div><p className="text-xs font-bold text-white/90">{task.title}</p><span className="text-[10px] text-purple-300/60">{task.prog}</span></div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-400/30">{task.exp}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة مستويات الغرفة */}
      <AnimatePresence>
        {roomLevelModalOpen && (
          <div onClick={() => setRoomLevelModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <HelpCircle className="w-5 h-5 text-purple-300/60" />
                <h3 className="text-base font-black text-purple-200">Room Level</h3>
                <button onClick={() => setRoomLevelModalOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between shadow-lg border border-purple-400/30">
                <div>
                  <h4 className="text-sm font-black">Room level Lv.2</h4>
                  <p className="text-[10px] text-purple-200 mt-1">76944 / 87500 EXP</p>
                </div>
                <span className="text-2xl font-black bg-white/20 px-3 py-1.5 rounded-2xl shadow">Lv.2</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة صاروخ المهام */}
      <AnimatePresence>
        {rocketTaskModalOpen && (
          <div onClick={() => !isRocketLaunching && setRocketTaskModalOpen(false)} className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-gradient-to-b from-[#181238] via-[#100d28] to-[#07050f] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto relative">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <HelpCircle className="w-5 h-5 text-purple-300/60" />
                <h3 className="text-base font-black text-purple-200">Rocket Task</h3>
                <button onClick={() => !isRocketLaunching && setRocketTaskModalOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>

              <div className="relative h-64 w-full flex flex-col items-center justify-center my-2 overflow-hidden">
                <motion.div 
                  animate={isRocketLaunching ? { y: [-20, -350], scale: [1, 1.3] } : { y: [0, -10, 0] }}
                  transition={isRocketLaunching ? { duration: 4.5, ease: "easeInOut" } : { repeat: Infinity, duration: 3 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <Rocket className="w-24 h-24 text-purple-400 fill-purple-400/20 drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]" />
                  {isRocketLaunching && (
                    <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 0.3 }} className="w-8 h-12 bg-gradient-to-b from-amber-400 via-rose-500 to-transparent rounded-full blur-[2px] mt-1" />
                  )}
                </motion.div>

                <div className="absolute bottom-2 w-full px-4 text-center z-20">
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 mb-1">
                    <span>الوقود الحالي: {roomFuelCoins.toLocaleString()}</span>
                    <span>هدف Lv.{rocketLevel}: {ROCKET_GOALS[rocketLevel].toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#07050f] border border-purple-500/30 overflow-hidden shadow-inner">
                    <div 
                      style={{ width: `${Math.min(100, (roomFuelCoins / ROCKET_GOALS[rocketLevel]) * 100)}%` }} 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 shadow" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#1b143a] border border-purple-500/30 text-xs my-2 flex items-center justify-between shadow">
                <div>
                  <span className="font-black text-amber-300">ينطلق تلقائياً عند تحقيق الهدف</span>
                  <p className="text-[10px] text-purple-200/60">كل الهدايا المرسلة في هذه الغرفة تغذي الصاروخ</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-600/30 text-purple-200 border border-purple-400/30 text-xs font-black shadow">
                  Lv.{rocketLevel}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة الـ PK */}
      <AnimatePresence>
        {pkModalOpen && isHostOrAdmin && (
          <div onClick={() => setPkModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 280 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 text-white rounded-t-[32px] p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="w-12 h-1 bg-purple-500/30 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="w-6" />
                <h3 className="text-base font-black text-purple-200 tracking-wide">PK Settings</h3>
                <button type="button" onClick={() => showToast('PK Rules: كل مقعد يعرض مجموع النقاط المحصلة.', 'info')} className="text-purple-300/70">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div onClick={() => setPkTab('cross')} className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all shadow ${pkTab === 'cross' ? 'bg-gradient-to-r from-[#948aff] to-[#7367f0] text-white border-purple-400 shadow-lg' : 'bg-[#1b143a] border-purple-500/20 text-purple-200'}`}>
                  <span className="text-xs font-black">Cross-Room PK</span>
                  <span className="text-2xl">🥊</span>
                </div>
                <div onClick={() => setPkTab('in_room')} className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all shadow ${pkTab === 'in_room' ? 'bg-gradient-to-r from-[#a886ff] to-[#8860f6] text-white border-purple-400 shadow-lg' : 'bg-[#1b143a] border-purple-500/20 text-purple-200'}`}>
                  <span className="text-xs font-black">In-Room PK</span>
                  <span className="text-2xl">🔮</span>
                </div>
              </div>

              {pkTab === 'cross' && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-200">Random Match</span>
                    <div className="flex items-center bg-[#1b143a] p-0.5 rounded-full border border-purple-500/30 shadow-sm text-[11px] font-bold">
                      <button type="button" onClick={() => setRandomMediaType('voice')} className={`px-3 py-1 rounded-full ${randomMediaType === 'voice' ? 'bg-[#7367f0] text-white shadow' : 'text-purple-300'}`}>Voice</button>
                      <button type="button" onClick={() => setRandomMediaType('video')} className={`px-3 py-1 rounded-full ${randomMediaType === 'video' ? 'bg-[#7367f0] text-white shadow' : 'text-purple-300'}`}>Video</button>
                    </div>
                  </div>
                  <div className="rounded-3xl p-4 border border-purple-500/30 bg-[#181238]/60 flex flex-col items-center gap-2 shadow-inner">
                    <div className="w-full flex items-center justify-around">
                      <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow"><VideoIcon className="w-6 h-6" /></div>
                      <span className="text-base font-black text-white bg-[#130f2c] px-3 py-1 rounded-full border border-purple-500/30 shadow">1V1</span>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow"><VideoIcon className="w-6 h-6" /></div>
                    </div>
                    <button type="button" onClick={handleStartPK} className="mt-2 w-full py-2.5 rounded-full bg-gradient-to-r from-[#948aff] to-[#7367f0] text-white text-xs font-black shadow-lg cursor-pointer">Initiate PK</button>
                  </div>
                </div>
              )}

              {pkTab === 'in_room' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-xs font-black text-purple-200 block mb-2">PK Mode</span>
                    <div className="grid grid-cols-2 gap-2 bg-[#181238] p-1 rounded-2xl border border-purple-500/20">
                      <button type="button" onClick={() => setInRoomPkMode('all')} className={`py-2 rounded-xl text-xs font-black ${inRoomPkMode === 'all' ? 'bg-gradient-to-r from-[#948aff] to-[#7367f0] text-white shadow' : 'text-purple-300'}`}>All Mics (ودي)</button>
                      <button type="button" onClick={() => setInRoomPkMode('battle')} className={`py-2 rounded-xl text-xs font-black ${inRoomPkMode === 'battle' ? 'bg-gradient-to-r from-[#948aff] to-[#7367f0] text-white shadow' : 'text-purple-300'}`}>Battle Team (فرق)</button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-black text-purple-200 block mb-2">Duration</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '1 min', sec: 60 },
                        { label: '5 min', sec: 300 },
                        { label: '10 min', sec: 600 },
                        { label: '15 min', sec: 900 },
                        { label: '30 min', sec: 1800 },
                        { label: '60 min', sec: 3600 },
                        { label: '120 min', sec: 7200 },
                        { label: '300 min', sec: 18000 }
                      ].map((item) => (
                        <button key={item.sec} type="button" onClick={() => setPkDuration(item.sec)} className={`py-2 rounded-2xl border text-xs font-black shadow ${pkDuration === item.sec ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-md' : 'bg-[#1b143a] border-purple-500/20 text-purple-300'}`}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!isPkActive ? (
                    <button type="button" onClick={handleStartPK} className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#948aff] to-[#7367f0] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-purple-400/40">
                      <Play className="w-4 h-4 fill-white" />
                      <span>{inRoomPkMode === 'all' ? 'بدء التحدي الودي (All Mics)' : 'بدء تحدي الفرق (Battle Team)'}</span>
                    </button>
                  ) : (
                    <button type="button" onClick={handleStopPK} className="w-full py-3.5 rounded-full bg-rose-600 text-white font-black text-sm shadow-lg cursor-pointer">
                      إنهاء التحدي الحالي
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة نتائج الـ PK */}
      <AnimatePresence>
        {pkResultModalOpen && (
          <div onClick={() => setPkResultModalOpen(false)} className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-[36px] bg-[#130f2c] border border-purple-500/40 p-6 text-center text-white flex flex-col items-center shadow-2xl">
              <Trophy className="w-12 h-12 text-amber-400 drop-shadow-md animate-bounce my-2" />
              <h3 className="text-xl font-black mt-2 text-purple-200">
                {pkWinner === 'friendly' ? '💜 اكتمل التحدي بنجاح!' : pkWinner === 'red' ? '🏆 فوز الفريق الأحمر!' : pkWinner === 'blue' ? '🏆 فوز الفريق الأزرق!' : '🤝 تعادل الفريقين!'}
              </h3>
              <button type="button" onClick={() => setPkResultModalOpen(false)} className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-xl cursor-pointer border border-purple-400/30">
                متابعة البث ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* متجر الهدايا */}
      <AnimatePresence>
        {isGiftModalOpen && (
          <div onClick={() => setIsGiftModalOpen(false)} className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 select-none">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#130f2c] border-t border-purple-500/30 rounded-t-[32px] p-4 text-white shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-300">إرسال إلى:</span>
                  <button type="button" onClick={() => setGiftTargetType('host')} className={`px-2.5 py-1 rounded-full text-xs font-bold shadow ${giftTargetType === 'host' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#1b143a] text-purple-200'}`}>المستضيف 👑</button>
                  <button type="button" onClick={() => setGiftTargetType('all')} className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow ${giftTargetType === 'all' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black' : 'bg-[#1b143a] text-purple-200'}`}>كل الكاميرات</button>
                </div>
                <button onClick={() => setIsGiftModalOpen(false)}><X className="w-5 h-5 text-white/60" /></button>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-b border-purple-500/20">
                {GIFT_TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setActiveGiftTab(t);
                      const first = JOPI_ALL_GIFTS.find(g => g.category === t);
                      if (first) setSelectedGift(first);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow ${activeGiftTab === t ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-purple-300/70 hover:text-white bg-[#1b143a]/60'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[38vh] p-1">
                {filteredGifts.map((gift) => (
                  <button key={gift.id} type="button" onClick={() => setSelectedGift(gift)} className={`p-2 rounded-2xl border flex flex-col items-center justify-between shadow ${selectedGift.id === gift.id ? 'bg-[#20184a] border-purple-400 ring-2 ring-purple-400/40' : 'bg-[#1b143a]/60 border-purple-500/20'}`}>
                    <div className="w-10 h-10 flex items-center justify-center text-3xl">{gift.icon}</div>
                    <span className="text-[10px] font-bold truncate w-full text-center mt-1 text-purple-100">{lang === 'ar' ? gift.name_ar : gift.name}</span>
                    <span className="text-[10px] text-amber-300 font-bold mt-0.5">{gift.price} 🪙</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-full shadow">
                  <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-amber-300">{coinBalance}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMultiplierMenuOpen(!multiplierMenuOpen)}
                      className="px-3 py-1.5 rounded-full bg-[#1b143a] border border-purple-500/30 text-xs font-black text-white flex items-center gap-1 cursor-pointer shadow"
                    >
                      <span>x{selectedGiftMultiplier}</span>
                      {multiplierMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                    {multiplierMenuOpen && (
                      <div className="absolute bottom-11 end-0 w-24 bg-[#130f2c] border border-purple-500/30 rounded-2xl p-1 shadow-2xl z-30 space-y-1">
                        {MULTIPLIERS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => { setSelectedGiftMultiplier(m); setMultiplierMenuOpen(false); }}
                            className={`w-full py-1 text-center rounded-xl text-xs font-black ${selectedGiftMultiplier === m ? 'bg-purple-600 text-white shadow' : 'text-purple-200 hover:bg-[#1b143a]'}`}
                          >
                            x{m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendJopiGift}
                    disabled={sendingGift}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg border border-purple-400/30"
                  >
                    {sendingGift ? 'جارٍ الإرسال...' : 'إرسال'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة تأكيد الصعود للمقعد */}
      <AnimatePresence>
        {seatActionModalOpen && selectedSeatForAction !== null && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-[#130f2c] border-t border-purple-500/30 rounded-t-[32px] w-full max-w-md p-5 text-white shadow-2xl space-y-3">
              <h4 className="text-sm font-bold text-center text-purple-200">المشاركة في المقعد {selectedSeatForAction + 1}</h4>
              <button onClick={() => handleTakeSeat(selectedSeatForAction)} className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-bold text-center cursor-pointer shadow-lg border border-purple-400/30">
                {selectedSeatForAction < currentLayout.videoCount ? 'تشغيل الكاميرا والصعود 📹' : 'فتح المايك والصعود 🎙️'}
              </button>
              <button onClick={() => setSeatActionModalOpen(false)} className="w-full py-3 rounded-2xl bg-[#1b143a] border border-purple-500/20 text-purple-300 text-xs font-bold text-center cursor-pointer shadow">
                إلغاء
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};