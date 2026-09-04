// ============================================================================
// Nova Current User Profile Screen & Settings (Nova Exact Custom Integration)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, MapPin, Briefcase, Settings, Edit3, 
  ShieldCheck, Heart, MessageCircle, Coins, Copy, Check, 
  Crown, Globe, ChevronDown, RefreshCw, Moon, Sun, LogOut,
  Users, Shield, Award, ArrowRight, UserPlus, Flame, Eye, X, CreditCard, Lock,
  ChevronRight, Bell, ShieldAlert, MessageSquare, Trash2, Info, ToggleLeft, ToggleRight,
  Activity, FileText, Lock as LockIcon, BookOpen, AlertCircle, Sparkles, ArrowRightLeft, Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang, Language } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';
import { MatchService } from '../../services/matchService';
import { ChatService } from '../../services/chatService';
import { StorageService } from '../../services/storageService';
import { MOCK_COIN_PACKAGES } from '../../data/mockData';
import { WalletService } from '../../services/walletService';
import { WithdrawalModal } from '../wallet/WithdrawalModal';

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { setEditProfileOpen, setActiveTab, showToast, coinBalance, refreshWallet } = useApp();
  const { t, lang, setLang, availableLanguages, currentLanguageOption } = useLang();
  const { isDark, toggleTheme } = useTheme();
  
  const [copiedId, setCopiedId] = useState(false);
  const [diamondBalance, setDiamondBalance] = useState<number>(0);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [converting, setConverting] = useState(false);
  
  // التنقل بين شاشات الإعدادات الفرعية لتطبيق Nova
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'security' | 'notifications' | 'language' | 'chat' | 'privacy' | 'about' | 'terms' | 'privacyPolicy' | 'rules' | 'childPolicy' | 'guidelines' | 'diagnostics'>('main');
  
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familySubTab, setFamilySubTab] = useState<'chat' | 'tasks' | 'moments'>('chat');
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);
  
  // حالات مودل شحن الرصيد المباشر
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);

  // حالات تشخيص الشبكة (Network Diagnostics)
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

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
  }, []);

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

  const matchesCount = MatchService.getMatches().length;
  const chatsCount = ChatService.getConversations().length;

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

  const toggleVerification = () => {
    const nextStatus = !user.is_verified;
    updateUser({ is_verified: nextStatus });
    showToast(nextStatus ? 'Verified ✓' : 'Unverified', 'info');
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
      setDiagResult('All Nova servers are running efficiently. Connection speed is excellent (18ms). No network issues found.');
      showToast('Network diagnostics completed 🚀', 'success');
    }, 1500);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    const result = await WalletService.purchasePackage(selectedPkg.id);
    setPurchasing(false);

    if (result.success) {
      refreshWallet();
      showToast('Top-up successful! 🎉', 'success');
      setSelectedPkg(null);
      setShowTopUpModal(false);
    } else {
      showToast('Top-up failed', 'error');
    }
  };

  // 1. شاشة الأمان
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

  // 2. شاشة الإشعارات
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
            <div className="flex items-center justify-between"><span>Visitor notification</span><button onClick={() => handleToggle('visitorNotif')}>{toggles.visitorNotif ? <ToggleRight className="w-6 h-6 text-brand-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}</button></div>
            <div className="flex items-center justify-between"><span>Chat room notifications</span><button onClick={() => handleToggle('chatNotif')}>{toggles.chatNotif ? <ToggleRight className="w-6 h-6 text-brand-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}</button></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. شاشة اللغة
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

  // 4. شاشة الدردشة
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
            <div className="flex items-center justify-between"><span>Receive Pairing Messages</span><button onClick={() => handleToggle('pairingMsg')}>{toggles.pairingMsg ? <ToggleRight className="w-6 h-6 text-brand-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}</button></div>
          </div>
        </div>
      </div>
    );
  }

  // 5. شاشة الخصوصية
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
            <div className="flex items-center justify-between"><span>Stop showing me to nearby users</span><button onClick={() => handleToggle('stopNearby')}>{toggles.stopNearby ? <ToggleRight className="w-6 h-6 text-brand-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}</button></div>
          </div>
        </div>
      </div>
    );
  }

  // 6. شاشة About Nova الرئيسية
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
            <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-lg mb-2">Nova</div>
            <div className="text-xs font-bold text-slate-500">Nova App v1.0.0 (Official)</div>
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

  // 7. شاشات السياسات الديناميكية بناءً على اللغة المختارة (`lang`)
  if (showSettingsScreen && ['terms', 'privacyPolicy', 'rules', 'childPolicy', 'guidelines', 'diagnostics'].includes(settingsView)) {
    let title = '';
    let content = '';

    const contentDict: Record<string, Record<Language, { title: string; body: string }>> = {
      terms: {
        ar: { title: 'شروط الاستخدام', body: 'أهلاً بك في منصة Nova. باستخدامك لتطبيقنا فإنك توافق التزماً تاماً على كافة بنود الاستخدام، والتي تشمل الاحترام المتبادل، حظر أي ألفاظ نابية، وعدم إساءة استخدام غرف الدردشة الصوتية أو الرسائل الخاصة.' },
        en: { title: 'Terms of Service', body: 'Welcome to Nova. By using our app, you fully agree to our terms of service, which include mutual respect, prohibition of abusive language, and avoiding any misuse of voice rooms or private messages.' },
        tr: { title: 'Kullanım Şartları', body: 'Nova’ya hoş geldiniz. Uygulamamızı kullanarak karşılıklı saygı, argo dil yasağı ve sesli odaların kötüye kullanılmamasını içeren şartları kabul etmiş olursunuz.' },
        es: { title: 'Términos de servicio', body: 'Bienvenido a Nova. Al usar nuestra app, aceptas los términos de servicio, incluyendo respeto mutuo y prohibición de lenguaje abusivo.' },
        id: { title: 'Ketentuan Layanan', body: 'Selamat datang di Nova. Dengan menggunakan aplikasi kami, Anda sepenuhnya menyetujui ketentuan layanan kami.' },
        fr: { title: 'Conditions d’utilisation', body: 'Bienvenue sur Nova. En utilisant notre application, vous acceptez pleinement nos conditions d’utilisation.' },
        de: { title: 'Nutzungsbedingungen', body: 'Willkommen bei Nova. Durch die Nutzung unserer App stimmen Sie den Nutzungsbedingungen voll zu.' },
        ru: { title: 'Условия использования', body: 'Добро пожаловать в Nova. Используя наше приложение, вы полностью соглашаетесь с условиями использования.' },
        ur: { title: 'استعمال کی شرائط', body: 'Nova میں خوش آمدید۔ ہماری ایپ استعمال کرکے آپ تمام شرائط سے اتفاق کرتے ہیں۔' },
      },
      privacyPolicy: {
        ar: { title: 'سياسة الخصوصية', body: 'نحن في تطبيق Nova نحرص بصرامة على حماية سرية بياناتك الشخصية ومحادثاتك. لا يتم بيع أو مشاركة أي معلومات خاصة بالمستخدمين مع أي جهات خارجية أبداً.' },
        en: { title: 'Privacy Policy', body: 'At Nova, we strictly protect the confidentiality of your personal data and chats. User information is never sold or shared with any third party.' },
        tr: { title: 'Gizlilik Politikası', body: 'Nova olarak kişisel verilerinizin ve sohbetlerinizin gizliliğini kesinlikle koruyoruz. Bilgileriniz asla üçüncü taraflarla paylaşılmaz.' },
        es: { title: 'Política de privacidad', body: 'En Nova protegemos estrictamente la confidencialidad de tus datos personales y chats.' },
        id: { title: 'Kebijakan Privasi', body: 'Di Nova, kami secara ketat melindungi kerahasiaan data pribadi dan obrolan Anda.' },
        fr: { title: 'Politique de confidentialité', body: 'Chez Nova, nous protégeons strictement la confidentialité de vos données personnelles.' },
        de: { title: 'Datenschutzrichtlinie', body: 'Bei Nova schützen wir die Vertraulichkeit Ihrer persönlichen Daten strengstens.' },
        ru: { title: 'Политика конфиденциальности', body: 'В Nova мы строго защищаем конфиденциальность ваших личных данных и чатов.' },
        ur: { title: 'پرائیویسی پالیسی', body: 'Nova میں ہم آپ کے ذاتی ڈیٹا اور چیٹس کی رازداری کا سختی سے تحفظ کرتے ہیں۔' },
      },
      rules: {
        ar: { title: 'قواعد المنصة', body: '1. يُمنع منعاً باتاً انتحال شخصيات المشرفين أو الإدارة.\n2. يمنع الترويج لأي تطبيقات خارجية أو حسابات تجارية داخل غرف Nova.\n3. الالتزام بالذوق العام وعدم التعدي على خصوصية الآخرين.' },
        en: { title: 'Platform Rules', body: '1. Impersonating admins or staff is strictly prohibited.\n2. Promoting external apps or commercial accounts inside Nova rooms is banned.\n3. Respect public decency and user privacy.' },
        tr: { title: 'Platform Kuralları', body: '1. Yönetici taklidi yapmak kesinlikle yasaktır.\n2. Nova odalarında dış uygulama tanıtımı yasaktır.' },
        es: { title: 'Reglas de la plataforma', body: '1. Queda estrictamente prohibido suplantar a administradores.\n2. Se prohíbe la promoción de apps externas.' },
        id: { title: 'Aturan Platform', body: '1. Meniru admin sangat dilarang.\n2. Promosi aplikasi luar dilarang di ruang Nova.' },
        fr: { title: 'Règles de la plateforme', body: '1. L’usurpation d’identité des administrateurs est strictement interdite.' },
        de: { title: 'Plattformregeln', body: '1. Das Nachahmen von Administratoren ist strengstens untersagt.' },
        ru: { title: 'Правила платформы', body: '1. Строго запрещено выдавать себя за администраторов.' },
        ur: { title: 'پلتफॉर्म کے اصول', body: '1. ایڈمنز کی نقل کرنا سختی سے منع ہے۔' },
      },
      childPolicy: {
        ar: { title: 'سياسة حماية الطفل', body: 'تطبيق Nova مخصص حصرياً للبالغين (+18). نحن نطبق سياسة صارمة جداً (Zero Tolerance) ضد أي استغلال أو إساءة للأطفال، وسيتم حظر أي حساب مخالف نهائياً.' },
        en: { title: 'Child Safeguarding Policy', body: 'Nova is strictly for adults (+18). We have a zero-tolerance policy against any exploitation or abuse of children, resulting in permanent bans.' },
        tr: { title: 'Çocuk Koruma Politikası', body: 'Nova kesinlikle yetişkinler (+18) içindir. Çocukların istismarına karşı sıfır tolerans politikamız vardır.' },
        es: { title: 'Política de protección infantil', body: 'Nova es estrictamente para adultos (+18). Política de tolerancia cero contra el abuso infantil.' },
        id: { title: 'Kebijakan Perlindungan Anak', body: 'Nova khusus untuk dewasa (+18). Kami memiliki kebijakan nol toleransi terhadap eksploitasi anak.' },
        fr: { title: 'Politique de protection de l’enfance', body: 'Nova est strictement réservé aux adultes (+18).' },
        de: { title: 'Kinderschutzrichtlinie', body: 'Nova ist strengstens für Erwachsene (+18).' },
        ru: { title: 'Политика защиты детей', body: 'Nova строго для взрослых (+18).' },
        ur: { title: 'بچوں کے تحفظ کی پالیسی', body: 'Nova سختی سے بالغوں (+18) کے لیے ہے۔' },
      },
      guidelines: {
        ar: { title: 'إرشادات المجتمع', body: 'مجتمع Nova يهدف إلى بناء تواصل اجتماعي راقٍ، آمن، وممتع. تفاعل بإيجابية، وساهم في نشر بيئة نظيفة ومرحة داخل الغرف الصوتية وعبر اللحظات.' },
        en: { title: 'Community Guidelines', body: 'Nova aims to build sophisticated, safe, and fun social communication. Interact positively and help maintain a clean environment in voice rooms.' },
        tr: { title: 'Topluluk Kuralları', body: 'Nova, güvenli ve eğlenceli bir sosyal iletişim kurmayı amaçlar. Olumlu etkileşimde bulunun.' },
        es: { title: 'Pautas de la comunidad', body: 'Nova busca construir una comunicación social sofisticada, segura y divertida.' },
        id: { title: 'Panduan Komunitas', body: 'Nova bertujuan membangun komunikasi sosial yang aman dan menyenangkan.' },
        fr: { title: 'Règlement de la communauté', body: 'Nova vise à bâtir une communication sociale sophistiquée et sûre.' },
        de: { title: 'Community-Richtlinien', body: 'Nova zielt darauf ab, eine sichere und unterhaltsame soziale Kommunikation aufzubauen.' },
        ru: { title: 'Правила сообщества', body: 'Nova стремится создать безопасное и увлекательное общение.' },
        ur: { title: 'کمیونٹی گائیڈ لائنز', body: 'Nova کا مقصد ایک شاندار اور محفوظ کمیونٹی بنانا ہے۔' },
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

  // الشاشة الرئيسية للإعدادات العامة (Settings Main Screen)
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

  // شاشة عائلة المستخدم الخاصة فقط
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

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      {/* Top Header Controls */}
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

      {/* Main Profile Card */}
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

        <div className="flex flex-wrap items-center justify-center gap-1 mb-3">
          <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold border border-pink-500/20">💎 29</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/20">👑 VIP {userVipLevel}</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">🛡️ SVIP 1</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">🏰 UCHIHA Family</span>
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

        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setEditProfileOpen(true)} className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 transition active:scale-95">
            <Edit3 className="w-4 h-4" />
            <span>{t('editProfile')}</span>
          </button>

          <button onClick={toggleVerification} className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 ${user.is_verified ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{user.is_verified ? 'Verified ✓' : 'Verify'}</span>
          </button>
        </div>
      </div>

      {/* Wallet Integrated Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md"><Coins className="w-6 h-6" /></div>
            <div><span className="block text-[10px] text-slate-400 font-semibold uppercase">{t('myBalance')}</span><span className="text-base font-black text-slate-900 dark:text-white">{coinBalance} {t('coins')}</span></div>
          </div>
          <button onClick={() => setShowTopUpModal(true)} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition">{t('buyCoins')}</button>
        </div>

        {/* Diamonds & Cashout Section (Sugo Style) */}
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
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-[11px] font-bold transition flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" /> تفكيك
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-[11px] font-bold shadow-sm transition flex items-center gap-1"
            >
              <Wallet className="w-3 h-3" /> تصريف
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('coinsLedger')}</span>
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
            <span className="text-slate-700 dark:text-slate-300">Top-up package</span>
            <span className="font-black text-emerald-500">+500 {t('coins')}</span>
          </div>
        </div>
      </div>

      {/* Nova Style: My Room, My Family & Visitors Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center shadow-sm">
          <span className="block text-xs font-black text-slate-900 dark:text-white mb-0.5">{t('myRoom')}</span>
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

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div onClick={() => setActiveTab('matches')} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center shadow-sm cursor-pointer"><Heart className="w-4 h-4 text-rose-500 fill-rose-500 mx-auto mb-1" /><div className="text-base font-black text-slate-900 dark:text-white">{matchesCount}</div><span className="text-[10px] text-slate-400 font-semibold">{t('navMatches')}</span></div>
        <div onClick={() => setActiveTab('messages')} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center shadow-sm cursor-pointer"><MessageCircle className="w-4 h-4 text-brand-500 fill-brand-500 mx-auto mb-1" /><div className="text-base font-black text-slate-900 dark:text-white">{chatsCount}</div><span className="text-[10px] text-slate-400 font-semibold">{t('navMessages')}</span></div>
        <div onClick={() => setShowTopUpModal(true)} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center shadow-sm cursor-pointer"><Coins className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto mb-1" /><div className="text-base font-black text-slate-900 dark:text-white">{coinBalance}</div><span className="text-[10px] text-slate-400 font-semibold">{t('navWallet')}</span></div>
      </div>

      {/* About Me Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">{t('aboutMe')}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{user.bio || 'No bio added yet.'}</p>
      </div>

      {/* Danger & Reset Actions */}
      <div className="flex flex-col gap-2">
        <button onClick={handleResetData} className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> <span>Reset Default Data</span></button>
        <button onClick={logout} className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> <span>{t('logout')}</span></button>
      </div>

      {/* Visitors Modal */}
      <AnimatePresence>
        {showVisitorsModal && isVipUnlocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-900 dark:text-white"><Eye className="w-4 h-4 text-brand-500" /> {t('visitors')}</h3>
                <button onClick={() => setShowVisitorsModal(false)} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
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

      {/* Top-Up Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-900 dark:text-white"><Coins className="w-4 h-4 text-amber-500 fill-amber-500" /> {t('buyCoins')}</h3>
                <button onClick={() => setShowTopUpModal(false)} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {MOCK_COIN_PACKAGES.map((pkg) => (
                  <button key={pkg.id} onClick={() => setSelectedPkg(pkg)} className={`p-3 rounded-2xl text-start border-2 transition ${selectedPkg?.id === pkg.id ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'}`}>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{pkg.coins} {t('coins')}</div>
                    {pkg.bonus_coins > 0 && <div className="text-[10px] text-emerald-500 font-bold">+{pkg.bonus_coins} Free</div>}
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">${pkg.price_usd} USD</div>
                  </button>
                ))}
              </div>
              {selectedPkg && (
                <button onClick={handleConfirmPurchase} disabled={purchasing} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> <span>{purchasing ? 'Processing...' : `Pay ($${selectedPkg.price_usd})`}</span>
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdrawal & Cashout Modal */}
      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentDiamonds={diamondBalance}
        onSuccess={() => loadDiamonds()}
      />

    </div>
  );
};