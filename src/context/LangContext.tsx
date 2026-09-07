// ============================================================================
// jopi Global 9-Language Localization Context
// Full support for AR (RTL), UR (RTL), EN, FR, ES, TR, DE, RU, and ID
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService, STORAGE_KEYS } from '../services/storageService';

export type Language = 'ar' | 'ur' | 'en' | 'fr' | 'es' | 'tr' | 'de' | 'ru' | 'id';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
];

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // App Branding
  appName: {
    ar: 'jopi', ur: 'jopi', en: 'jopi', fr: 'jopi', es: 'jopi',
    tr: 'jopi', de: 'jopi', ru: 'jopi', id: 'jopi',
  },
  tagline: {
    ar: 'تواصل، اكتشف، وتطابق بأسلوب راقٍ',
    ur: 'جڑیں، دریافت کریں اور بہترین انداز میں میچ کریں',
    en: 'Connect, Discover & Match in Style',
    fr: 'Connectez, découvrez et matchez avec style',
    es: 'Conecta, descubre y haz match con estilo',
    tr: 'Tarzınızla Bağlanın, Keşfedin ve Eşleşin',
    de: 'Verbinden, Entdecken & Matchen mit Stil',
    ru: 'Общайтесь, открывайте и находите пару стильно',
    id: 'Terhubung, Temukan & Cocok dengan Gaya',
  },

  // Navigation
  navDiscover: {
    ar: 'اكتشف', ur: 'دریافت کریں', en: 'Discover', fr: 'Découvrir', es: 'Descubrir',
    tr: 'Keşfet', de: 'Entdecken', ru: 'Поиск', id: 'Jelajah',
  },
  navParty: {
    ar: 'الغرف', ur: 'رومز', en: 'Party', fr: 'Salons', es: 'Salas',
    tr: 'Odalar', de: 'Party', ru: 'Комнаты', id: 'Pesta',
  },
  navMatches: {
    ar: 'المطابقات', ur: 'میچز', en: 'Matches', fr: 'Matchs', es: 'Matches',
    tr: 'Eşleşmeler', de: 'Matches', ru: 'Пары', id: 'Kecocokan',
  },
  navMessages: {
    ar: 'الرسائل', ur: 'پیغامات', en: 'Messages', fr: 'Messages', es: 'Mensajes',
    tr: 'Mesajlar', de: 'Nachrichten', ru: 'Сообщения', id: 'Pesan',
  },
  navWallet: {
    ar: 'المحفظة', ur: 'والیٹ', en: 'Wallet', fr: 'Portefeuille', es: 'Billetera',
    tr: 'Cüzdan', de: 'Geldbörse', ru: 'Кошелек', id: 'Dompet',
  },
  navProfile: {
    ar: 'الملف', ur: 'پروفائل', en: 'Profile', fr: 'Profil', es: 'Perfil',
    tr: 'Profil', de: 'Profil', ru: 'Профиль', id: 'Profil',
  },
  navAdmin: {
    ar: 'الإدارة', ur: 'ایڈمن', en: 'Admin', fr: 'Admin', es: 'Admin',
    tr: 'Yönetici', de: 'Admin', ru: 'Админ', id: 'Admin',
  },

  // Auth Methods
  phoneAuthTab: {
    ar: 'رقم الهاتف', ur: 'فون نمبر', en: 'Phone Number', fr: 'Numéro de téléphone', es: 'Número de Teléfono',
    tr: 'Telefon Numarası', de: 'Telefonnummer', ru: 'Номер телефона', id: 'Nomor Telepon',
  },
  emailAuthTab: {
    ar: 'البريد الإلكتروني', ur: 'ای میل', en: 'Email', fr: 'E-mail', es: 'Correo Electrónico',
    tr: 'E-posta', de: 'E-Mail', ru: 'Электронная почта', id: 'Email',
  },
  googleLoginBtn: {
    ar: 'متابعة بحساب Google', ur: 'گوگل کے ساتھ جاری رکھیں', en: 'Continue with Google', fr: 'Continuer avec Google', es: 'Continuar con Google',
    tr: 'Google ile devam et', de: 'Mit Google fortfahren', ru: 'Войти через Google', id: 'Lanjut dengan Google',
  },
  enterOtpTitle: {
    ar: 'رمز التحقق (SMS OTP)', ur: 'تصدیقی کوڈ (OTP)', en: 'Enter OTP Code', fr: 'Entrez le code OTP', es: 'Ingresa el código OTP',
    tr: 'Doğrulama Kodunu Girin', de: 'OTP-Code eingeben', ru: 'Введите код из SMS', id: 'Masukkan Kode OTP',
  },
  verifyOtpBtn: {
    ar: 'تأكيد الرمز', ur: 'کوڈ کی تصدیق کریں', en: 'Verify OTP', fr: 'Vérifier le code', es: 'Verificar OTP',
    tr: 'Kodu Doğrula', de: 'Code bestätigen', ru: 'Подтвердить код', id: 'Verifikasi OTP',
  },
  resendCode: {
    ar: 'إعادة إرسال الرمز', ur: 'کوڈ دوبارہ بھیجیں', en: 'Resend Code', fr: 'Renvoyer le code', es: 'Reenviar código',
    tr: 'Kodu Tekrar Gönder', de: 'Code erneut senden', ru: 'Отправить повторно', id: 'Kirim Ulang Kode',
  },

  // General Actions
  loginBtn: {
    ar: 'تسجيل الدخول', ur: 'لاگ ان کریں', en: 'Log In', fr: 'Connexion', es: 'Iniciar Sesión',
    tr: 'Giriş Yap', de: 'Anmelden', ru: 'Войти', id: 'Masuk',
  },
  signupBtn: {
    ar: 'إنشاء حساب جديد', ur: 'نیا اکاؤنٹ بنائیں', en: 'Sign Up', fr: 'Inscription', es: 'Registrarse',
    tr: 'Kayıt Ol', de: 'Registrieren', ru: 'Регистрация', id: 'Daftar',
  },
  quickDemoLogin: {
    ar: 'دخول تجريبي سريع (Demo User)', ur: 'فوری ڈیمو لاگ ان', en: 'Quick Demo Login',
    fr: 'Connexion démo rapide', es: 'Inicio rápido demo',
    tr: 'Hızlı Demo Girişi', de: 'Schneller Demo-Login', ru: 'Быстрый демо-вход', id: 'Masuk Demo Cepat',
  },
  itsAMatch: {
    ar: 'إنه تطابق! 🎉', ur: 'میچ ہو گیا! 🎉', en: "It's a Match! 🎉", fr: "C'est un Match ! 🎉", es: '¡Es un Match! 🎉',
    tr: 'Eşleştiniz! 🎉', de: 'Es ist ein Match! 🎉', ru: 'Это совпадение! 🎉', id: 'Cocok! 🎉',
  },
  startChatting: {
    ar: 'بدء الدردشة الآن', ur: 'ابھی چیٹ شروع کریں', en: 'Start Chatting', fr: 'Commencer à discuter', es: 'Empezar a Chatear',
    tr: 'Sohbete Başla', de: 'Chat starten', ru: 'Начать чат', id: 'Mulai Obrolan',
  },
  keepDiscovering: {
    ar: 'متابعة الاستكشاف', ur: 'تلاش جاری رکھیں', en: 'Keep Discovering', fr: 'Continuer à explorer', es: 'Seguir Descubriendo',
    tr: 'Keşfetmeye Devam Et', de: 'Weiter entdecken', ru: 'Продолжить поиск', id: 'Lanjut Menjelajah',
  },

  // Party & Rooms
  partyTitle: {
    ar: 'غرف الدردشة الصوتية والفيديو', ur: 'لائیو وائس اور ویڈیو رومز', en: 'Live Voice & Video Rooms',
    fr: 'Salons Vocaux et Vidéo en direct', es: 'Salas de Voz y Video en Vivo',
    tr: 'Canlı Ses ve Video Odaları', de: 'Live-Sprach- & Videoräume',
    ru: 'Голосовые и видео комнаты', id: 'Ruang Suara & Video Langsung',
  },
  createRoom: {
    ar: 'إنشاء غرفة', ur: 'روم بنائیں', en: 'Create Room', fr: 'Créer un salon', es: 'Crear Sala',
    tr: 'Oda Oluştur', de: 'Raum erstellen', ru: 'Создать комнату', id: 'Buat Ruang',
  },
  takeSeat: {
    ar: 'صعود المايك', ur: 'مائیک لیں', en: 'Take Mic', fr: 'Prendre le micro', es: 'Tomar el micro',
    tr: 'Mikrofona Geç', de: 'Mikrofon nehmen', ru: 'Взять микрофон', id: 'Ambil Mic',
  },
  leaveSeat: {
    ar: 'مغادرة المايك', ur: 'مائیک چھوڑیں', en: 'Leave Mic', fr: 'Quitter le micro', es: 'Dejar el micro',
    tr: 'Mikrofonu Bırak', de: 'Mikrofon verlassen', ru: 'Покинуть микрофон', id: 'Lepas Mic',
  },

  // Wallet
  myBalance: {
    ar: 'رصيد المحفظة', ur: 'والیٹ بیلنس', en: 'Wallet Balance', fr: 'Solde du portefeuille', es: 'Saldo de la Billetera',
    tr: 'Cüzdan Bakiyesi', de: 'Guthaben', ru: 'Баланс кошелька', id: 'Saldo Dompet',
  },
  buyCoins: {
    ar: 'شحن رصيد العملات', ur: 'کوائنز خریدیں', en: 'Top Up Coins', fr: 'Acheter des pièces', es: 'Comprar Monedas',
    tr: 'Jeton Yükle', de: 'Münzen kaufen', ru: 'Пополнить монеты', id: 'Beli Koin',
  },
  coins: {
    ar: 'عملة', ur: 'سکے', en: 'Coins', fr: 'Pièces', es: 'Monedas',
    tr: 'Jeton', de: 'Münzen', ru: 'Монет', id: 'Koin',
  },
  insufficientCoins: {
    ar: 'رصيد العملات غير كافٍ! يرجى شحن المحفظة.', ur: 'ناکافی کوائنز! برائے مہربانی ریچارج کریں۔', en: 'Insufficient coins! Please top up.',
    fr: 'Pièces insuffisantes !', es: '¡Monedas insuficientes!',
    tr: 'Yetersiz jeton!', de: 'Nicht genug Münzen!',
    ru: 'Недостаточно монет!', id: 'Koin tidak cukup!',
  },

  // Settings & Profile
  editProfile: {
    ar: 'تعديل الملف الشخصي', ur: 'پروفائل میں ترمیم کریں', en: 'Edit Profile', fr: 'Modifier le profil', es: 'Editar Perfil',
    tr: 'Profili Düzenle', de: 'Profil bearbeiten', ru: 'Редактировать профиль', id: 'Edit Profil',
  },
  aboutMe: {
    ar: 'نبذة عني', ur: 'میرے بارے میں', en: 'About Me', fr: 'À propos de moi', es: 'Sobre Mí',
    tr: 'Hakkımda', de: 'Über mich', ru: 'Обо мне', id: 'Tentang Saya',
  },
  myInterests: {
    ar: 'الاهتمامات', ur: 'دلچسپیاں', en: 'Interests', fr: 'Centres d’intérêt', es: 'Intereses',
    tr: 'İlgi Alanları', de: 'Interessen', ru: 'Интересы', id: 'Minat',
  },
  settingsTitle: {
    ar: 'الإعدادات والخصوصية', ur: 'ترتیبات اور پرائیویسی', en: 'Settings & Privacy', fr: 'Paramètres et confidentialité', es: 'Ajustes y Privacidad',
    tr: 'Ayarlar ve Gizlilik', de: 'Einstellungen & Datenschutz', ru: 'Настройки и приватность', id: 'Pengaturan & Privasi',
  },
  darkMode: {
    ar: 'الوضع الليلي (Dark Mode)', ur: 'ڈارک موڈ', en: 'Dark Mode', fr: 'Mode Sombre', es: 'Modo Oscuro',
    tr: 'Karanlık Mod', de: 'Dunkler Modus', ru: 'Темная тема', id: 'Mode Gelap',
  },
  languageSetting: {
    ar: 'اللغة / Language', ur: 'زبان / Language', en: 'Language / اللغة', fr: 'Langue / Language', es: 'Idioma / Language',
    tr: 'Dil / Language', de: 'Sprache / Language', ru: 'Язык / Language', id: 'Bahasa / Language',
  },
  logout: {
    ar: 'تسجيل الخروج', ur: 'لاگ آؤٹ', en: 'Log Out', fr: 'Déconnexion', es: 'Cerrar Sesión',
    tr: 'Çıkış Yap', de: 'Abmelden', ru: 'Выйти', id: 'Keluar',
  },
  deleteAccount: {
    ar: 'حذف الحساب نهائياً', ur: 'اکاؤنٹ مستقل طور پر حذف کریں', en: 'Delete Account', fr: 'Supprimer le compte', es: 'Eliminar Cuenta',
    tr: 'Hesabı Sil', de: 'Konto löschen', ru: 'Удалить аккаунт', id: 'Hapus Akun',
  },
  onlineNow: {
    ar: 'متصل الآن', ur: 'آن لائن', en: 'Online Now', fr: 'En ligne', es: 'En línea',
    tr: 'Çevrimiçi', de: 'Jetzt online', ru: 'В сети', id: 'Online Sekarang',
  },
  sendGift: {
    ar: 'إرسال هدية', ur: 'تحفہ بھیجیں', en: 'Send Gift', fr: 'Envoyer un cadeau', es: 'Enviar Regalo',
    tr: 'Hediye Gönder', de: 'Geschenk senden', ru: 'Отправить подарок', id: 'Kirim Hadiah',
  },
  callVoice: {
    ar: 'مكالمة صوتية', ur: 'وائس کال', en: 'Voice Call', fr: 'Appel Vocal', es: 'Llamada de Voz',
    tr: 'Sesli Arama', de: 'Sprachanruf', ru: 'Голосовой звонок', id: 'Panggilan Suara',
  },
  callVideo: {
    ar: 'مكالمة فيديو', ur: 'ویڈیو کال', en: 'Video Call', fr: 'Appel Vidéo', es: 'Videollamada',
    tr: 'Görüntülü Arama', de: 'Videoanruf', ru: 'Видеозвонок', id: 'Panggilan Video',
  },
  typeMessagePlaceholder: {
    ar: 'اكتب رسالة لطيفة...', ur: 'ایک اچھا پیغام لکھیں...', en: 'Type a friendly message...', fr: 'Écrivez un message...', es: 'Escribe un mensaje...',
    tr: 'Güzel bir mesaj yazın...', de: 'Schreibe eine Nachricht...', ru: 'Напишите сообщение...', id: 'Ketik pesan...',
  },

  // Additional Settings / Policies Keys for jopi Profile Integration
  accountSecurity: {
    ar: 'أمان الحساب', ur: 'اکاؤنٹ سیکیورٹی', en: 'Account Security', fr: 'Sécurité du compte', es: 'Seguridad de la cuenta',
    tr: 'Hesap Güvenliği', de: 'Kontosicherheit', ru: 'Безопасность аккаунта', id: 'Keamanan Akun',
  },
  notifications: {
    ar: 'الإشعارات', ur: 'نوفیکیشنز', en: 'Notifications', fr: 'Notifications', es: 'Notificaciones',
    tr: 'Bildirimler', de: 'Benachrichtigungen', ru: 'Уведомления', id: 'Notifikasi',
  },
  chatSettings: {
    ar: 'الدردشة', ur: 'چیٹ', en: 'Chat', fr: 'Discussion', es: 'Chat',
    tr: 'Sohbet', de: 'Chat', ru: 'Чат', id: 'Obrolan',
  },
  privacy: {
    ar: 'الخصوصية', ur: 'پرائیویسی', en: 'Privacy', fr: 'Confidentialité', es: 'Privacidad',
    tr: 'Gizlilik', de: 'Datenschutz', ru: 'Конфиденциальность', id: 'Privasi',
  },
  general: {
    ar: 'عام', ur: 'جنرل', en: 'General', fr: 'Général', es: 'General',
    tr: 'Genel', de: 'Allgemein', ru: 'Общие', id: 'Umum',
  },
  clearCache: {
    ar: 'مسح ذاكرة التخزين المؤقت', ur: 'کیش صاف کریں', en: 'Clear the cache', fr: 'Vider le cache', es: 'Borrar caché',
    tr: 'Önbelleği Temizle', de: 'Cache leeren', ru: 'Очистить кэш', id: 'Bersihkan cache',
  },
  aboutApp: {
    ar: 'حول تطبيق jopi', ur: 'jopi کے بارے میں', en: 'About jopi', fr: 'À propos de jopi', es: 'Acerca de Jopi',
    tr: 'jopi Hakkında', de: 'Über jopi', ru: 'О приложении jopi', id: 'Tentang jopi',
  },
  switchAccount: {
    ar: 'تبديل الحساب', ur: 'اکاؤنٹ تبدیل کریں', en: 'Switch Account', fr: 'Changer de compte', es: 'Cambiar cuenta',
    tr: 'Hesap Değiştir', de: 'Konto wechseln', ru: 'Сменить аккаунт', id: 'Ganti Akun',
  },
  termsOfService: {
    ar: 'شروط الاستخدام', ur: 'استعمال کی شرائط', en: 'Terms of Service', fr: 'Conditions d’utilisation', es: 'Términos de servicio',
    tr: 'Kullanım Şartları', de: 'Nutzungsbedingungen', ru: 'Условия использования', id: 'Ketentuan Layanan',
  },
  privacyPolicy: {
    ar: 'سياسة الخصوصية', ur: 'پرائیویسی پالیسی', en: 'Privacy Policy', fr: 'Politique de confidentialité', es: 'Política de privacidad',
    tr: 'Gizlilik Politikası', de: 'Datenschutzrichtlinie', ru: 'Политика конфиденциальности', id: 'Kebijakan Privasi',
  },
  platformRules: {
    ar: 'قواعد المنصة', ur: 'پلتफॉर्म کے اصول', en: 'Platform Rules', fr: 'Règles de la plateforme', es: 'Reglas de la plataforma',
    tr: 'Platform Kuralları', de: 'Plattformregeln', ru: 'Правила платформы', id: 'Aturan Platform',
  },
  childPolicy: {
    ar: 'سياسة حماية الطفل', ur: 'بچوں کے تحفظ کی پالیسی', en: 'Child Safeguarding Policy', fr: 'Politique de protection de l’enfance', es: 'Política de protección infantil',
    tr: 'Çocuk Koruma Politikası', de: 'Kinderschutzrichtlinie', ru: 'Политика защиты детей', id: 'Kebijakan Perlindungan Anak',
  },
  communityGuidelines: {
    ar: 'إرشادات المجتمع', ur: 'کمیونٹی گائیڈ لائنز', en: 'Community Guidelines', fr: 'Règlement de la communauté', es: 'Pautas de la comunidad',
    tr: 'Topluluk Kuralları', de: 'Community-Richtlinien', ru: 'Правила сообщества', id: 'Panduan Komunitas',
  },
  networkDiagnostics: {
    ar: 'تشخيص الشبكة الخاصة', ur: 'نیٹ ورک ڈائیگناسٹکس', en: 'Network Diagnostics', fr: 'Diagnostics réseau', es: 'Diagnósticos de red',
    tr: 'Ağ Tanılama', de: 'Netzwerkdiagnose', ru: 'Диагностика сети', id: 'Diagnostik Jaringan',
  },
};

interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
  isRTL: boolean;
  currentLanguageOption: LanguageOption;
  availableLanguages: LanguageOption[];
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, null);
    const validCodes: Language[] = ['ar', 'ur', 'en', 'fr', 'es', 'tr', 'de', 'ru', 'id'];
    return (validCodes.includes(settings?.language) ? settings.language : 'ar') as Language;
  });

  const currentLanguageOption = AVAILABLE_LANGUAGES.find(l => l.code === lang) || AVAILABLE_LANGUAGES[0];
  const isRTL = currentLanguageOption.dir === 'rtl';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, {});
    StorageService.set(STORAGE_KEYS.USER_SETTINGS, { ...settings, language: newLang });
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const t = (key: string, variables?: Record<string, string>): string => {
    const entry = TRANSLATIONS[key];
    let text = entry ? (entry[lang] || entry['en'] || entry['ar'] || key) : key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }
    return text;
  };

  return (
    <LangContext.Provider value={{ 
      lang, 
      setLang, 
      t, 
      isRTL, 
      currentLanguageOption, 
      availableLanguages: AVAILABLE_LANGUAGES 
    }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
};