// ============================================================================
// MingleUp Voice & Video Party Rooms Service (Sugo-Style Production Version)
// ============================================================================

import { VoiceRoom, RoomMessage, User, RoomCategory, Gift } from '../types';
import { StorageService } from './storageService';
import { WalletService } from './walletService';
import { UserService } from './userService';
import { supabase } from './supabaseClient';

const STORAGE_KEYS_ROOMS = {
  ROOMS_LIST: 'mingleup_voice_rooms',
  ROOM_MESSAGES: 'mingleup_room_messages',
  ROOM_MIC_ANIMATIONS: 'mingleup_room_mic_animations',
};

export interface RoomBackgroundOption {
  id: string;
  name: string;
  type: 'animated' | 'level_locked' | 'custom_temporary';
  url: string;
  requiredLevel?: number;
  coinPrice?: number;
  durationDays?: number;
}

export type MicAnimationType = 'heart' | 'kiss' | 'rose' | 'fire' | 'laugh' | 'applause' | 'bomb' | 'party';

export interface MicAnimationPayload {
  id: string;
  roomId: string;
  sender: User;
  targetSeatIndex: number;
  animationType: MicAnimationType;
  timestamp: string;
}

export class RoomService {
  static async getRooms(category: RoomCategory = 'all'): Promise<VoiceRoom[]> {
    let query = supabase.from('voice_rooms').select(`
      *,
      host:profiles!host_id(*),
      seats:room_seats(*, user:profiles(*))
    `).order('created_at', { ascending: false });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) {
      const defaultRooms = StorageService.get<VoiceRoom[]>(STORAGE_KEYS_ROOMS.ROOMS_LIST, []);
      if (category === 'all') return defaultRooms;
      return defaultRooms.filter(r => r.category === category);
    }

