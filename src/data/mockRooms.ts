// ============================================================================
// jopi Voice & Video Party Rooms Mock Data (Sugo-Inspired)
// Pre-populated live rooms with hosts, mic seats, and active audience
// ============================================================================

import { VoiceRoom, RoomMessage } from '../types';
import { MOCK_USERS, CURRENT_USER, MOCK_GIFTS } from './mockData';

// دالة مساعدة آمنة لضمان عدم حدوث Crash إذا كان الفهرس غير موجود
const getUser = (index: number) => {
  if (Array.isArray(MOCK_USERS) && MOCK_USERS[index]) {
    return MOCK_USERS[index];
  }
  return MOCK_USERS?.[0] || CURRENT_USER;
};

const getGift = (index: number) => {
  if (Array.isArray(MOCK_GIFTS) && MOCK_GIFTS[index]) {
    return MOCK_GIFTS[index];
  }
  return undefined;
};

export const MOCK_ROOMS: VoiceRoom[] = [
  {
    id: 'room-001',
    host_id: getUser(4).id, // Omar
    host: getUser(4),
    title: 'مجلس شباب الرياض ☕🇸🇦 سوالف ونقاشات',
    description: 'أهلاً بكم في مجلسنا اليومي! حوارات ممتعة، نقاشات تقنية، وضحك من القلب.',
    category: 'chat',
    type: 'audio',
    bg_theme: 'from-brand-950 via-slate-900 to-indigo-950',
    cover_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇸🇦',
    language: 'العربية',
    audience_count: 284,
    is_live: true,
    tags: ['سوالف', 'الرياض', 'تقنية', 'قهوة'],
    seats: [
      { seat_index: 0, user: getUser(4), is_muted: false, is_speaking: true, is_locked: false }, // Host Omar
      { seat_index: 1, user: getUser(0), is_muted: false, is_speaking: false, is_locked: false }, // Sarah
      { seat_index: 2, user: getUser(2), is_muted: true, is_speaking: false, is_locked: false },  // Rayan
      { seat_index: 3, user: getUser(6), is_muted: false, is_speaking: true, is_locked: false }, // Faisal
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(0), getUser(6), getUser(1)],
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'room-002',
    host_id: getUser(5).id, // Maya
    host: getUser(5),
    title: 'سهرة طرب وعزف بيانو مباشر 🎵🎹',
    description: 'أجمل المقطوعات والأغاني الكلاسيكية والطربية بصوت نقي وأجواء ساحرة.',
    category: 'music',
    type: 'audio',
    bg_theme: 'from-purple-950 via-slate-900 to-rose-950',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇱🇧',
    language: 'العربية / English',
    audience_count: 532,
    is_live: true,
    tags: ['موسيقى', 'طرب', 'بيانو', 'غناء'],
    seats: [
      { seat_index: 0, user: getUser(5), is_muted: false, is_speaking: true, is_locked: false }, // Host Maya
      { seat_index: 1, user: getUser(17), is_muted: false, is_speaking: false, is_locked: false }, // Audio Producer
      { seat_index: 2, user: getUser(1), is_muted: true, is_speaking: false, is_locked: false },  // Layla
      { seat_index: 3, user: getUser(9), is_muted: false, is_speaking: false, is_locked: false }, // Dina
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(17), getUser(1), getUser(9)],
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'room-003',
    host_id: getUser(11).id, // Huda
    host: getUser(11),
    title: 'تحديات ولعبة النرد والصراحة 🎲🔥',
    description: 'فعاليات حماسية، تحديات النرد، وأسئلة غير متوقعة! اصعد المايك وشاركنا.',
    category: 'gaming',
    type: 'audio',
    bg_theme: 'from-amber-950 via-slate-900 to-rose-950',
    cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇸🇦',
    language: 'العربية',
    audience_count: 318,
    is_live: true,
    tags: ['ألعاب', 'تحديات', 'نرد', 'ضحك'],
    seats: [
      { seat_index: 0, user: getUser(11), is_muted: false, is_speaking: true, is_locked: false }, // Host Huda
      { seat_index: 1, user: getUser(8), is_muted: false, is_speaking: false, is_locked: false },  // Tariq
      { seat_index: 2, user: getUser(12), is_muted: false, is_speaking: true, is_locked: false }, // Elena
      { seat_index: 3, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(8), getUser(12)],
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'room-004',
    host_id: getUser(1).id, // Layla
    host: getUser(1),
    title: 'ديوانية دبي ومواهب لايف ✨🇦🇪 (فيديو)',
    description: 'بث مباشر بالفيديو مع مهندسي ومصممي دبي! شاركونا أفكاركم وتجاربكم.',
    category: 'dating',
    type: 'video',
    bg_theme: 'from-cyan-950 via-slate-900 to-blue-950',
    cover_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇦🇪',
    language: 'العربية / English',
    audience_count: 412,
    is_live: true,
    tags: ['دبي', 'فيديو', 'لايف', 'تصميم'],
    seats: [
      { seat_index: 0, user: getUser(1), is_muted: false, is_speaking: true, is_locked: false }, // Host Layla
      { seat_index: 1, user: getUser(10), is_muted: false, is_speaking: true, is_locked: false }, // Khalid
      { seat_index: 2, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 3, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(10), getUser(4)],
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'room-005',
    host_id: getUser(0).id, // Sarah
    host: getUser(0),
    title: 'قهوة الصباح وسوالف إيجابية 🌸☕',
    description: 'ابدأ يومك بطاقة متجددة وأحاديث خفيفة ودافئة مع أصدقاء جدد.',
    category: 'friendship',
    type: 'audio',
    bg_theme: 'from-pink-950 via-slate-900 to-purple-950',
    cover_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇸🇦',
    language: 'العربية',
    audience_count: 198,
    is_live: true,
    tags: ['صباح', 'قهوة', 'إيجابية', 'صداقة'],
    seats: [
      { seat_index: 0, user: getUser(0), is_muted: false, is_speaking: true, is_locked: false }, // Host Sarah
      { seat_index: 1, user: getUser(3), is_muted: false, is_speaking: false, is_locked: false },  // Nour
      { seat_index: 2, user: getUser(16), is_muted: true, is_speaking: false, is_locked: false }, // Shahad
      { seat_index: 3, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(3), getUser(16)],
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'room-006',
    host_id: getUser(12).id, // Elena
    host: getUser(12),
    title: 'London & Global Vibes 🇬🇧✈️ (Video Stage)',
    description: 'International hangout talking about travel, art exhibitions, and music.',
    category: 'chat',
    type: 'video',
    bg_theme: 'from-slate-950 via-purple-950 to-slate-900',
    cover_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇬🇧',
    language: 'English / العربية',
    audience_count: 645,
    is_live: true,
    tags: ['London', 'Travel', 'Video', 'Art'],
    seats: [
      { seat_index: 0, user: getUser(12), is_muted: false, is_speaking: true, is_locked: false }, // Host Elena
      { seat_index: 1, user: getUser(15), is_muted: false, is_speaking: true, is_locked: false }, // Lucas
      { seat_index: 2, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 3, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 4, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 5, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 6, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
      { seat_index: 7, user: undefined, is_muted: false, is_speaking: false, is_locked: false },
    ],
    top_fans: [getUser(15)],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  }
];

export const INITIAL_ROOM_MESSAGES: Record<string, RoomMessage[]> = {
  'room-001': [
    {
      id: 'rmsg-1',
      room_id: 'room-001',
      sender: getUser(0), // Sarah
      message_type: 'chat',
      text: 'مساء الخير جميعاً! منورين المجلس ✨',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'rmsg-2',
      room_id: 'room-001',
      sender: getUser(6), // Faisal
      message_type: 'gift',
      gift_data: getGift(1), // Rose
      target_user_name: 'عمر الفاروق (المضيف)',
      text: 'أرسل وردة حمراء 🌹 إلى المضيف!',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'rmsg-3',
      room_id: 'room-001',
      sender: getUser(2), // Rayan
      message_type: 'chat',
      text: 'موضوع شيق جداً يا عمر، كلامك في محله 👏',
      created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    }
  ]
};