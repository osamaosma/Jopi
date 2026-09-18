// ============================================================================
// Jopi Current User Profile Screen & Settings (Exact SUGO Match & Clean Tabs)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, MapPin, Briefcase, Settings, Edit3, 
  ShieldCheck, Heart, MessageCircle, Coins, Copy, Check, 
  Crown, Globe, RefreshCw, Moon, Sun, LogOut,
  Users, Shield, ArrowRight, Eye, X, CreditCard, Lock,
  ChevronRight, Bell, ShieldAlert, MessageSquare, Trash2, Info, ToggleLeft, ToggleRight,
  Activity, Sparkles, ArrowRightLeft, Wallet, Dices, Rocket, Gamepad2, Play,
  Image as ImageIcon, Car, Award, ThumbsUp, UserPlus, Share2, Phone, Volume2, MoreVertical,
  Calendar, ShoppingBag, Backpack, Trophy, Headphones, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang, Language } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { WalletService } from '../../services/walletService';
import { WithdrawalModal } from '../wallet/WithdrawalModal';
import { User } from '../../types';

// استيراد خدمة Supabase للشحن والمستوى والترقيات
import { SupabaseProfileService } from '../../services/supabaseService';
// استيراد الملفات الخارجية المتصلة والشاشات الفرعية والنوافذ المنبثقة
import { SettingsScreen } from './SettingsScreen';
import { StoreScreen } from './StoreScreen';
import { BackpackScreen } from './BackpackScreen';
import { EventCenterScreen } from './EventCenterScreen';
import { CustomerServiceScreen } from './CustomerServiceScreen';
import { InternalProfileView } from './InternalProfileView';
import { SVIPModal } from './SVIPModal';
import { AristocracyModal } from './AristocracyModal';
import { VisitorsScreen } from './VisitorsScreen';
import { FamiliesSquareScreen } from './FamiliesSquareScreen';
import { TasksScreen } from './TasksScreen';
import { MyLevelModal } from './MyLevelModal';

const CAT_COIN_PACKAGES = [
  { id: 'pkg-1', coins: 32000, oldPrice: 1.11, price: 1 },
  { id: 'pkg-2', coins: 264000, oldPrice: 5.56, price: 5 },
  { id: 'pkg-3', coins: 560000, oldPrice: 11.11, price: 10 },
  { id: 'pkg-4', coins: 1740000, oldPrice: 33.33, price: 30 },
  { id: 'pkg-5', coins: 3040000, oldPrice: 55.56, price: 50 },
  { id: 'pkg-6', coins: 6108000, oldPrice: 111.11, price: 100 },
  { id: 'pkg-7', coins: 18428000, oldPrice: 333.33, price: 300 },
  { id: 'pkg-8', coins: 30556000, oldPrice: 555.56, price: 500 },
  { id: 'pkg-9', coins: 61508000, oldPrice: 1111.11, price: 1000 },
];

