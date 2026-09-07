// ============================================================================
// jopi TypeScript Type Definitions
// Core models with Unique Custom User IDs (Sugo/Bigo Style), Voice Rooms & Gifts
// ============================================================================

export type Gender = 'male' | 'female' | 'non_binary' | 'other';
export type MessageType = 'text' | 'image' | 'voice' | 'gift';
export type MatchStatus = 'active' | 'unmatched' | 'blocked';
export type CallType = 'voice' | 'video';
export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected';
export type ReportReason = 'Spam' | 'Fake Profile' | 'Harassment' | 'Inappropriate Content' | 'Scam' | 'Other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
export type NotificationType = 'new_like' | 'new_match' | 'new_message' | 'gift_received' | 'incoming_call' | 'profile_interaction' | 'system';
export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AuthProviderType = 'email' | 'phone' | 'google' | 'apple';

export interface User {
  id: string;
  custom_id: string; // Unique Custom User ID (e.g. 84920194)
  email: string;
  phone_number?: string;
  display_name: string;
  date_of_birth: string;
  age?: number;
  gender: Gender;
  country: string;
  city: string;
  bio: string;
  profile_photo: string;
  photos: string[];
  interests: string[];
  languages: string[];
  is_online: boolean;
  last_seen: string;
  is_verified: boolean;
  vip_level?: number;
  coin_balance: number;
  is_banned?: boolean;
  role: 'user' | 'admin' | 'moderator';
  job_title?: string;
  company?: string;
  school?: string;
  height_cm?: number;
  relationship_goals?: string;
  distance_km?: number;
  
  device_info?: string;
  auth_provider?: AuthProviderType;

  created_at: string;
  updated_at: string;
}

// --- تصدير نموذج طلبات الصداقة والأصدقاء بشكل صريح ---
export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Interest {
  id: string;
  name: string;
  name_ar?: string;
  icon: string;
  category: 'lifestyle' | 'creative' | 'health' | 'entertainment' | 'intellectual' | 'general';
}

export interface Like {
  id: string;
  sender_id: string;
  receiver_id: string;
  is_super_like: boolean;
  created_at: string;
}

export interface Pass {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user_one_id: string;
  user_two_id: string;
  matched_user?: User;
  status: MatchStatus;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at: string;
  updated_at: string;
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
  gift_data?: Gift;
  is_read: boolean;
  is_delivered: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  match_id?: string;
  partner: User;
  last_message?: Message;
  unread_count: number;
  is_muted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gift {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  coin_price: number;
  animation_type: 'pulse' | 'bloom' | 'sparkle' | 'unboxing' | 'shine' | 'royalty';
  rarity: GiftRarity;
}

export interface GiftTransaction {
  id: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  gift_id: string;
  gift?: Gift;
  coin_amount: number;
  conversation_id?: string;
  room_id?: string;
  created_at: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonus_coins: number;
  price_usd: number;
  is_popular?: boolean;
  is_best_value?: boolean;
  badge?: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'gift_sent' | 'gift_received' | 'reward' | 'refund';
  amount: number;
  description: string;
  description_ar?: string;
  reference_id?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  title_ar?: string;
  body: string;
  body_ar?: string;
  reference_id?: string;
  avatar_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reported_user_id: string;
  reported_user?: User;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  action_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  user?: User;
  created_at: string;
}

export interface CallSession {
  id: string;
  caller: User;
  receiver: User;
  call_type: CallType;
  status: CallStatus;
  duration_seconds: number;
  is_muted: boolean;
  is_speaker_on: boolean;
  is_video_enabled: boolean;
  is_camera_flipped?: boolean;
  started_at?: string;
}

export interface FilterPreferences {
  age_min: number;
  age_max: number;
  gender_preference: 'men' | 'women' | 'everyone';
  country?: string;
  city?: string;
  max_distance_km: number;
  online_only: boolean;
  verified_only: boolean;
  selected_interests: string[];
}

export interface UserSettings {
  id: string;
  user_id: string;
  discovery_enabled: boolean;
  filters: FilterPreferences;
  notifications_enabled: boolean;
  sound_effects_enabled: boolean;
  language: string;
  dark_mode: boolean;
  ghost_mode: boolean;
  show_online_status: boolean;
  read_receipts: boolean;
}

export interface AdminStats {
  total_users: number;
  active_matches: number;
  messages_sent: number;
  gifts_exchanged: number;
  coins_circulated: number;
  pending_reports: number;
  verified_users: number;
}

// Voice & Video Party Rooms
export type RoomCategory = 'all' | 'chat' | 'music' | 'gaming' | 'dating' | 'friendship';
export type RoomStageType = 'audio' | 'video';

export interface RoomSeat {
  seat_index: number;
  user?: User;
  is_muted: boolean;
  is_speaking: boolean;
  is_locked: boolean;
}

export interface VoiceRoom {
  id: string;
  host_id: string;
  host: User;
  title: string;
  description?: string;
  category: RoomCategory;
  type: RoomStageType;
  bg_theme: string;
  cover_url?: string;
  country_flag: string;
  language: string;
  audience_count: number;
  is_live: boolean;
  is_password_protected?: boolean;
  seats: RoomSeat[];
  tags: string[];
  top_fans?: User[];
  created_at: string;
}

export interface RoomMessage {
  id: string;
  room_id: string;
  sender: User;
  message_type: 'chat' | 'gift' | 'entry' | 'game';
  text?: string;
  gift_data?: Gift;
  target_seat?: number | 'all';
  target_user_name?: string;
  dice_value?: number;
  created_at: string;
}