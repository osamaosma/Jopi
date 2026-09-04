// ============================================================================
// MingleUp Massive Gift Bank (200+ Sugo/Bigo Style Virtual Gifts)
// Prices range from 200 to 2,000,000 coins across multiple luxury tiers
// ============================================================================

import { Gift, CoinPackage, User, Message, Conversation, Notification, CoinTransaction, Report } from '../types';

const GIFT_ICONS = ['🌹', '🍫', '🧸', '🎈', '☕', '⭐', '💍', '👑', '🚗', '🛥️', '🏰', '🚀', '💎', '🦄', '🐉', '🍔', '🎧', '🎸', '🎮', '💻', '⌚', '👜', '👠', '🌸', '🌻', '🍀', '🌟', '💫', '🔥', '💖'];

const GIFT_CATEGORIES = [
  { prefixAr: 'وردة', prefixEn: 'Rose', basePrice: 200 },
  { prefixAr: 'شوكولاتة', prefixEn: 'Choco', basePrice: 500 },
  { prefixAr: 'دمية', prefixEn: 'Plush', basePrice: 1000 },
  { prefixAr: 'عطر', prefixEn: 'Perfume', basePrice: 2500 },
  { prefixAr: 'خاتم', prefixEn: 'Ring', basePrice: 5000 },
  { prefixAr: 'ساعة', prefixEn: 'Watch', basePrice: 10000 },
  { prefixAr: 'حقيبة فاخرة', prefixEn: 'Luxury Bag', basePrice: 25000 },
  { prefixAr: 'سيارة رياضية', prefixEn: 'Sport Car', basePrice: 50000 },
  { prefixAr: 'يخت سحابي', prefixEn: 'Cloud Yacht', basePrice: 150000 },
  { prefixAr: 'قصر ملكي', prefixEn: 'Royal Palace', basePrice: 300000 },
  { prefixAr: 'جزيرة خاصة', prefixEn: 'Private Island', basePrice: 750000 },
  { prefixAr: 'صاروخ الفضاء', prefixEn: 'Space Rocket', basePrice: 1200000 },
  { prefixAr: 'العرش الأسطوري', prefixEn: 'Legendary Throne', basePrice: 2000000 },
];

// توليد أكثر من 200 هدية بتدرج من 200 إلى 2,000,000 عملة
const generateMassiveGifts = (): Gift[] => {
  const gifts: Gift[] = [];
  let idCounter = 1;

  GIFT_CATEGORIES.forEach((cat, catIndex) => {
    for (let i = 1; i <= 16; i++) {
      const multiplier = Math.pow(1.25, i - 1);
      let calculatedPrice = Math.round(cat.basePrice * multiplier);
      
      // ضبط السعر الأدنى والأقصى بدقة
      if (idCounter === 1) calculatedPrice = 200;
      if (catIndex === GIFT_CATEGORIES.length - 1 && i === 16) calculatedPrice = 2000000;

      const icon = GIFT_ICONS[(idCounter - 1) % GIFT_ICONS.length];
      
      // تحديد نوع الندرة والتأثير (التأثيرات المخصصة تبدأ من 2000 عملة فأكثر)
      let rarity: Gift['rarity'] = 'common';
      let animationType: Gift['animation_type'] = 'pulse';

      if (calculatedPrice >= 200000) {
        rarity = 'legendary';
        animationType = 'royalty';
      } else if (calculatedPrice >= 10000) {
        rarity = 'epic';
        animationType = 'shine';
      } else if (calculatedPrice >= 2000) {
        rarity = 'rare';
        animationType = 'sparkle';
      }

      gifts.push({
        id: `gift-${idCounter}`,
        name: `${cat.prefixEn} ${i} (#${idCounter})`,
        name_ar: `${cat.prefixAr} ${i} (#${idCounter})`,
        coin_price: calculatedPrice,
        icon: icon,
        rarity: rarity,
        animation_type: animationType,
        // تفعيل التأثيرات المرئية المخصصة للهدايا ابتداءً من سعر 2000 عملة
        animation_url: calculatedPrice >= 2000 ? 'fullscreen-luxury-effect.gif' : undefined,
      });

      idCounter++;
    }
  });

  return gifts;
};

