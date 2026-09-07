// ============================================================================
// jopi Flexible & Permissive Types (The Ultimate Solution)
// ============================================================================

export type MessageType = 'text' | 'image' | 'voice' | 'audio' | 'gift' | 'system';
export type RoomCategory = 'all' | 'general' | 'music' | 'chat' | 'gaming' | 'poetry' | 'dating' | 'friendship';
export type CallType = 'voice' | 'video';
export type RoomSeat = VoiceSeat;

export interface User {
  id: string;
  custom_id?: string;
  email?: string;
  phone_number?: string;
  auth_provider?: string;
  display_name: string;
  profile_photo: string;
  photos?: string[];
  gallery_photos?: string[];
  bio?: string;
  gender?: string;
  age?: number;
  date_of_birth?: string;
  country?: string;
  city?: string;
  job_title?: string;
  company?: string;
  languages?: string[];
  vip_level?: number;
  height_cm?: number;
  distance_km?: number;
  is_online?: boolean;
  last_seen?: string;
  is_verified?: boolean;
  is_banned?: boolean;
  role?: string;
  relationship_goals?: string;
  device_info?: string;
  coin_balance: number;
  interests: string[];
  guard_status?: any;
  [key: string]: any; // السماح بأي خصائص إضافية تفادياً لأخطاء الـ Mock Data
}

export interface UserMoment {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  [key: string]: any;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message_type: MessageType;
  text?: string;
  media_url?: string;
  media_duration?: number;
  gift_id?: string;
  gift_data?: any;
  is_read?: boolean;
  is_delivered?: boolean;
  created_at: string;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  match_id?: string;
  partner?: User;
  last_message?: Message;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface Gift {
  id: string;
  name: string;
  name_ar: string;
  coin_price: number;
  icon: string;
  animation_url?: string;
  animation_type?: string;
  rarity?: string;
  [key: string]: any;
}

export interface GiftTransaction {
  id: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  gift_id?: string;
  gift?: Gift;
  count?: number;
  coin_amount?: number;
  conversation_id?: string;
  created_at: string;
  [key: string]: any;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type?: string;
  transaction_type?: string;
  description: string;
  description_ar?: string;
  status?: string;
  created_at: string;
  [key: string]: any;
}

export interface CoinPackage {
  id: string;
  coins: number;
  price_usd: number;
  bonus_coins?: number;
  is_popular?: boolean;
  is_best_value?: boolean;
  badge?: string;
  [key: string]: any;
}

export type RoomStageType = 'audio' | 'video';

export interface VoiceSeat {
  seat_index: number;
  user_id?: string;
  user?: User;
  is_muted?: boolean;
  is_speaking?: boolean;
  is_locked?: boolean;
  [key: string]: any;
}

export interface VoiceRoom {
  id: string;
  host_id: string;
  host?: User;
  title: string;
  description?: string;
  category: RoomCategory;
  type: 'audio' | 'video';
  bg_theme?: string;
  cover_url?: string;
  country_flag?: string;
  language?: string;
  audience_count?: number;
  is_live?: boolean;
  is_locked?: boolean;
  tags?: string[];
  seats?: VoiceSeat[];
  admins?: string[];
  top_fans?: User[];
  created_at: string;
  [key: string]: any;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender?: User;
  message_type?: string;
  text: string;
  gift_data?: any;
  target_user_name?: string;
  created_at: string;
  [key: string]: any;
}

export interface Match {
  id: string;
  user_one_id: string;
  user_two_id: string;
  matched_user?: User;
  status?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  user?: User;
  created_at: string;
  [key: string]: any;
}

export type ReportReason = string;

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reported_user_id: string;
  reported_user?: User;
  reason: ReportReason;
  description?: string;
  action_notes?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  type?: string;
  title: string;
  title_ar?: string;
  body: string;
  body_ar?: string;
  avatar_url?: string;
  reference_id?: string;
  is_read?: boolean;
  created_at: string;
  [key: string]: any;
}

export interface CallSession {
  id: string;
  caller_id?: string;
  caller?: User;
  receiver_id?: string;
  receiver?: User;
  call_type?: CallType;
  status?: string;
  duration_seconds?: number;
  is_muted?: boolean;
  is_speaker_on?: boolean;
  is_video_enabled?: boolean;
  started_at?: string;
  [key: string]: any;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  push_notifications?: boolean;
  sound_enabled?: boolean;
  sound_effects_enabled?: boolean;
  discovery_enabled?: boolean;
  notifications_enabled?: boolean;
  dark_mode?: boolean;
  filters?: any;
  language?: string;
  theme?: string;
  [key: string]: any;
}

export interface FilterPreferences {
  gender_preference?: string;
  age_min?: number;
  age_max?: number;
  max_distance_km?: number;
  online_only?: boolean;
  verified_only?: boolean;
  country?: string;
  selected_interests?: string[];
  [key: string]: any;
}