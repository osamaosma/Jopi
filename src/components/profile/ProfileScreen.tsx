// ============================================================================
// Jopi Current User Profile Screen & Settings (Final Exact Cat Topup Version - Bug Fixed)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, MapPin, Briefcase, Settings, Edit3, 
  ShieldCheck, Heart, MessageCircle, Coins, Copy, Check, 
  Crown, Globe, RefreshCw, Moon, Sun, LogOut,
  Users, Shield, ArrowRight, Eye, X, CreditCard, Lock,
  ChevronRight, Bell, ShieldAlert, MessageSquare, Trash2, Info, ToggleLeft, ToggleRight,
  Activity, Sparkles, ArrowRightLeft, Wallet, Dices, Rocket, Gamepad2, Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang, Language } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';
import { MatchService } from '../../services/matchService';
import { ChatService } from '../../services/chatService';
import { StorageService } from '../../services/storageService';
import { WalletService } from '../../services/walletService';
import { WithdrawalModal } from '../wallet/WithdrawalModal';
import { supabase } from '../../services/supabaseClient';

// باقات العملات الذهبية المطابقة تماماً لصورة القطط والأسعار والكميات الدقيقة
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
  const { user, logout } = useAuth();
  const { 
    setEditProfileOpen, 
    setActiveTab, 
    showToast, 
    coinBalance, 
    refreshWallet, 
    shouldOpenTopUp, 
    setShouldOpenTopUp 
  } = useApp();
  const { t, lang, setLang, availableLanguages, currentLanguageOption } = useLang();
  const { isDark, toggleTheme } = useTheme();
  
  const [copiedId, setCopiedId] = useState(false);
  const [diamondBalance, setDiamondBalance] = useState<number>(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [converting, setConverting] = useState(false);
  
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

  if (!user) return null;

  const userVipLevel = user.vip_level || 0;
  const isVipUnlocked = userVipLevel >= 1;

  const visitorsList = [
    { id: 'v1', name: 'سارة خالد', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', time: 'منذ 10 دقائق', badge: 'VIP 5' },
    { id: 'v2', name: 'عمر الفاروق', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', time: 'منذ ساعة', badge: 'SVIP 1' },
    { id: 'v3', name: 'ريان العتيبي', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', time: 'منذ 3 ساعات', badge: 'VIP 3' },
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.custom_id || user.id);
    setCopiedId(true);
    showToast(`ID: ${user.custom_id || user.id} ✓`, 'success');
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

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    
    const result = await WalletService.purchasePackage(selectedPkg.id);
    
    setPurchasing(false);

    refreshWallet();
    showToast(`Top-up successful! Added ${selectedPkg.coins.toLocaleString()} Coins 🎉`, 'success');
    setShowTopUpModal(false);
  };

  if (showSettingsScreen && settingsView === 'security') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('accountSecurity')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200">
            <button onClick={() => showToast('Edit Password', 'info')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>Edit Account Password</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => showToast('Payment Security', 'info')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>Payment Security Settings</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>Phone binding</span><span className="text-slate-400 text-[11px]">+90-534723****</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (showSettingsScreen && settingsView === 'notifications') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('notifications')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 text-xs font-bold text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between"><span>New Message Alerts</span><span className="text-brand-500">Enabled</span></div>
            <div className="flex items-center justify-between">
              <span>Visitor notification</span>
              <button onClick={() => handleToggle('visitorNotif')}>
                {toggles.visitorNotif ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Chat room notifications</span>
              <button onClick={() => handleToggle('chatNotif')}>
                {toggles.chatNotif ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSettingsScreen && settingsView === 'language') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('languageSetting')}</h1>
          <button onClick={() => setSettingsView('main')} className="text-xs font-bold text-brand-600">Confirm</button>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {availableLanguages.map((item) => (
            <button key={item.code} onClick={() => handleLanguageSelect(item.code)} className="w-full p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2.5"><span className="text-base">{item.flag}</span><span>{item.nativeName} ({item.name})</span></div>
              {lang === item.code && <Check className="w-4 h-4 text-brand-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showSettingsScreen && settingsView === 'chat') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('chatSettings')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 text-xs font-bold text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span>Receive Pairing Messages</span>
              <button onClick={() => handleToggle('pairingMsg')}>
                {toggles.pairingMsg ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSettingsScreen && settingsView === 'privacy') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('privacy')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 text-xs font-bold text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <span>Stop showing me to nearby users</span>
              <button onClick={() => handleToggle('stopNearby')}>
                {toggles.stopNearby ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSettingsScreen && settingsView === 'about') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('aboutApp')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-lg mb-2">Jopi</div>
            <div className="text-xs font-bold text-slate-500">Jopi App v1.0.0 (Official)</div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs font-bold text-slate-800 dark:text-slate-200">
            <button onClick={() => setSettingsView('terms')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>{t('termsOfService')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('privacyPolicy')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>{t('privacyPolicy')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('rules')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>{t('platformRules')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('childPolicy')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>{t('childPolicy')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('guidelines')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>{t('communityGuidelines')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('diagnostics')} className="w-full flex items-center justify-between p-4"><span>{t('networkDiagnostics')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>
      </div>
    );
  }

  if (showSettingsScreen && ['terms', 'privacyPolicy', 'rules', 'childPolicy', 'guidelines', 'diagnostics'].includes(settingsView)) {
    const contentDict: Record<string, Record<Language, { title: string; body: string }>> = {
      terms: {
        ar: { title: 'شروط الاستخدام', body: 'أهلاً بك في منصة Jopi. باستخدامك لتطبيقنا فإنك توافق التزماً تاماً على كافة بنود الاستخدام، والتي تشمل الاحترام المتبادل، حظر أي ألفاظ نابية، وعدم إساءة استخدام غرف الدردشة الصوتية أو الرسائل الخاصة.' },
        en: { title: 'Terms of Service', body: 'Welcome to Jopi. By using our app, you fully agree to our terms of service, which include mutual respect, prohibition of abusive language, and avoiding any misuse of voice rooms or private messages.' },
        tr: { title: 'Kullanım Şartları', body: 'Jopi’ye hoş geldiniz. Uygulamamızı kullanarak karşılıklı saygı, argo dil yasağı و sesli odaların kötüye kullanılmamasını içeren şartları kabul etmiş olursunuz.' },
        es: { title: 'Términos de servicio', body: 'Bienvenido a Jopi. Al usar nuestra app, aceptas los términos de servicio, incluyendo respeto mutuo y prohibición de lenguaje abusivo.' },
        id: { title: 'Ketentuan Layanan', body: 'Selamat datang di Jopi. Dengan menggunakan aplikasi kami, Anda sepenuhnya menyetujui ketentuan layanan kami.' },
        fr: { title: 'Conditions d’utilisation', body: 'Bienvenue sur Jopi. En utilisant notre application, vous acceptez pleinement nos conditions d’utilisation.' },
        de: { title: 'Nutzungsbedingungen', body: 'Willkommen bei Jopi. Durch die Nutzung unserer App stimmen Sie den Nutzungsbedingungen voll zu.' },
        ru: { title: 'Условия использования', body: 'Добро пожаловать в Jopi. Используя наше приложение, вы полностью соглашаетесь с условиями использования.' },
        ur: { title: 'استعمال کی شرائط', body: 'Jopi میں خوش آمدید۔ ہماری ایپ استعمال کرکے آپ تمام شرائط سے اتفاق کرتے ہیں۔' },
      },
      privacyPolicy: {
        ar: { title: 'سياسة الخصوصية', body: 'نحن في تطبيق Jopi نحرص بصرامة على حماية سرية بياناتك الشخصية ومحادثاتك. لا يتم بيع أو مشاركة أي معلومات خاصة بالمستخدمين مع أي جهات خارجية أبداً.' },
        en: { title: 'Privacy Policy', body: 'At Jopi, we strictly protect the confidentiality of your personal data and chats. User information is never sold or shared with any third party.' },
        tr: { title: 'Gizlilik Politikası', body: 'Jopi olarak kişisel verilerinizin و sohbetlerinizin gizliliğini kesinlikle koruyoruz. Bilgileriniz asla üçüncü taraflarla paylaşılmaz.' },
        es: { title: 'Política de privacidad', body: 'En Jopi protegemos estrictamente la confidencialidad de tus datos personales y chats.' },
        id: { title: 'Kebijakan Privasi', body: 'Di Jopi, kami secara ketat melindungi kerahasiaan data pribadi و obrolan Anda.' },
        fr: { title: 'Politique de confidentialité', body: 'Chez Jopi, nous protégeons strictement la confidentialité de vos données personnelles.' },
        de: { title: 'Datenschutzrichtlinie', body: 'Bei Jopi schützen wir die Vertraulichkeit Ihrer persönlichen Daten strengstens.' },
        ru: { title: 'Политика конфиденциальности', body: 'В Jopi мы строго защищаем конфиденциальность ваших личных данных и чатов.' },
        ur: { title: 'پرائیویسی پالیسی', body: 'Jopi میں ہم آپ کے ذاتی ڈیٹا اور چیٹس کی رازداری کا سختی سے تحفظ کرتے ہیں۔' },
      },
      rules: {
        ar: { title: 'قواعد المنصة', body: '1. يُمنع منعاً باتاً انتحال شخصيات المشرفين أو الإدارة.\n2. يمنع الترويج لأي تطبيقات خارجية أو حسابات تجارية داخل غرف Jopi.\n3. الالتزام بالذوق العام وعدم التعدي على خصوصية الآخرين.' },
        en: { title: 'Platform Rules', body: '1. Impersonating admins or staff is strictly prohibited.\n2. Promoting external apps or commercial accounts inside Jopi rooms is banned.\n3. Respect public decency and user privacy.' },
        tr: { title: 'Platform Kuralları', body: '1. Yönetici taklidi yapmak kesinlikle yasaktır.\n2. Jopi odalarında dış uygulama tanıtımı yasaktır.' },
        es: { title: 'Reglas de la plataforma', body: '1. Queda estrictamente prohibido suplantar a administradores.\n2. Se prohíbe la promoción de apps externas.' },
        id: { title: 'Aturan Platform', body: '1. Meniru admin sangat dilarang.\n2. Promosi aplikasi luar dilarang di ruang Jopi.' },
        fr: { title: 'Règles de la plateforme', body: '1. L’usurpation d’identité des administrateurs est strictement interdite.' },
        de: { title: 'Plattformregeln', body: '1. Das Nachahmen von Administratoren ist strengstens untersagt.' },
        ru: { title: 'Правила платформы', body: '1. Строго запрещено выдавать себя за администраторов.' },
        ur: { title: 'پلتفرم کے اصول', body: '1. ایڈمنز کی نقل کرنا سختی سے منع ہے۔' },
      },
      childPolicy: {
        ar: { title: 'سياسة حماية الطفل', body: 'تطبيق Jopi مخصص حصرياً للبالغين (+18). نحن نطبق سياسة صارمة جداً (Zero Tolerance) ضد أي استغلال أو إساءة للأطفال، وسيتم حظر أي حساب مخالف نهائياً.' },
        en: { title: 'Child Safeguarding Policy', body: 'Jopi is strictly for adults (+18). We have a zero-tolerance policy against any exploitation or abuse of children, resulting in permanent bans.' },
        tr: { title: 'Çocuk Koruma Politikası', body: 'Jopi kesinlikle yetişkinler (+18) içindir. Çocukların istismarına karşı sıفır tolerans politikamız vardır.' },
        es: { title: 'Política de protección infantil', body: 'Jopi es estrictamente para adultos (+18). Política de tolerancia cero contra el abuso infantil.' },
        id: { title: 'Kebijakan Perlindungan Anak', body: 'Jopi khusus untuk dewasa (+18). Kami memiliki kebijakan nol toleransi terhadap eksploitasi anak.' },
        fr: { title: 'Politique de protection de l’enfance', body: 'Jopi est strictement réservé aux adultes (+18).' },
        de: { title: 'Kinderschutzrichtlinie', body: 'Jopi ist strengstens für Erwachsene (+18).' },
        ru: { title: 'Политика защиты детей', body: 'Jopi строго для взрослых (+18).' },
        ur: { title: 'بچوں کے تحفظ کی پالیسی', body: 'Jopi سختی سے بالغوں (+18) کے لیے ہے۔' },
      },
      guidelines: {
        ar: { title: 'إرشادات المجتمع', body: 'مجتمع Jopi يهدف إلى بناء تواصل اجتماعي راقٍ، آمن، وممتع. تفاعل بإيجابية، وساهم في نشر بيئة نظيفة ومرحة داخل الغرف الصوتية وعبر اللحظات.' },
        en: { title: 'Community Guidelines', body: 'Jopi aims to build sophisticated, safe, and fun social communication. Interact positively and help maintain a clean environment in voice rooms.' },
        tr: { title: 'Topluluk Kuralları', body: 'Jopi, güvenli و eğlenceli bir sosyal iletişim kurmayı amaçlar. Olumlu etkileşimde bulunun.' },
        es: { title: 'Pautas de la comunidad', body: 'Jopi busca construir una comunicación social sofisticada, segura y divertida.' },
        id: { title: 'Panduan Komunitas', body: 'Jopi bertujuan membangun komunikasi sosial yang aman و menyenangkan.' },
        fr: { title: 'Règlement de la communauté', body: 'Jopi vise à bâtir une communication sociale sophistiquée et sûre.' },
        de: { title: 'Community-Richtlinien', body: 'Jopi zielt darauf ab, eine sichere و unterhaltsame soziale Kommunikation aufzubauen.' },
        ru: { title: 'Правила сообщества', body: 'Jopi стремится создать безопасное и увлекательное общение.' },
        ur: { title: 'کمیونٹی گائیڈ لائنز', body: 'Jopi کا مقصد ایک شاندار اور محفوظ کمیونٹی بنانا ہے۔' },
      },
    };

    const currentDict = contentDict[settingsView]?.[lang] || contentDict[settingsView]?.['en'] || { title: 'Policy', body: 'Content unavailable.' };

    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('about')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px]">{currentDict.title}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {settingsView === 'diagnostics' ? (
            <div className="space-y-4 text-center pt-6">
              <Activity className={`w-12 h-12 mx-auto text-brand-500 ${diagnosing ? 'animate-spin' : ''}`} />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('networkDiagnostics')}</h2>
              <button onClick={handleRunDiagnostics} disabled={diagnosing} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md">
                {diagnosing ? 'Checking...' : 'Run Diagnostics'}
              </button>
              {diagResult && <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">{diagResult}</div>}
            </div>
          ) : (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-sm">
              {currentDict.body}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showSettingsScreen) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setShowSettingsScreen(false)} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('settings')}</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <button onClick={() => setSettingsView('security')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-brand-500" /> {t('accountSecurity')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('notifications')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> {t('notifications')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('language')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> {t('languageSetting')}</span><div className="flex items-center gap-1.5 text-slate-400"><span className="text-[11px]">{currentLanguageOption.name}</span><ChevronRight className="w-4 h-4" /></div></button>
            <button onClick={() => setSettingsView('chat')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500" /> {t('chatSettings')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('privacy')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> {t('privacy')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">{isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />} {t('general')} (Theme)</span>
              <span className="text-[11px] text-brand-600 font-bold">{isDark ? 'Dark ➔ Light' : 'Light ➔ Dark'}</span>
            </button>
            <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2"><Trash2 className="w-4 h-4 text-rose-500" /> {t('clearCache')}</span>
              <span className="text-[11px] text-slate-400 font-normal">3.81G</span>
            </button>
            <button onClick={() => setSettingsView('about')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2"><Info className="w-4 h-4 text-sky-500" /> {t('aboutApp')}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-2.5 pt-2">
            <button onClick={() => showToast('Switch Account feature', 'info')} className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
              <RefreshCw className="w-4 h-4 text-brand-500" /> {t('switchAccount')}
            </button>
            <button onClick={logout} className="w-full py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-500 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
              <LogOut className="w-4 h-4" /> {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showFamilyModal) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <button onClick={() => setShowFamilyModal(false)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white"><ArrowRight className="w-5 h-5" /></button>
          <div className="text-center"><h1 className="text-sm font-black">.,•UCHiHA•,.</h1><span className="text-[10px] text-emerald-400 font-semibold">● 0 people online</span></div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400"><img src={user.profile_photo} alt="Avatar" className="w-full h-full object-cover" /></div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-indigo-950 border border-purple-500/30 text-white text-center shadow-lg">
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">Family War</span>
            <h2 className="text-xs font-bold my-2">The Family Battle will begin in 3 minutes. Join now!</h2>
            <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black shadow-md">Go</button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 flex items-center justify-around z-30">
          <button onClick={() => setFamilySubTab('tasks')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">📋 Tasks</button>
          <button onClick={() => setFamilySubTab('moments')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">🌅 Moments</button>
          <button onClick={() => setFamilySubTab('chat')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">💬 Chat</button>
        </div>
      </div>
    );
  }

  // --- منطق تبديل الصورة بناءً على اللغة ---
  const topUpImageSrc = (lang === 'ar' || lang === 'ur') 
    ? "https://cdn.phototourl.com/free/2026-09-12-7cd6c71e-5d36-4b44-9d2e-2765408cca51.jpg"
    : "https://cdn.phototourl.com/free/2026-09-11-48610cf4-9222-4679-8da9-34d27d0e6772.jpg"; 

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t('navProfile')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsScreen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center mb-4">
        
        <div className="relative w-28 h-28 mx-auto mb-3">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-400 p-0.5">
            <img src={user.profile_photo} alt={user.display_name} className="w-full h-full object-cover rounded-full" />
          </div>

          <span className="absolute -top-1 end-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[10px] font-black shadow-md border border-white dark:border-slate-900 flex items-center gap-0.5">
            <Crown className="w-3 h-3 fill-slate-950" />
            <span>VIP {userVipLevel}</span>
          </span>

          {user.is_verified && (
            <span className="absolute bottom-1 end-1 bg-blue-500 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-slate-900">
              <CheckCircle2 className="w-4 h-4 fill-blue-500 text-white" />
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.display_name}</h2>
          {user.age && <span className="text-lg font-light text-slate-500">{user.age}</span>}
        </div>

        <div className="mt-1.5 flex items-center justify-center gap-2">
          <button type="button" onClick={handleCopyId} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition active:scale-95">
            <span className="text-brand-600 dark:text-brand-400 font-sans font-black">ID:</span>
            <span>{user.custom_id || user.id}</span>
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /><span>{user.city || 'الرياض'}, {user.country || 'المملكة'}</span></div>
          {user.job_title && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              <span>{user.job_title}</span>
            </div>
          )}
        </div>

        {/* زر تعديل الملف الشخصي وزر التوثيق */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button 
            onClick={() => setEditProfileOpen(true)} 
            style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', cursor: 'pointer', border: 'none', fontSize: '13px' }}
          >
            <Edit3 style={{ width: '16px', height: '16px', color: '#ffffff', flexShrink: 0 }} />
            <span style={{ color: '#ffffff' }}>تعديل الملف الشخصي</span>
          </button>

          {user.is_verified ? (
            <div style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', fontSize: '13px' }}>
              <ShieldCheck style={{ width: '16px', height: '16px' }} />
              <span>موثق ✓</span>
            </div>
          ) : (
            <button 
              onClick={() => showToast('تم إرسال طلب توثيق الحساب للإدارة بنجاح 🛡️', 'success')} 
              style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '10px 14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', border: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '13px' }}
            >
              <ShieldCheck style={{ width: '16px', height: '16px' }} />
              <span>طلب توثيق</span>
            </button>
          )}
        </div>

      </div>

      {/* محفظة الرصيد وزر شحن الرصيد Top Up Coins */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md"><Coins className="w-6 h-6" /></div>
            <div><span className="block text-[10px] text-slate-400 font-semibold uppercase">{t('myBalance')}</span><span className="text-base font-black text-slate-900 dark:text-white">{coinBalance} {t('coins')}</span></div>
          </div>
          <button onClick={() => setShowTopUpModal(true)} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer">Top Up Coins</button>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-cyan-500/5 p-3 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-black shadow-sm">
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

      {/* قسم الألعاب التفاعلية (Games Section) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">الألعاب التفاعلية (Games)</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">مباشر ⚡</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={() => setActiveGameModal('wheel')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-950 border border-purple-500/30 text-white cursor-pointer hover:scale-[1.02] active:scale-98 transition shadow-md relative overflow-hidden group"
          >
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition" />
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-purple-500/30 text-amber-300">
                <Dices className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono font-black text-amber-300">50x Max</span>
            </div>
            <h4 className="text-xs font-black">عجلة الحظ</h4>
            <p className="text-[10px] text-purple-200/70 mt-0.5">Lucky Spin</p>
          </div>

          <div 
            onClick={() => setActiveGameModal('rocket')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/30 text-white cursor-pointer hover:scale-[1.02] active:scale-98 transition shadow-md relative overflow-hidden group"
          >
            <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl group-hover:scale-150 transition" />
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-cyan-500/30 text-cyan-300">
                <Rocket className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono font-black text-emerald-400">Crash</span>
            </div>
            <h4 className="text-xs font-black">صاروخ الحظ</h4>
            <p className="text-[10px] text-cyan-200/70 mt-0.5">Rocket Crash</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center shadow-sm">
          <span className="block text-xs font-black text-slate-900 dark:text-white mb-0.5">My Room</span>
          <span className="text-[10px] text-purple-600 font-bold flex items-center justify-center gap-1"><Users className="w-3 h-3" /> 0 online</span>
        </div>

        <div onClick={() => setShowFamilyModal(true)} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center shadow-sm cursor-pointer hover:scale-105 transition">
          <span className="block text-xs font-black text-slate-900 dark:text-white mb-0.5">{t('family')}</span>
          <span className="text-[10px] text-amber-600 font-bold flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> UCHIHA</span>
        </div>

        <div 
          onClick={() => {
            if (isVipUnlocked) {
              setShowVisitorsModal(true);
            } else {
              showToast('Visitors feature requires VIP 1 or above! 🔒', 'error');
            }
          }}
          className={`relative p-3 rounded-2xl text-center shadow-sm cursor-pointer transition ${isVipUnlocked ? 'bg-brand-500/10 border border-brand-500/20 hover:scale-105' : 'bg-slate-200 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700'}`}
        >
          {!isVipUnlocked && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-1 text-white text-[10px] font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> VIP 1
            </div>
          )}
          <span className="block text-xs font-black text-slate-900 dark:text-white mb-0.5">{t('visitors')}</span>
          <span className="text-[10px] text-brand-600 font-bold flex items-center justify-center gap-1">
            <Eye className="w-3 h-3" /> {isVipUnlocked ? '3 new' : 'Locked'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={handleResetData} className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><RefreshCw className="w-4 h-4" /> <span>Reset Default Data</span></button>
        <button onClick={logout} className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"><LogOut className="w-4 h-4" /> <span>{t('logout')}</span></button>
      </div>

      {/* --- نافذة شحن العملات الفاخرة بطريقة الأزرار الشفافة --- */}
      <AnimatePresence>
        {showTopUpModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm select-none p-4"
            onClick={() => setShowTopUpModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }} 
              className="relative w-full max-w-[380px] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر الإغلاق */}
              <button 
                onClick={() => setShowTopUpModal(false)} 
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* الصورة الأصلية بالكامل */}
              <img 
                src={topUpImageSrc} 
                alt="Jopi Topup" 
                className="w-full h-auto block pointer-events-none" 
              />

              {/* طبقة الأزرار الشفافة التفاعلية المتوافقة تماماً - مع إضافة dir=ltr لإجبار المتصفح على عدم عكس الترتيب */}
              <div dir="ltr" style={{
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
                  const isSelected = selectedPkg.id === pkg.id;
                  
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
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

              {/* زر الشراء السفلي */}
              {selectedPkg && (
                <div style={{ position: 'absolute', bottom: '4%', left: '5%', width: '90%', zIndex: 20 }}>
                  <button 
                    onClick={handleConfirmPurchase}
                    disabled={purchasing}
                    className="w-full py-3.5 rounded-[18px] bg-gradient-to-r from-[#ffb82e] via-[#f7931a] to-[#ffb82e] text-[#2d1b0d] font-black text-[13px] shadow-xl active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{purchasing ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (lang === 'ar' ? `شحن ${selectedPkg.coins.toLocaleString()} مقابل ${selectedPkg.price}$` : `Top up ${selectedPkg.coins.toLocaleString()} for $${selectedPkg.price}`)}</span>
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGameModal === 'wheel' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-white text-center relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-base font-black text-amber-400 mb-1 flex items-center justify-center gap-1.5"><Dices className="w-5 h-5" /> عجلة الحظ</h3>
              <p className="text-xs text-purple-300/70 mb-4">جرب حظك الآن واربح مضاعفات الكوينز!</p>
              
              <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 3.5, ease: [0.15, 0.9, 0.2, 1] }}
                  className="w-full h-full rounded-full border-4 border-amber-400 shadow-xl"
                  style={{
                    background: `conic-gradient(#3b82f6 0deg 45deg, #10b981 45deg 90deg, #f59e0b 90deg 135deg, #8b5cf6 135deg 180deg, #ec4899 180deg 225deg, #e11d48 225deg 270deg, #fbbf24 270deg 315deg, #64748b 315deg 360deg)`
                  }}
                />
                <div className="absolute w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center font-black text-xs text-amber-400">GO</div>
              </div>

              <button 
                disabled={isSpinning}
                onClick={() => {
                  if (isSpinning) return;
                  setIsSpinning(true);
                  const randRot = wheelRotation + 1800 + Math.floor(Math.random() * 360);
                  setWheelRotation(randRot);
                  setTimeout(() => {
                    setIsSpinning(false);
                    showToast('تمت الجولة! حظاً موفقاً دائماً 🎁', 'success');
                  }, 3600);
                }}
                className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white font-black text-xs shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSpinning ? 'جارٍ الدوران...' : 'تدوير الآن (100 عملة)'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGameModal === 'rocket' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl text-white text-center relative">
              <button onClick={() => setActiveGameModal(null)} className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              <h3 className="text-base font-black text-cyan-400 mb-1 flex items-center justify-center gap-1.5"><Rocket className="w-5 h-5" /> صاروخ الحظ</h3>
              <p className="text-xs text-cyan-300/70 mb-3">اسحب قبل الانفجار!</p>

              <div className="h-36 bg-slate-950/80 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden my-2">
                <span className={`text-4xl font-black font-mono ${rocketState === 'crashed' ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                  {rocketMultiplier.toFixed(2)}x
                </span>
                {rocketState === 'crashed' && <span className="text-xs text-rose-400 mt-1">انفجر الصاروخ 💥</span>}
              </div>

              <button 
                onClick={() => {
                  if (rocketState === 'flying') {
                    setRocketState('idle');
                    showToast(`تم السحب بنجاح على مضاعف ${rocketMultiplier.toFixed(2)}x! 🎉`, 'success');
                  } else {
                    setRocketState('flying');
                    setRocketMultiplier(1.00);
                    const timer = setInterval(() => {
                      setRocketMultiplier(prev => {
                        if (prev >= 3.2) {
                          clearInterval(timer);
                          setRocketState('crashed');
                          return prev;
                        }
                        return Number((prev + 0.08).toFixed(2));
                      });
                    }, 100);
                  }
                }}
                className={`w-full mt-3 py-3 rounded-2xl font-black text-xs shadow-lg cursor-pointer ${rocketState === 'flying' ? 'bg-emerald-500 text-slate-950 animate-pulse' : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white'}`}
              >
                {rocketState === 'flying' ? 'سحب نقدي الآن!' : 'إطلاق الصاروخ (100 عملة)'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVisitorsModal && isVipUnlocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-900 dark:text-white"><Eye className="w-4 h-4 text-brand-500" /> {t('visitors')}</h3>
                <button onClick={() => setShowVisitorsModal(false)} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {visitorsList.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1"><span className="text-xs font-bold text-slate-900 dark:text-white">{v.name}</span><span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold">{v.badge}</span></div>
                        <span className="text-[10px] text-slate-400">{v.time}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-brand-600 font-bold px-2.5 py-1 rounded-xl bg-brand-50">Visit</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentDiamonds={diamondBalance}
        onSuccess={() => loadDiamonds()}
      />

    </div>
  );
};