export const MOCK_GIFTS: Gift[] = generateMassiveGifts();

export const MOCK_COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg-1', coins: 100,  bonus_coins: 0,     price_usd: 0.99  },
  { id: 'pkg-2', coins: 300,  bonus_coins: 20,    price_usd: 2.99  },
  { id: 'pkg-3', coins: 500,  bonus_coins: 50,    price_usd: 4.99  },
  { id: 'pkg-4', coins: 1000, bonus_coins: 150,   price_usd: 8.99,  is_popular: true,    badge: 'الأكثر شعبية' },
  { id: 'pkg-5', coins: 3000, bonus_coins: 600,   price_usd: 22.99, is_best_value: true, badge: 'أفضل قيمة'    },
  { id: 'pkg-6', coins: 6000, bonus_coins: 2000,  price_usd: 39.99, badge: 'VIP كبار الشخصيات'                   },
];

export const MOCK_INTERESTS = [
  { id: '1',  name: 'Travel',        name_ar: 'سفر واستكشاف',     icon: '✈️', category: 'lifestyle'    },
  { id: '2',  name: 'Coffee',        name_ar: 'عشاق القهوة',      icon: '☕', category: 'lifestyle'    },
  { id: '3',  name: 'Photography',   name_ar: 'تصوير',            icon: '📸', category: 'creative'     },
  { id: '4',  name: 'Music',         name_ar: 'موسيقى',           icon: '🎵', category: 'creative'     },
  { id: '5',  name: 'Fitness',       name_ar: 'رياضة ولياقة',     icon: '💪', category: 'health'       },
  { id: '6',  name: 'Gaming',        name_ar: 'ألعاب إلكترونية',   icon: '🎮', category: 'entertainment' },
  { id: '7',  name: 'Movies',        name_ar: 'سينما وأفلام',     icon: '🍿', category: 'entertainment' },
  { id: '8',  name: 'Cooking',       name_ar: 'طبخ ومأكولات',     icon: '🍳', category: 'lifestyle'    },
  { id: '9',  name: 'Art',           name_ar: 'فن ورسم',          icon: '🎨', category: 'creative'     },
  { id: '10', name: 'Books',         name_ar: 'قراءة وكتب',       icon: '📚', category: 'intellectual'  },
  { id: '11', name: 'Tech',          name_ar: 'تكنولوجيا وابتكار', icon: '💻', category: 'intellectual'  },
  { id: '12', name: 'Fashion',       name_ar: 'موضة وأناقة',      icon: '👗', category: 'creative'     },
  { id: '13', name: 'Pets',          name_ar: 'حيوانات أليفة',     icon: '🐶', category: 'lifestyle'    },
  { id: '14', name: 'Nature',        name_ar: 'طبيعة وتخييم',     icon: '🌿', category: 'lifestyle'    },
  { id: '15', name: 'Karaoke',       name_ar: 'كاراوكي وغناء',    icon: '🎤', category: 'creative'     },
  { id: '16', name: 'Language',      name_ar: 'تعلم لغات',        icon: '🗣️', category: 'intellectual'  },
];