    return data as VoiceRoom[];
  }

  static async getRoomById(roomId: string): Promise<VoiceRoom | undefined> {
    const { data, error } = await supabase
      .from('voice_rooms')
      .select(`
        *,
        host:profiles!host_id(*),
        seats:room_seats(*, user:profiles(*))
      `)
      .eq('id', roomId)
      .single();

    if (error || !data) {
      const rooms = StorageService.get<VoiceRoom[]>(STORAGE_KEYS_ROOMS.ROOMS_LIST, []);
      return rooms.find(r => r.id === roomId);
    }

    return data as VoiceRoom;
  }

  static async createRoom(params: {
    title: string;
    description?: string;
    category: RoomCategory;
    type: 'audio' | 'video';
    host: User;
    bgTheme?: string;
    coverUrl?: string;
    requestedSeats?: number;   
    roomLevel?: number;        
    roomTotalSupport?: number; 
  }): Promise<VoiceRoom> {
    const targetSeats = params.requestedSeats || 8;
    const currentLevel = params.roomLevel || 1;
    const totalSupport = params.roomTotalSupport || 0;

    let allowedSeats = 8;
    if (targetSeats > 8) {
      if (currentLevel >= 5 && totalSupport >= 50000) {
        allowedSeats = Math.min(targetSeats, 30);
      } else if (currentLevel >= 3 && totalSupport >= 15000) {
        allowedSeats = Math.min(targetSeats, 16);
      } else {
        allowedSeats = 8;
      }
    } else {
      allowedSeats = Math.max(1, Math.min(targetSeats, 8));
    }

    const roomId = `room-${Date.now()}`;
    const coverUrl = params.coverUrl || params.host.profile_photo;
    const bgTheme = params.bgTheme || 'from-brand-950 via-slate-900 to-indigo-950';

    const newRoom: VoiceRoom = {
      id: roomId,
      title: params.title,
      description: params.description || '',
      host_id: params.host.id,
      host: params.host,
      category: params.category,
      type: params.type,
      is_locked: false,
      cover_url: coverUrl,
      bg_theme: bgTheme,
      admins: [params.host.id],
      created_at: new Date().toISOString(),
      seats: Array.from({ length: allowedSeats }, (_, index) => ({
        id: `seat-${index}-${Date.now()}`,
        room_id: roomId,
        seat_index: index,
        user_id: index === 0 ? params.host.id : null,
        user: index === 0 ? params.host : undefined,
        is_muted: false,
        is_locked: index >= 8,
      }))
    };

    try {
      await supabase
        .from('voice_rooms')
        .insert({
          id: roomId,
          title: params.title,
          host_id: params.host.id,
          category: params.category,
          type: params.type,
          is_locked: false,
          cover_url: coverUrl,
          bg_theme: bgTheme,
          admins: [params.host.id],
        });

      const initialSeats = Array.from({ length: allowedSeats }, (_, index) => ({
        room_id: roomId,
        seat_index: index,
        user_id: index === 0 ? params.host.id : null,
        is_muted: false,
        is_locked: index >= 8,
      }));

      await supabase.from('room_seats').insert(initialSeats);
    } catch (e) {
      console.warn('[RoomService] Cloud sync fallback active, using local storage.');
    }

    const existingRooms = StorageService.get<VoiceRoom[]>(STORAGE_KEYS_ROOMS.ROOMS_LIST, []);
    StorageService.set(STORAGE_KEYS_ROOMS.ROOMS_LIST, [newRoom, ...existingRooms]);

    return newRoom;
  }

  static async takeSeat(roomId: string, seatIndex: number, user: User): Promise<VoiceRoom | undefined> {
    try {
      await supabase
        .from('room_seats')
        .update({ user_id: null, is_muted: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      await supabase
        .from('room_seats')
        .update({ user_id: user.id, is_muted: false })
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex)
        .is('user_id', null)
        .eq('is_locked', false);
    } catch (e) {}

    this.sendRoomMessage(roomId, `صعد ${user.display_name} على المايك رقم ${seatIndex + 1} 🎙️`, user, 'entry');

    return this.getRoomById(roomId);
  }

  static async leaveSeat(roomId: string, user: User): Promise<VoiceRoom | undefined> {
    try {
      await supabase
        .from('room_seats')
        .update({ user_id: null, is_muted: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    } catch (e) {}

    return this.getRoomById(roomId);
  }

  static async toggleSeatMute(roomId: string, seatIndex: number): Promise<boolean> {
    let newMuteState = false;
    try {
      const { data } = await supabase
        .from('room_seats')
        .select('is_muted')
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex)
        .single();

      newMuteState = !data?.is_muted;

      await supabase
        .from('room_seats')
        .update({ is_muted: newMuteState })
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex);
    } catch (e) {}

    return newMuteState;
  }

  static sendMicAnimation(roomId: string, sender: User, targetSeatIndex: number, animationType: MicAnimationType): MicAnimationPayload {
    StorageService.initializeDefaults();
    const allAnimations = StorageService.get<Record<string, MicAnimationPayload[]>>(STORAGE_KEYS_ROOMS.ROOM_MIC_ANIMATIONS, {});
    if (!allAnimations[roomId]) {
      allAnimations[roomId] = [];
    }

    const payload: MicAnimationPayload = {
      id: `anim-${Date.now()}-${Math.random()}`,
      roomId,
      sender,
      targetSeatIndex,
      animationType,
      timestamp: new Date().toISOString(),
    };

    allAnimations[roomId].push(payload);
    if (allAnimations[roomId].length > 20) {
      allAnimations[roomId] = allAnimations[roomId].slice(-20);
    }

    StorageService.set(STORAGE_KEYS_ROOMS.ROOM_MIC_ANIMATIONS, allAnimations);
    return payload;
  }

  static getMicAnimations(roomId: string): MicAnimationPayload[] {
    StorageService.initializeDefaults();
    const allAnimations = StorageService.get<Record<string, MicAnimationPayload[]>>(STORAGE_KEYS_ROOMS.ROOM_MIC_ANIMATIONS, {});
    return allAnimations[roomId] || [];
  }

  static rollDice(roomId: string, user: User): number {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    this.sendRoomMessage(
      roomId,
      `🎲 قام ${user.display_name} برمي النرد المحظوظ وحصل على الرقم [ ${diceValue} ]! 🎯`,
      user,
      'game'
    );
    return diceValue;
  }

  static getAvailableBackgrounds(): RoomBackgroundOption[] {
    return [
      { id: 'anim_neon', name: 'نيون متحرك', type: 'animated', url: 'bg-neon-animated.gif' },
      { id: 'anim_galaxy', name: 'مجرة متحركة', type: 'animated', url: 'bg-galaxy-animated.gif' },
      { id: 'lvl_gold', name: 'الخلفية الذهبية', type: 'level_locked', requiredLevel: 5, url: 'bg-gold-vip.jpg' },
      { id: 'lvl_diamond', name: 'خلفية الماسية', type: 'level_locked', requiredLevel: 10, url: 'bg-diamond-vip.jpg' },
    ];
  }

  static async setCustomTemporaryBackground(
    roomId: string,
    user: User,
    customImageUrl: string,
    durationDays: 3 | 5 | 7
  ): Promise<{ success: boolean; error?: string }> {
    const pricingMap: Record<number, number> = {
      3: 500,  
      5: 800,  
      7: 1200  
    };

    const cost = pricingMap[durationDays] || 500;

    const deducted = await WalletService.deductCoinsReal(
      cost,
      `Custom Room Background for ${durationDays} days`,
      `شراء خلفية غرفة مخصصة لمدة ${durationDays} أيام`
    );

    if (!deducted) {
      return { success: false, error: 'INSUFFICIENT_COINS' };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    try {
      await supabase
        .from('voice_rooms')
        .update({
          bg_theme: customImageUrl,
          bg_expires_at: expiresAt.toISOString(),
        })
        .eq('id', roomId);
    } catch (e) {}

    this.sendRoomMessage(
      roomId,
      `🎨 قام المضيف بتعيين خلفية مخصصة جديدة لمدة ${durationDays} أيام!`,
      user,
      'chat'
    );

    return { success: true };
  }

  static getRoomMessages(roomId: string): RoomMessage[] {
    StorageService.initializeDefaults();
    const allMsgs = StorageService.get<Record<string, RoomMessage[]>>(STORAGE_KEYS_ROOMS.ROOM_MESSAGES, {});
    return allMsgs[roomId] || [];
  }

  static sendRoomMessage(
    roomId: string, 
    text: string, 
    sender: User, 
    type: 'chat' | 'gift' | 'entry' | 'game' = 'chat',
    giftData?: Gift,
    targetUserName?: string
  ): RoomMessage {
    StorageService.initializeDefaults();
    const allMsgs = StorageService.get<Record<string, RoomMessage[]>>(STORAGE_KEYS_ROOMS.ROOM_MESSAGES, {});
    if (!allMsgs[roomId]) {
      allMsgs[roomId] = [];
    }

    const newMsg: RoomMessage = {
      id: `rmsg-${Date.now()}-${Math.random()}`,
      room_id: roomId,
      sender,
      message_type: type,
      text,
      gift_data: giftData,
      target_user_name: targetUserName,
      created_at: new Date().toISOString(),
    };

    allMsgs[roomId].push(newMsg);
    if (allMsgs[roomId].length > 50) {
      allMsgs[roomId] = allMsgs[roomId].slice(-50);
    }

    StorageService.set(STORAGE_KEYS_ROOMS.ROOM_MESSAGES, allMsgs);
    return newMsg;
  }

  static async sendRoomGift(
    roomId: string,
    gift: Gift,
    sender: User,
    targetName: string,
    targetCount = 1
  ): Promise<{ success: boolean; error?: string }> {
    const totalCost = gift.coin_price * targetCount;
    
    const deducted = await WalletService.deductCoinsReal(
      totalCost,
      `Sent ${gift.name} in Room to ${targetName}`,
      `إرسال ${gift.name_ar} داخل الغرفة إلى ${targetName}`
    );

    if (!deducted) {
      return { success: false, error: 'INSUFFICIENT_COINS' };
    }

    this.sendRoomMessage(
      roomId,
      `أرسل ${gift.name_ar} ${gift.icon} إلى ${targetName} (${targetCount}x)!`,
      sender,
      'gift',
      gift,
      targetName
    );

    return { success: true };
  }
}