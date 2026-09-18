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
  appName: { ar: 'jopi', ur: 'jopi', en: 'jopi', fr: 'jopi', es: 'jopi', tr: 'jopi', de: 'jopi', ru: 'jopi', id: 'jopi' },
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
  navDiscover: { ar: 'اكتشف', ur: 'دریافت کریں', en: 'Discover', fr: 'Découvrir', es: 'Descubrir', tr: 'Keşfet', de: 'Entdecken', ru: 'Поиск', id: 'Jelajah' },
  navParty: { ar: 'الغرف', ur: 'رومز', en: 'Party', fr: 'Salons', es: 'Salas', tr: 'Odalar', de: 'Party', ru: 'Комнаты', id: 'Pesta' },
  navMatches: { ar: 'المطابقات', ur: 'میچز', en: 'Matches', fr: 'Matchs', es: 'Matches', tr: 'Eşleşmeler', de: 'Matches', ru: 'Пары', id: 'Kecocokan' },
  navMessages: { ar: 'الرسائل', ur: 'پیغامات', en: 'Messages', fr: 'Messages', es: 'Mensajes', tr: 'Mesajlar', de: 'Nachrichten', ru: 'Сообщения', id: 'Pesan' },
  navWallet: { ar: 'المحفظة', ur: 'والیٹ', en: 'Wallet', fr: 'Portefeuille', es: 'Billetera', tr: 'Cüzdan', de: 'Geldbörse', ru: 'Кошелек', id: 'Dompet' },
  navProfile: { ar: 'الملف', ur: 'پروفائل', en: 'Profile', fr: 'Profil', es: 'Perfil', tr: 'Profil', de: 'Profil', ru: 'Профиль', id: 'Profil' },
  navAdmin: { ar: 'الإدارة', ur: 'ایڈمن', en: 'Admin', fr: 'Admin', es: 'Admin', tr: 'Yönetici', de: 'Admin', ru: 'Админ', id: 'Admin' },
  settings: { ar: 'الإعدادات', ur: 'ترتیبات', en: 'Settings', fr: 'Paramètres', es: 'Ajustes', tr: 'Ayarlar', de: 'Einstellungen', ru: 'Настройки', id: 'Pengaturan' },
  logout: { ar: 'تسجيل الخروج', ur: 'لاگ آؤٹ', en: 'Log Out', fr: 'Déconnexion', es: 'Cerrar Sesión', tr: 'Çıkış Yap', de: 'Abmelden', ru: 'Выйти', id: 'Keluar' },
  store: { ar: 'المتجر', ur: 'اسٹور', en: 'Store', fr: 'Boutique', es: 'Tienda', tr: 'Mağaza', de: 'Shop', ru: 'Магазин', id: 'Toko' },
  backpack: { ar: 'حقيبتي', ur: 'بیک پیک', en: 'Backpack', fr: 'Sac à dos', es: 'Mochila', tr: 'Çanta', de: 'Rucksack', ru: 'Рюкзак', id: 'Tas' },
  support: { ar: 'خدمة العملاء', ur: 'کسٹمر سروس', en: 'Customer Service', fr: 'Service client', es: 'Servicio al Cliente', tr: 'Müşteri Hizmetleri', de: 'Kundendienst', ru: 'Поддержка', id: 'Layanan Pelanggan' },
  visitors: { ar: 'الزوار', ur: 'وزیٹرز', en: 'Visitors', fr: 'Visiteurs', es: 'Visitantes', tr: 'Ziyaretçiler', de: 'Besucher', ru: 'Посетители', id: 'Pengunjung' },
  tasks: { ar: 'المهام', ur: 'ٹاسکس', en: 'Tasks', fr: 'Tâches', es: 'Tareas', tr: 'Görevler', de: 'Aufgaben', ru: 'Задачи', id: 'Tugas' },
  family: { ar: 'العائلة', ur: 'فیملی', en: 'Family', fr: 'Famille', es: 'Familia', tr: 'Aile', de: 'Familie', ru: 'Семья', id: 'Keluarga' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ((key: string, variables?: Record<string, string>) => string) & Record<string, any>;
  isRTL: boolean;
  currentLanguageOption: LanguageOption;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const validCodes: Language[] = ['ar', 'ur', 'en', 'fr', 'es', 'tr', 'de', 'ru', 'id'];
    
    // 1. التحقق من الإعدادات المحفوظة
    const saved = localStorage.getItem('jopi_lang') as Language;
    if (validCodes.includes(saved)) return saved;

    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, null);
    if (validCodes.includes(settings?.language)) return settings.language as Language;

    // 2. الكشف التلقائي عن لغة الجهاز عند الفتح لأول مرة
    if (typeof window !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.slice(0, 2) as Language;
      if (validCodes.includes(browserLang)) return browserLang;
    }

    return 'ar';
  });

  const currentLanguageOption = AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];
  const isRTL = currentLanguageOption.dir === 'rtl';

  useEffect(() => {
    localStorage.setItem('jopi_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jopi_lang', lang);
    }
    const settings = StorageService.get<any>(STORAGE_KEYS.USER_SETTINGS, {});
    StorageService.set(STORAGE_KEYS.USER_SETTINGS, { ...settings, language: lang });
  };

  const translateFunc: any = (key: string, variables?: Record<string, string>): string => {
    const entry = TRANSLATIONS[key];
    let text = entry ? (entry[language] || entry['en'] || entry['ar'] || key) : key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t: translateFunc, 
      isRTL, 
      currentLanguageOption, 
      availableLanguages: AVAILABLE_LANGUAGES 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// توافقية إضافية مع من يستدعي useLang أو LangProvider
export const useLang = useLanguage;
export const LangProvider = LanguageProvider;