export const CURRENT_USER: User = {
  id: 'current-user-001',
  custom_id: '8849201', 
  email: 'osama.dev@mingleup.app',
  phone_number: '+966 50 123 4567',
  display_name: 'أسامة النجار',
  date_of_birth: '1998-05-14',
  age: 26,
  gender: 'male',
  country: 'السعودية',
  city: 'الرياض',
  bio: 'مهندس برمجيات، عاشق للقهوة المختصة، السفر، والتصميم البسيط. أبحث عن حوارات ملهمة وأشخاص إيجابيين ☕✨',
  profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  ],
  interests: ['Tech', 'Coffee', 'Travel', 'Photography', 'Music'],
  languages: ['العربية', 'English'],
  is_online: true,
  last_seen: new Date().toISOString(),
  is_verified: true,
  vip_level: 8,
  coin_balance: 1500,
  role: 'user',
  job_title: 'Product Engineer',
  company: 'MingleUp',
  height_cm: 180,
  relationship_goals: 'تكوين صداقات ومعارف راقية',
  distance_km: 0,
  device_info: 'Apple iPhone 15 Pro (iOS 18.2)',
  auth_provider: 'phone',
  created_at: '2024-01-10T12:00:00Z',
  updated_at: new Date().toISOString(),
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-002',
    custom_id: '8810294',
    email: 'sarah.k@mingleup.app',
    phone_number: '+966 55 987 6543',
    display_name: 'سارة خالد',
    date_of_birth: '2000-03-21', age: 24, gender: 'female',
    country: 'السعودية', city: 'الرياض',
    bio: 'مصممة جرافيك 🎨. أعشق الموسيقى الهادئة واستكشاف المقاهي الجديدة!',
    profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'],
    interests: ['Art', 'Coffee', 'Music', 'Photography'],
    languages: ['العربية', 'English', 'French'],
    is_online: true, last_seen: new Date().toISOString(),
    is_verified: true, vip_level: 5, coin_balance: 420, role: 'user',
    job_title: 'UI/UX Designer', height_cm: 165, distance_km: 3.5,
    device_info: 'Apple iPhone 14 (iOS 17.5)', auth_provider: 'google',
    created_at: '2024-02-01T10:00:00Z', updated_at: new Date().toISOString(),
  },
  {
    id: 'user-003',
    custom_id: '8859103',
    email: 'layla.m@mingleup.app', phone_number: '+971 50 456 7890',
    display_name: 'ليلى المنصور',
    date_of_birth: '1999-08-12', age: 25, gender: 'female',
    country: 'الإمارات', city: 'دبي',
    bio: 'مهندسة معمارية، هاوية سفر حول العالم 🌍✈️. أستمتع بالغوص والتصوير.',
    profile_photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'],
    interests: ['Travel', 'Photography', 'Fitness', 'Art', 'Nature'],
    languages: ['العربية', 'English'],
    is_online: true, last_seen: new Date().toISOString(),
    is_verified: true, vip_level: 7, coin_balance: 850, role: 'user',
    job_title: 'Architect', height_cm: 168, distance_km: 12.0,
    device_info: 'Samsung Galaxy S24 (Android 15)', auth_provider: 'phone',
    created_at: '2024-01-15T09:00:00Z', updated_at: new Date().toISOString(),
  },
  {
    id: 'user-004',
    custom_id: '8872019',
    email: 'rayan.a@mingleup.app', phone_number: '+966 54 321 0987',
    display_name: 'ريان العتيبي',
    date_of_birth: '1997-11-05', age: 27, gender: 'male',
    country: 'السعودية', city: 'جدة',
    bio: 'طبيب وعازف جيتار 🎸. أحب البحر والرياضات المائية.',
    profile_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'],
    interests: ['Fitness', 'Music', 'Travel', 'Nature', 'Coffee'],
    languages: ['العربية', 'English'],
    is_online: false, last_seen: 'منذ 15 دقيقة',
    is_verified: true, vip_level: 4, coin_balance: 300, role: 'user',
    job_title: 'Dentist', height_cm: 182, distance_km: 18.5,
    device_info: 'Google Pixel 8 Pro', auth_provider: 'email',
    created_at: '2024-02-10T14:00:00Z', updated_at: new Date().toISOString(),
  },
  {
    id: 'user-005',
    custom_id: '8893412',
    email: 'nour.h@mingleup.app', phone_number: '+20 10 1234 5678',
    display_name: 'نور الهدى',
    date_of_birth: '2001-07-19', age: 23, gender: 'female',
    country: 'مصر', city: 'القاهرة',
    bio: 'كاتبة محتوى وصانعة بودكاست 🎙️. شغوفة بالكتب القديمة والفلسفة.',
    profile_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'],
    interests: ['Books', 'Movies', 'Coffee', 'Art', 'Music'],
    languages: ['العربية', 'English'],
    is_online: true, last_seen: new Date().toISOString(),
    is_verified: false, vip_level: 2, coin_balance: 190, role: 'user',
    job_title: 'Content Creator', height_cm: 162, distance_km: 25.0,
    device_info: 'Xiaomi 13 Pro', auth_provider: 'google',
    created_at: '2024-01-28T16:00:00Z', updated_at: new Date().toISOString(),
  },
  {
    id: 'user-006',
    custom_id: '8865120',
    email: 'omar.f@mingleup.app', phone_number: '+966 56 789 0123',
    display_name: 'عمر الفاروق',
    date_of_birth: '1996-04-30', age: 28, gender: 'male',
    country: 'السعودية', city: 'الرياض',
    bio: 'رائد أعمال في الذكاء الاصطناعي 🤖. أحب الشطرنج والدراجات الجبلية.',
    profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'],
    interests: ['Tech', 'Gaming', 'Fitness', 'Cooking', 'Travel'],
    languages: ['العربية', 'English', 'German'],
    is_online: true, last_seen: new Date().toISOString(),
    is_verified: true, vip_level: 10, coin_balance: 1200, role: 'user',
    job_title: 'Founder & CEO', height_cm: 185, distance_km: 5.2,
    device_info: 'MacBook Pro M3 (Web Safari)', auth_provider: 'apple',
    created_at: '2024-02-05T11:00:00Z', updated_at: new Date().toISOString(),
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1', conversation_id: 'conv-002',
    sender_id: 'user-002', receiver_id: 'current-user-001',
    message_type: 'text',
    text: 'أهلاً أسامة! يسعدني جداً التعرف عليك 😊',
    is_read: true, is_delivered: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'msg-2', conversation_id: 'conv-002',
    sender_id: 'current-user-001', receiver_id: 'user-002',
    message_type: 'text',
    text: 'أهلاً سارة! القهوة الإثيوبية هي المفضلة عندي ☕',
    is_read: true, is_delivered: true,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'msg-3', conversation_id: 'conv-002',
    sender_id: 'user-002', receiver_id: 'current-user-001',
    message_type: 'gift', gift_id: 'gift-3', gift_data: MOCK_GIFTS[2],
    text: 'أرسلت لك وردة 🌹',
    is_read: true, is_delivered: true,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-002', match_id: 'match-002',
    partner: MOCK_USERS[0], last_message: INITIAL_MESSAGES[2],
    unread_count: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'conv-003', match_id: 'match-003',
    partner: MOCK_USERS[1], unread_count: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1', user_id: 'current-user-001', type: 'new_match',
    title: 'تطابق جديد! 🎉', title_ar: 'تطابق جديد! 🎉',
    body: 'أنت وسارة متطابقان الآن! ابدأ المحادثة.', body_ar: 'أنت وسارة متطابقان الآن! ابدأ المحادثة.',
    avatar_url: MOCK_USERS[0].profile_photo, reference_id: 'user-002',
    is_read: false, created_at: new Date(Date.now() - 3000000).toISOString(),
  }
];

export const INITIAL_TRANSACTIONS: CoinTransaction[] = [
  {
    id: 'tx-1', user_id: 'current-user-001', transaction_type: 'reward',
    amount: 150, description: 'Welcome Bonus', description_ar: 'مكافأة ترحيبية',
    status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-001', reporter_id: 'user-002', reporter_name: 'سارة خالد',
    reported_user_id: 'user-004', reported_user: MOCK_USERS[2],
    reason: 'Spam', description: 'إرسال رسائل ترويجية متكررة.',
    status: 'pending',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  }
];