export const ProfileScreen: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const { 
    viewingUser,
    setViewingUser,
    setEditProfileOpen, 
    setActiveTab, 
    showToast, 
    coinBalance, 
    refreshWallet, 
    shouldOpenTopUp, 
    setShouldOpenTopUp,
    setActiveConversation,
    startCall
  } = useApp();
  const { t, lang, setLang, availableLanguages } = useLang();
  const { isDark, toggleTheme } = useTheme();

  // تحديد نوع العرض: هل هو الحساب الشخصي أم حساب مستخدم آخر
  const isViewingOtherUser = Boolean(viewingUser && viewingUser.id !== authUser?.id);
  const displayUser = isViewingOtherUser ? viewingUser! : authUser;
   
  const [copiedId, setCopiedId] = useState(false);
  const [diamondBalance, setDiamondBalance] = useState<number>(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [converting, setConverting] = useState(false);

  // حالة توسيع قسم الألعاب كما في الفيديو
  const [gamesExpanded, setGamesExpanded] = useState(false);

  // حالة التحكم في عرض الشاشة الداخلية للملف الشخصي كما في الفيديو
  const [showInternalProfile, setShowInternalProfile] = useState(false);
  
  // حالة نافذة الـ SVIP الجديدة
  const [showSvipModal, setShowSvipModal] = useState(false);

  // حالة نافذة الأرستقراطية الجديدة
  const [showAristocracyModal, setShowAristocracyModal] = useState(false);

  // حالة نافذة مستواي الجديدة
  const [showMyLevelModal, setShowMyLevelModal] = useState(false);
   
  // التبويب النشط
  const [profileTab, setProfileTab] = useState<'profile' | 'honor' | 'moments' | 'relationships'>('profile');

  // استعراض الصور الخاصة (Private album modal view)
  const [selectedAlbumImage, setSelectedAlbumImage] = useState<string | null>(null);
  const [showFullAlbumModal, setShowFullAlbumModal] = useState(false);

  // نافذة قائمة دعوة الأصدقاء
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);

  // نافذة طلب علاقة جديدة
  const [showRelationshipProposalModal, setShowRelationshipProposalModal] = useState(false);
  const [selectedProposalType, setSelectedProposalType] = useState<'couple' | 'friendship'>('couple');

  // حالات التنقل بين الشاشات الفرعية الخارجية
  const [activeSubScreen, setActiveSubScreen] = useState<'none' | 'store' | 'backpack' | 'events' | 'support' | 'visitors' | 'family' | 'tasks'>('none');

  const albumPhotos = [
    displayUser?.profile_photo || '',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
  ];
  const topUpImageSrc = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600';

  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'security' | 'notifications' | 'language' | 'chat' | 'privacy' | 'about' | 'terms' | 'privacyPolicy' | 'rules' | 'childPolicy' | 'guidelines' | 'diagnostics'>('main');
   
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familySubTab, setFamilySubTab] = useState<'chat' | 'tasks' | 'moments'>('chat');
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);
   
  const [showTopUpModal, setShowTopUpModal] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('open_topup_modal_direct') === 'true';
  });
  const [selectedPkg, setSelectedPkg] = useState(CAT_COIN_PACKAGES[0]);
  const [purchasing, setPurchasing] = useState(false);

  const [diagnosing, setDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

  const [activeGameModal, setActiveGameModal] = useState<'wheel' | 'rocket' | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rocketMultiplier, setRocketMultiplier] = useState(1.00);
  const [rocketState, setRocketState] = useState<'idle' | 'flying' | 'crashed'>('idle');

  const [toggles, setToggles] = useState({
    pushNotif: true,
    visitorNotif: true,
    chatNotif: true,
    pairingMsg: true,
    collapseGreetings: true,
    onlineInvisible: false,
    stopNearby: true,
  });

  useEffect(() => {
    loadDiamonds();
    loadFriends();
    if (localStorage.getItem('open_topup_modal_direct') === 'true') {
      localStorage.removeItem('open_topup_modal_direct');
      setShowTopUpModal(true);
    }
  }, []);

  useEffect(() => {
    if (shouldOpenTopUp) {
      setShowTopUpModal(true);
      if (setShouldOpenTopUp) setShouldOpenTopUp(false);
      localStorage.removeItem('open_topup_modal_direct');
    }
  }, [shouldOpenTopUp, setShouldOpenTopUp]);

  const loadDiamonds = async () => {
    const bal = await WalletService.getDiamondsBalance();
    setDiamondBalance(bal);
  };

  const loadFriends = () => {
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const mockFriends = allUsers.filter(u => u.id !== authUser?.id).map((u, i) => ({
      id: u.id,
      name: u.display_name,
      avatar: u.profile_photo,
      intimacyPoints: 6248 - (i * 750),
    }));
    setFriendsList(mockFriends.length > 0 ? mockFriends : [
      { id: 'f1', name: '✨KįDød✨', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', intimacyPoints: 6248 },
      { id: 'f2', name: 'Farida亗iT', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', intimacyPoints: 2307 },
      { id: 'f3', name: 'قمر الليل 🌹', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', intimacyPoints: 2203 },
      { id: 'f4', name: 'Princess 👑', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150', intimacyPoints: 1918 },
      { id: 'f5', name: 'see you', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', intimacyPoints: 1028 },
    ]);
  };

  const handleConvertGifts = async () => {
    setConverting(true);
    const res = await WalletService.convertGiftsToDiamonds('gift-3', 10);
    setConverting(false);
    if (res.success) {
      showToast(`تم تفكيك الهدايا بنجاح وإضافة ${res.diamondsEarned} ماسة! 💎`, 'success');
      loadDiamonds();
    } else {
      showToast(res.error || 'فشل التفكيك', 'error');
    }
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    showToast(t('settings') + ' ✓', 'success');
  };

  const handleOpenMyRoom = () => {
    if (setActiveTab) {
      setActiveTab('room' as any);
    } else {
      showToast('الانتقال إلى الغرفة الصوتية الخاصة بك...', 'info');
    }
  };

  if (!displayUser) return null;

  const userVipLevel = displayUser.vip_level || 0;
  const isVipUnlocked = userVipLevel >= 1;

  const visitorsList = [
    { id: 'v1', name: 'سارة خالد', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', time: 'منذ 10 دقائق', badge: 'VIP 5' },
    { id: 'v2', name: 'عمر الفاروق', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', time: 'منذ ساعة', badge: 'SVIP 1' },
    { id: 'v3', name: 'ريان العتيبي', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', time: 'منذ 3 ساعات', badge: 'VIP 3' },
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(displayUser.custom_id || displayUser.id);
    setCopiedId(true);
    showToast(`ID: ${displayUser.custom_id || displayUser.id} ✓`, 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLanguageSelect = (code: Language) => {
    setLang(code);
    showToast(`Language updated 🌐`, 'success');
  };

  const handleClearCache = () => {
    showToast('Cache cleared successfully 🧹 (3.81G freed)', 'success');
  };

  const handleResetData = () => {
    StorageService.resetToDemoData();
    showToast('Demo data reset 🔄', 'info');
    setTimeout(() => window.location.reload(), 600);
  };

  const handleRunDiagnostics = () => {
    setDiagnosing(true);
    setDiagResult(null);
    setTimeout(() => {
      setDiagnosing(false);
      setDiagResult('All Jopi servers are running efficiently. Connection speed is excellent (18ms). No network issues found.');
      showToast('Network diagnostics completed 🚀', 'success');
    }, 1500);
  };

  // دالة الشحن المربوطة بـ Supabase مع تحديث الرصيد والمستوى تلقائياً
  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);

    try {
      if (authUser?.id) {
        // تنفيذ العملية عبر Supabase
        await SupabaseProfileService.executeTopUp(authUser.id, selectedPkg.coins);
      }
      // مزامنة محفظة التطبيق المحلية أيضاً
      await WalletService.purchasePackage(selectedPkg.id);
      refreshWallet();
      
      showToast(
        isArabic
          ? `تم شحن ${selectedPkg.coins.toLocaleString()} عملة بنجاح! 🎉`
          : `Successfully added ${selectedPkg.coins.toLocaleString()} Coins! 🎉`,
        'success'
      );
      setShowTopUpModal(false);
    } catch (err: any) {
      showToast(err?.message || 'فشلت عملية الشحن', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  const handleInviteButtonClick = () => {
    if (isViewingOtherUser) {
      setShowRelationshipProposalModal(true);
    } else {
      setShowInviteModal(true);
    }
  };

  // عرض الملف الشخصي الداخلي عند الضغط على الصورة أو الاسم
  if (showInternalProfile) {
    return (
      <InternalProfileView
        displayUser={displayUser}
        isViewingOtherUser={isViewingOtherUser}
        onBack={() => setShowInternalProfile(false)}
        onEditProfile={() => setEditProfileOpen(true)}
        showToast={showToast}
        startCall={startCall}
        setActiveConversation={setActiveConversation}
      />
    );
  }

  if (showSettingsScreen) {
    return (
      <SettingsScreen
        settingsView={settingsView}
        setSettingsView={setSettingsView}
        setShowSettingsScreen={setShowSettingsScreen}
        t={t}
        lang={lang}
        setLang={setLang}
        availableLanguages={availableLanguages}
        toggles={toggles}
        handleToggle={handleToggle}
        handleClearCache={handleClearCache}
        handleLanguageSelect={handleLanguageSelect}
        diagnosing={diagnosing}
        diagResult={diagResult}
        handleRunDiagnostics={handleRunDiagnostics}
        showToast={showToast}
      />
    );
  }

  if (activeSubScreen === 'store') return <StoreScreen onBack={() => setActiveSubScreen('none')} showToast={showToast} coinBalance={coinBalance} onOpenTopUp={() => {
    setShowTopUpModal(true);
    if (setShouldOpenTopUp) setShouldOpenTopUp(true);
  }} />;
  if (activeSubScreen === 'backpack') return <BackpackScreen onBack={() => setActiveSubScreen('none')} onOpenStore={() => setActiveSubScreen('store')} />;
  if (activeSubScreen === 'events') return <EventCenterScreen onBack={() => setActiveSubScreen('none')} />;
  if (activeSubScreen === 'support') return <CustomerServiceScreen onBack={() => setActiveSubScreen('none')} showToast={showToast} />;
  if (activeSubScreen === 'visitors') return <VisitorsScreen onBack={() => setActiveSubScreen('none')} showToast={showToast} />;
  if (activeSubScreen === 'family') return <FamiliesSquareScreen onBack={() => setActiveSubScreen('none')} showToast={showToast} />;
  if (activeSubScreen === 'tasks') return <TasksScreen onBack={() => setActiveSubScreen('none')} showToast={showToast} />;

  const isArabic = lang === 'ar';

  const visualGridPackagesLTR = isArabic
    ? [
        CAT_COIN_PACKAGES[2], CAT_COIN_PACKAGES[1], CAT_COIN_PACKAGES[0],
        CAT_COIN_PACKAGES[5], CAT_COIN_PACKAGES[4], CAT_COIN_PACKAGES[3],
        CAT_COIN_PACKAGES[8], CAT_COIN_PACKAGES[7], CAT_COIN_PACKAGES[6],
      ]
    : [
        CAT_COIN_PACKAGES[0], CAT_COIN_PACKAGES[1], CAT_COIN_PACKAGES[2],
        CAT_COIN_PACKAGES[3], CAT_COIN_PACKAGES[4], CAT_COIN_PACKAGES[5],
        CAT_COIN_PACKAGES[6], CAT_COIN_PACKAGES[7], CAT_COIN_PACKAGES[8],
      ];

  const catThemePosterUrl = isArabic
    ? "https://cdn.phototourl.com/free/2026-09-16-1a80471e-79ec-4a9b-b0cd-3484db5bc423.jpg"
    : "https://cdn.phototourl.com/free/2026-09-16-601e26bc-a0d7-410c-8ee8-468fde06cd3f.jpg";

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto">
        
        {/* الترويسة العليا */}
        <div className="px-5 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs mb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col cursor-pointer" onClick={() => setShowInternalProfile(true)}>
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {displayUser.display_name}
                </h2>
                <span className="text-sm">🌹</span>
              </div>
              
              <span className="text-[11px] text-slate-400 font-semibold hover:text-brand-500 transition mb-3 block text-left">
                View or edit profile
              </span>

              <div className="flex items-center gap-6 text-center">
                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); showToast('Followers', 'info'); }}>
                  <span className="block text-xs font-black text-slate-900 dark:text-white">620</span>
                  <span className="text-[10px] text-slate-400">Followers</span>
                </div>
                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); showToast('Friends', 'info'); }}>
                  <span className="block text-xs font-black text-slate-900 dark:text-white">89</span>
                  <span className="text-[10px] text-slate-400">Friends</span>
                </div>
                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); showToast('Following', 'info'); }}>
                  <span className="block text-xs font-black text-slate-900 dark:text-white">90</span>
                  <span className="text-[10px] text-slate-400">Following</span>
                </div>
              </div>
            </div>

            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-500 shadow-md cursor-pointer flex-shrink-0" onClick={() => setShowInternalProfile(true)}>
              <img src={displayUser.profile_photo} alt={displayUser.display_name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="px-4 space-y-3">
          
          {/* قسم VIP/SVIP و Aristocracy */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => setShowSvipModal(true)} className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition">
                <div>
                  <span className="block text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-wider">VIP/SVIP</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">VIP 7</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md text-sm">👑</div>
              </div>

              <div onClick={() => setShowAristocracyModal(true)} className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-purple-500/5 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition">
                <div>
                  <span className="block text-[10px] font-black text-purple-600 dark:text-purple-400 tracking-wider">Aristocracy</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Knight</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md text-sm">🛡️</div>
              </div>
            </div>
          </div>

          {/* قسم رصيد المحفظة ورصيد الماسات */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">رصيد المحفظة</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{coinBalance.toLocaleString()} عملة</span>
                </div>
              </div>
              <button 
                onClick={() => setShowTopUpModal(true)} 
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Top Up Coins
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-black shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">رصيد الماسات</span>
                  <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{diamondBalance.toLocaleString()} 💎</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleConvertGifts}
                  disabled={converting}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3 h-3" /> تفكيك
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1 cursor-pointer"
                >
                  <Wallet className="w-3 h-3" /> تصريف
                </button>
              </div>
            </div>
          </div>

          {/* قسم الأدوات العامة */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">General Tools</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div onClick={() => setActiveSubScreen('visitors')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:scale-110 transition shadow-xs"><Eye className="w-6 h-6" /></div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Visitors</span>
              </div>
              <div onClick={() => setActiveSubScreen('tasks')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition shadow-xs"><CheckCircle2 className="w-6 h-6" /></div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Tasks</span>
              </div>
              <div onClick={() => setActiveSubScreen('family')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition shadow-xs"><Shield className="w-6 h-6" /></div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Family</span>
              </div>
            </div>
          </div>

          {/* قسم الألعاب */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setGamesExpanded(!gamesExpanded)}>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Games</span>
              <button className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                {gamesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div onClick={() => setActiveGameModal('wheel')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-amber-500 flex items-center justify-center"><Dices className="w-6 h-6 text-slate-950" /></div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Slot Game</span>
              </div>
              <div onClick={() => setActiveGameModal('rocket')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-cyan-500 flex items-center justify-center"><Rocket className="w-6 h-6 text-white" /></div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Clash...</span>
              </div>
              <div onClick={() => showToast('Multi Fishing Game launched!', 'info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-blue-500 flex items-center justify-center"><Gamepad2 className="w-6 h-6 text-white" /></div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Multi Fishing</span>
              </div>
              <div onClick={() => setActiveGameModal('rocket')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-purple-600 flex items-center justify-center"><Activity className="w-6 h-6 text-white" /></div>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Rocket Crash</span>
              </div>

              {gamesExpanded && (
                <>
                  <div onClick={() => showToast('Yummy Game launched!', 'info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-rose-500 flex items-center justify-center"><Play className="w-5 h-5 text-white" /></div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Yummy</span>
                  </div>
                  <div onClick={() => showToast('Roulette Game launched!', 'info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-indigo-500 flex items-center justify-center"><Dices className="w-5 h-5 text-white" /></div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Roulette</span>
                  </div>
                  <div onClick={() => showToast('Ludo Game launched!', 'info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-teal-500 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-white" /></div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">LUDO</span>
                  </div>
                  <div onClick={() => showToast('Car Tycoon Game launched!', 'info')} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition bg-orange-500 flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">Car Tycoon</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* القائمة السفلية */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <button onClick={() => setActiveSubScreen('events')} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center"><Calendar className="w-4 h-4" /></div><span>مركز الحدث</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setActiveSubScreen('store')} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center"><ShoppingBag className="w-4 h-4" /></div><span>المتجر</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setActiveSubScreen('backpack')} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><Backpack className="w-4 h-4" /></div><span>حقيبتي</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setShowMyLevelModal(true)} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Trophy className="w-4 h-4" /></div><span>مستواي</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setShowInviteModal(true)} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><UserPlus className="w-4 h-4" /></div><span>دعوة صديق</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setActiveSubScreen('support')} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center"><Headphones className="w-4 h-4" /></div><span>خدمة العملاء</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => { setSettingsView('main'); setShowSettingsScreen(true); }} className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center"><Settings className="w-4 h-4" /></div><span>{t('settings')}</span></div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 pb-6">
            <button onClick={handleResetData} className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><RefreshCw className="w-4 h-4" /> <span>Reset Default Data</span></button>
            <button onClick={logout} className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><LogOut className="w-4 h-4" /> <span>{t('logout')}</span></button>
          </div>

        </div>
      </div>

      {/* نافذة دعوة الأصدقاء */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
            <div className="fixed inset-0" onClick={() => setShowInviteModal(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl p-6 pb-8 max-h-[75vh] flex flex-col">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white mb-4">Invitations List</h3>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {friendsList.map((friend) => (
                  <div key={friend.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover" />
                      <div><h4 className="text-xs font-bold text-slate-900 dark:text-white">{friend.name}</h4><span className="text-[10px] text-pink-500 font-bold">Intimacy: {friend.intimacyPoints}</span></div>
                    </div>
                    <button onClick={() => { showToast(`تم إرسال الدعوة إلى ${friend.name} بنجاح!`, 'success'); setShowInviteModal(false); }} className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs font-bold">Invite</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* نافذة الـ SVIP الجديدة */}
      <SVIPModal
        isOpen={showSvipModal}
        onClose={() => setShowSvipModal(false)}
        coinBalance={coinBalance}
        onRecharge={() => { setShowSvipModal(false); setShowTopUpModal(true); }}
        showToast={showToast}
      />

      {/* نافذة الأرستقراطية الجديدة */}
      <AristocracyModal
        isOpen={showAristocracyModal}
        onClose={() => setShowAristocracyModal(false)}
        coinBalance={coinBalance}
        showToast={showToast}
        onSuccessActive={(tierName, cost) => {
          showToast(`تم تفعيل رتبة ${tierName} بنجاح مقابل ${cost.toLocaleString()} عملة! 🎉`, 'success');
        }}
      />

      {/* نافذة مستواي الجديدة */}
      <MyLevelModal
        isOpen={showMyLevelModal}
        onClose={() => setShowMyLevelModal(false)}
        showToast={showToast}
      />

      <WithdrawalModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} currentDiamonds={diamondBalance} onSuccess={() => loadDiamonds()} />
      
      {/* ========================================================================= */}
      {/* واجهة الشحن بالقطط - أبعاد دقيقة متطابقة 1:1 مع النقاط الحمراء بدون فراغ أسود */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
            
            {/* إغلاق عند النقر بالخارج */}
            <div className="fixed inset-0" onClick={() => setShowTopUpModal(false)} />

            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.94, opacity: 0 }} 
              className="relative z-10 w-full max-w-[340px] flex flex-col items-center gap-3"
            >
              
              {/* بطاقة القطط: بدون أي ارتفاع إضافي، تنتهي تماماً مع نهاية الصورة */}
              <div className="relative w-full rounded-[34px] overflow-hidden shadow-2xl border border-amber-400/30">
                
                {/* خلفية صورة القطط الطبيعية */}
                <img 
                  src={catThemePosterUrl} 
                  alt="Jopi Cat Recharge Theme" 
                  className="w-full h-auto block select-none pointer-events-none" 
                />

                {/* زر الإغلاق فوق علامة (X) في أعلى اليمين */}
                <button 
                  onClick={() => setShowTopUpModal(false)} 
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer z-30 backdrop-blur-xs"
                >
                  <X className="w-4 h-4 drop-shadow stroke-[2.5]" />
                </button>

                {/* شبكة الباقات الـ 9: إحداثيات مدروسة تتطابق بدقة مع النقاط الحمراء في كل باقة */}
                <div 
                  dir="ltr"
                  className="absolute top-[18.5%] bottom-[4.2%] left-[5%] right-[5%] grid grid-cols-3 grid-rows-3 gap-x-2 gap-y-2.5 z-20"
                >
                  {visualGridPackagesLTR.map((pkg) => {
                    const isSelected = selectedPkg.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg)}
                        className="relative cursor-pointer flex flex-col items-center justify-start pt-[14%] bg-transparent border-0 outline-none"
                      >
                        {/* علامة الصح الدائرية متطابقة في المركز تماماً مع النقطة الحمراء فوق العملات */}
                        {isSelected && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFA000] via-[#FF8F00] to-[#FF6F00] border-2 border-white text-white flex items-center justify-center shadow-lg shadow-orange-500/60 pointer-events-none animate-in fade-in zoom-in duration-150">
                            <Check className="w-4 h-4 stroke-[3.5]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* زر الشحن الذهبي المستقل يظهر مباشرة أسفل البطاقة بدون أي مساحات سوداء زائدة */}
              <button 
                onClick={handleConfirmPurchase}
                disabled={purchasing}
                className="w-full py-3.5 px-5 rounded-[22px] bg-gradient-to-r from-[#FFB800] via-[#FFAE00] to-[#FF9900] hover:brightness-105 active:scale-98 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-200/50"
              >
                <div className="w-4 h-3 border-2 border-slate-950 rounded-xs flex items-center px-0.5">
                  <div className="w-full h-0.5 bg-slate-950" />
                </div>
                
                {/* ضبط اتجاه النص والأرقام بدون انعكاس */}
                <span className="flex items-center gap-1">
                  {purchasing ? (
                    <span>{isArabic ? 'جاري تنفيذ الشحن...' : 'Processing...'}</span>
                  ) : isArabic ? (
                    <>
                      <span>شحن</span>
                      <bdo dir="ltr">{selectedPkg.coins.toLocaleString()}</bdo>
                      <span>مقابل</span>
                      <bdo dir="ltr">${selectedPkg.price}</bdo>
                    </>
                  ) : (
                    <>
                      <span>Top up</span>
                      <bdo dir="ltr">{selectedPkg.coins.toLocaleString()}</bdo>
                      <span>for</span>
                      <bdo dir="ltr">${selectedPkg.price}</bdo>
                    </>
                  )}
                </span>
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};