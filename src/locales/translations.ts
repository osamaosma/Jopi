export type Language = 'ar' | 'en' | 'fr' | 'tr' | 'ur';

export interface TranslationSchema {
  // Navigation & Common
  discover: string;
  rooms: string;
  matches: string;
  messages: string;
  profile: string;
  settings: string;
  online: string;
  offline: string;
  search: string;
  cancel: string;
  save: string;
  edit: string;
  send: string;
  
  // Voice Rooms
  liveRooms: string;
  joinRoom: string;
  leaveRoom: string;
  micOn: string;
  micMuted: string;
  takeSeat: string;
  leaveSeat: string;
  sendGift: string;
  roomAudience: string;
  
  // Matching & Discovery
  like: string;
  pass: string;
  superLike: string;
  itsAMatch: string;
  startChat: string;
  noMoreUsers: string;
  
  // Settings & Account
  languageTitle: string;
  changeLanguage: string;
  darkMode: string;
  notifications: string;
  logout: string;
}

export const translations: Record<Language, TranslationSchema> = {
  ar: {
    discover: 'اكتشف',
    rooms: 'الغرف الصوتية',
    matches: 'المطابقات',
    messages: 'المحادثات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    online: 'متصل الآن',
    offline: 'غير متصل',
    search: 'بحث...',
    cancel: 'إلغاء',
    save: 'حفظ',
    edit: 'تعديل',
    send: 'إرسال',
    liveRooms: 'الغرف الحية المباشرة',
    joinRoom: 'دخول الغرفة',
    leaveRoom: 'مغادرة',
    micOn: 'المايك يعمل',
    micMuted: 'كتم المايك',
    takeSeat: 'صعود المايك',
    leaveSeat: 'نزول',
    sendGift: 'إرسال هدية',
    roomAudience: 'المستمعين',
    like: 'إعجاب',
    pass: 'تخطي',
    superLike: 'سوبر لايك',
    itsAMatch: 'لقد حدث توافق!',
    startChat: 'بدء محادثة',
    noMoreUsers: 'لا يوجد المزيد من الحسابات حالياً',
    languageTitle: 'لغة التطبيق',
    changeLanguage: 'تغيير اللغة',
    darkMode: 'الوضع الليلي',
    notifications: 'التنبيهات',
    logout: 'تسجيل الخروج',
  },
  en: {
    discover: 'Discover',
    rooms: 'Live Rooms',
    matches: 'Matches',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    online: 'Online',
    offline: 'Offline',
    search: 'Search...',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    send: 'Send',
    liveRooms: 'Live Audio Rooms',
    joinRoom: 'Join Room',
    leaveRoom: 'Leave',
    micOn: 'Mic On',
    micMuted: 'Muted',
    takeSeat: 'Take Mic',
    leaveSeat: 'Leave Seat',
    sendGift: 'Send Gift',
    roomAudience: 'Audience',
    like: 'Like',
    pass: 'Pass',
    superLike: 'Super Like',
    itsAMatch: "It's a Match!",
    startChat: 'Start Chat',
    noMoreUsers: 'No more profiles around you',
    languageTitle: 'App Language',
    changeLanguage: 'Change Language',
    darkMode: 'Dark Mode',
    notifications: 'Notifications',
    logout: 'Log Out',
  },
  fr: {
    discover: 'Découvrir',
    rooms: 'Salons Vocaux',
    matches: 'Matchs',
    messages: 'Messages',
    profile: 'Profil',
    settings: 'Paramètres',
    online: 'En ligne',
    offline: 'Hors ligne',
    search: 'Recherche...',
    cancel: 'Annuler',
    save: 'Enregistrer',
    edit: 'Modifier',
    send: 'Envoyer',
    liveRooms: 'Salons en direct',
    joinRoom: 'Rejoindre',
    leaveRoom: 'Quitter',
    micOn: 'Micro activé',
    micMuted: 'Micro muet',
    takeSeat: 'Prendre le micro',
    leaveSeat: 'Quitter le micro',
    sendGift: 'Envoyer un cadeau',
    roomAudience: 'Auditeurs',
    like: 'J’aime',
    pass: 'Passer',
    superLike: 'Super Like',
    itsAMatch: 'C’est un match !',
    startChat: 'Discuter',
    noMoreUsers: 'Aucun profil disponible',
    languageTitle: 'Langue de l’application',
    changeLanguage: 'Changer de langue',
    darkMode: 'Mode sombre',
    notifications: 'Notifications',
    logout: 'Déconnexion',
  },
  tr: {
    discover: 'Keşfet',
    rooms: 'Sesli Odalar',
    matches: 'Eşleşmeler',
    messages: 'Mesajlar',
    profile: 'Profil',
    settings: 'Ayarlar',
    online: 'Çevrimiçi',
    offline: 'Çevrimdışı',
    search: 'Ara...',
    cancel: 'İptal',
    save: 'Kaydet',
    edit: 'Düzenle',
    send: 'Gönder',
    liveRooms: 'Canlı Odalar',
    joinRoom: 'Odaya Katıl',
    leaveRoom: 'Ayrıl',
    micOn: 'Mikrofon Açık',
    micMuted: 'Sessiz',
    takeSeat: 'Mikrofona Geç',
    leaveSeat: 'Mikrofonu Bırak',
    sendGift: 'Hediye Gönder',
    roomAudience: 'Dinleyiciler',
    like: 'Beğen',
    pass: 'Geç',
    superLike: 'Süper Beğeni',
    itsAMatch: 'Eşleşme Oldu!',
    startChat: 'Sohbete Başla',
    noMoreUsers: 'Gösterilecek profil kalmadı',
    languageTitle: 'Uygulama Dili',
    changeLanguage: 'Dili Değiştir',
    darkMode: 'Karanlık Mod',
    notifications: 'Bildirimler',
    logout: 'Çıkış Yap',
  },
  ur: {
    discover: 'دریافت کریں',
    rooms: 'وائس رومز',
    matches: 'میچز',
    messages: 'پیغامات',
    profile: 'پروفائل',
    settings: 'ترتیبات',
    online: 'آن لائن',
    offline: 'آف لائن',
    search: 'تلاش کریں...',
    cancel: 'منسوخ',
    save: 'محفوظ کریں',
    edit: 'ترمیم',
    send: 'بھیجیں',
    liveRooms: 'لائیو آڈیو رومز',
    joinRoom: 'روم میں شامل ہوں',
    leaveRoom: 'چھوڑیں',
    micOn: 'مائیک آن',
    micMuted: 'میوٹ',
    takeSeat: 'مائیک لیں',
    leaveSeat: 'سیٹ چھوڑیں',
    sendGift: 'تحفہ بھیجیں',
    roomAudience: 'سامعین',
    like: 'پسند',
    pass: 'پاس',
    superLike: 'سپر لائک',
    itsAMatch: 'میچ ہو گیا!',
    startChat: 'بات چیت شروع کریں',
    noMoreUsers: 'مزید پروفائلز دستیاب نہیں ہیں',
    languageTitle: 'ایپ کی زبان',
    changeLanguage: 'زبان تبدیل کریں',
    darkMode: 'ڈارک موڈ',
    notifications: 'اطلاعات',
    logout: 'لاگ آوٹ',
  }
};