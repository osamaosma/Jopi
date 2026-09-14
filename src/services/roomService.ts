// ============================================================================
// jopi Voice & Video Party Rooms Service (Pure Cloud / Supabase Version - Clean & Fixed)
// ============================================================================

import { VoiceRoom, RoomMessage, User, RoomCategory, Gift } from '../types';
import { WalletService } from './walletService';
import { DatabaseService } from './databaseService';
import { supabase } from './supabaseClient';

export class RoomService {
  // كاش محلي للبروفايلات لتجنب تكرار الطلبات ومنع استهلاك الشبكة
  private static profileCache = new Map<string, any>();

  // ذاكرة تخزين مؤقتة للرسائل الحية حسب الغرفة
  private static localRoomMessages = new Map<string, RoomMessage[]>();

  /**
   * جلب بروفايل مستخدم بطريقة آمنة بدون التسبب في خطأ 406
   */
  static async getSafeProfile(userId: string): Promise<any | null> {
    if (!userId) return null;
    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        const fallback = {
          id: userId,
          display_name: 'مستخدم',
          username: 'user',
          profile_photo: '',
          coin_balance: 0,
          interests: [],
        };
        return fallback;
      }

      this.profileCache.set(userId, data);
      return data;
    } catch {
      return null;
    }
  }

  static async getRooms(category: RoomCategory = 'all'): Promise<VoiceRoom[]> {
    try {
      const remoteRooms = await DatabaseService.fetchActiveRooms(category);
      if (remoteRooms) {
        return remoteRooms;
      }
    } catch (err) {
      console.error('[RoomService] Error fetching remote rooms:', err);
    }
    return [];
  }

  static async getRoomById(roomId: string): Promise<VoiceRoom | undefined> {
    try {
      // 1. جلب بيانات الغرفة باستخدام maybeSingle لتجنب أخطاء 406
      const { data: roomData, error: roomError } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();

      if (roomError || !roomData) {
        return undefined;
      }

      // 2. فحص الحضور الفعلي النشط داخل الغرفة عبر جدول room_presence
      const { data: presenceData } = await supabase
        .from('room_presence')
        .select('user_id')
        .eq('room_id', roomId);

      const activePresenceIds = new Set(
        (presenceData || []).map((p: { user_id?: string | null }) => p.user_id).filter(Boolean)
      );

      // 3. جلب مقاعد الغرفة
      const { data: seatsData } = await supabase
        .from('room_seats')
        .select('*')
        .eq('room_id', roomId)
        .order('seat_index', { ascending: true });

      const seatIdsFetch: string[] = [];
      const hostId = roomData.host_id ? String(roomData.host_id).trim() : '';
      if (hostId) seatIdsFetch.push(hostId);

      // 4. فحص المقاعد وإخلاء المقعد فوراً لأي مستخدم غير متواجد في الـ presence
      const profilesMap = new Map<string, any>();

      const seats = await Promise.all(
        (seatsData || []).map(async (s: any) => {
          const currentUserId = s.user_id ? String(s.user_id).trim() : null;
          const isHost = currentUserId === hostId;

          let isUserStillPresent = false;
          if (!currentUserId) {
            isUserStillPresent = false;
          } else if (isHost) {
            isUserStillPresent = true;
          } else {
            // التحقق من الوجود الفعلي، وإذا أغلق المستخدم المتصفح ولم يعد موجوداً في الحضور يتم إفراغ مقعده تلقائياً
            isUserStillPresent = activePresenceIds.has(currentUserId);
          }

          const validUserId = isUserStillPresent ? currentUserId : null;

          if (currentUserId && !validUserId) {
            await supabase
              .from('room_seats')
              .update({ user_id: null, is_muted: false })
              .eq('room_id', roomId)
              .eq('seat_index', s.seat_index);
          }

          if (validUserId) {
            seatIdsFetch.push(validUserId);
          }

          return {
            seat_index: s.seat_index,
            user_id: validUserId,
            is_muted: s.is_muted || false,
            is_speaking: false,
            is_locked: s.is_locked || false,
          };
        })
      );

      // جلب البروفايلات للمستخدمين النشطين فقط
      const uniqueIds = Array.from(new Set(seatIdsFetch));
      if (uniqueIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', uniqueIds);

        profilesData?.forEach((p: any) => {
          profilesMap.set(p.id, p);
          this.profileCache.set(p.id, p);
        });
      }

      // ربط بيانات المستخدمين بالمقاعد
      const populatedSeats = seats.map((s) => {
        let seatUser = null;
        if (s.user_id) {
          seatUser = profilesMap.get(s.user_id) || {
            id: s.user_id,
            display_name: s.user_id === roomData.host_id ? 'المستضيف' : 'عضو',
            username: 'user',
            profile_photo: '',
          };
        }
        return {
          ...s,
          user: seatUser,
        };
      });

      let hostUser = profilesMap.get(roomData.host_id);
      if (!hostUser && roomData.host_id) {
        hostUser = {
          id: roomData.host_id,
          display_name: 'المستضيف',
          username: 'host',
          profile_photo: roomData.cover_url || '',
        };
      }

      // حساب عدد الأشخاص والاتصال الحقيقي بشكل صحيح ودقيق لتجنب الأخطاء في العداد
      const actualConnectedCount = Math.max(
        activePresenceIds.size,
        populatedSeats.filter(s => s.user_id !== null).length,
        1
      );

      return {
        id: roomData.id,
        title: roomData.title,
        description: roomData.description,
        host_id: roomData.host_id,
        host: hostUser,
        category: roomData.category,
        type: roomData.type,
        is_locked: roomData.is_locked,
        cover_url: roomData.cover_url,
        bg_theme: roomData.bg_theme,
        admins: roomData.admins || [roomData.host_id],
        audience_count: actualConnectedCount,
        is_live: true,
        seats: populatedSeats,
        tags: roomData.tags || [],
        created_at: roomData.created_at,
      };
    } catch (err) {
      console.error('[RoomService] getRoomById batch error:', err);
      return undefined;
    }
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
  }): Promise<VoiceRoom> {
    const targetSeats = params.requestedSeats || 8;
    const roomId = `room-${Date.now()}`;
    const coverUrl = params.coverUrl || params.host.profile_photo;
    const bgTheme = params.bgTheme || 'bg-gradient-to-b from-pink-400 via-pink-600 to-purple-950';

    const { error: roomError } = await supabase
      .from('voice_rooms')
      .insert({
        id: roomId,
        title: params.title,
        description: params.description || '',
        host_id: params.host.id,
        category: params.category,
        type: params.type,
        is_locked: false,
        cover_url: coverUrl,
        bg_theme: bgTheme,
        admins: [params.host.id],
      });

    if (roomError) {
      console.error('[RoomService] Failed to create room in Supabase:', roomError.message);
    }

    const initialSeats = Array.from({ length: targetSeats }, (_, index) => ({
      room_id: roomId,
      seat_index: index,
      user_id: index === 0 ? params.host.id : null,
      is_muted: false,
      is_locked: index >= 8,
    }));

    const { error: seatsError } = await supabase
      .from('room_seats')
      .insert(initialSeats);

    if (seatsError) {
      console.error('[RoomService] Failed to create room seats in Supabase:', seatsError.message);
    }

    const createdRoom = await this.getRoomById(roomId);
    return (
      createdRoom || {
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
        audience_count: 1,
        is_live: true,
        seats: initialSeats.map((s, idx) => ({
          seat_index: idx,
          user: idx === 0 ? params.host : undefined,
          user_id: idx === 0 ? params.host.id : null,
          is_muted: false,
          is_speaking: false,
          is_locked: s.is_locked,
        })),
        tags: [],
        created_at: new Date().toISOString(),
      }
    );
  }

  static async takeSeat(roomId: string, seatIndex: number, user: User): Promise<VoiceRoom | undefined> {
    try {
      await supabase
        .from('room_seats')
        .update({ user_id: null, is_muted: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('room_seats')
        .update({ user_id: user.id, is_muted: false })
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex);

      if (error) {
        console.error('[RoomService] takeSeat update error:', error.message);
      }
    } catch (e) {
      console.error('[RoomService] takeSeat error:', e);
    }

    return await this.getRoomById(roomId);
  }

  static async leaveSeat(roomId: string, user: User): Promise<VoiceRoom | undefined> {
    try {
      await supabase
        .from('room_seats')
        .update({ user_id: null, is_muted: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('[RoomService] leaveSeat Error:', e);
    }

    return await this.getRoomById(roomId);
  }

  static async toggleSeatMute(roomId: string, seatIndex: number): Promise<boolean> {
    let newMuteState = false;
    try {
      const { data, error: fetchError } = await supabase
        .from('room_seats')
        .select('is_muted')
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex)
        .maybeSingle();

      if (fetchError || !data) return false;

      newMuteState = !data.is_muted;

      await supabase
        .from('room_seats')
        .update({ is_muted: newMuteState })
        .eq('room_id', roomId)
        .eq('seat_index', seatIndex);
    } catch (e) {
      console.error('[RoomService] toggleSeatMute Error:', e);
    }

    return newMuteState;
  }

  static async joinRoomPresence(roomId: string, user: User): Promise<void> {
    try {
      if (!roomId || !user?.id) return;

      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      if (!isValidUUID) return;

      await supabase
        .from('room_presence')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('room_presence')
        .insert({
          room_id: roomId,
          user_id: user.id,
        });

      if (error && error.code !== '23503' && error.code !== '23505') {
        console.warn('[RoomPresence] Note:', error.message);
      }
    } catch {
      // صمت مطبق لمنع الإزعاج
    }
  }

  static async leaveRoomPresence(roomId: string, user: User): Promise<void> {
    try {
      if (!roomId || !user?.id) return;
      
      await supabase
        .from('room_seats')
        .update({ user_id: null, is_muted: false })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      await supabase
        .from('room_presence')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('[RoomService] leaveRoomPresence error:', e);
    }
  }

  static async getRoomMembers(roomId: string): Promise<User[]> {
    try {
      const { data: presenceData } = await supabase
        .from('room_presence')
        .select('user_id')
        .eq('room_id', roomId);

      if (!presenceData || presenceData.length === 0) return [];

      const userIds = presenceData
        .map((p: { user_id?: string | null }) => p.user_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 5);

      if (userIds.length === 0) return [];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      return profilesData || [];
    } catch {
      return [];
    }
  }

  /**
   * استرجاع رسائل الغرفة الحالية من قاعدة البيانات أو الذاكرة المؤقتة
   */
  static async getRoomMessages(roomId: string): Promise<RoomMessage[]> {
    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map((msg: any) => ({
          id: msg.id,
          room_id: msg.room_id,
          sender: typeof msg.sender === 'object' ? msg.sender : {
            id: msg.sender_id || 'unknown',
            display_name: msg.sender_name || 'مستخدم',
            username: 'user',
            profile_photo: msg.sender_photo || '',
            coin_balance: 0,
            interests: []
          },
          message_type: msg.message_type || 'chat',
          text: msg.text || '',
          gift_data: msg.gift_data || undefined,
          target_user_name: msg.target_user_name || undefined,
          created_at: msg.created_at || new Date().toISOString()
        }));
      }
    } catch (err) {
      // تفادي انهيار الواجهة في حال عدم إنشاء جدول room_messages
    }

    return this.localRoomMessages.get(roomId) || [];
  }

  /**
   * إرسال رسالة داخل الغرفة وحفظها في Supabase والذاكرة الحية
   */
  static async sendRoomMessage(
    roomId: string,
    text: string,
    sender: User,
    type: 'chat' | 'gift' | 'entry' | 'game' = 'chat',
    giftData?: Gift,
    targetUserName?: string
  ): Promise<RoomMessage> {
    const msgId = `rmsg-${Date.now()}`;
    const senderName = sender?.display_name || sender?.username || 'مستخدم';

    const newMsg: RoomMessage = {
      id: msgId,
      room_id: roomId,
      sender: {
        id: sender.id,
        display_name: senderName,
        username: sender.username || 'user',
        profile_photo: sender.profile_photo || '',
        coin_balance: sender.coin_balance || 0,
        interests: sender.interests || [],
      },
      message_type: type,
      text,
      gift_data: giftData,
      target_user_name: targetUserName,
      created_at: new Date().toISOString(),
    };

    // 1. التخزين المؤقت الفوري لضمان ظهور الرسالة فوراً في الغرفة
    const currentList = this.localRoomMessages.get(roomId) || [];
    this.localRoomMessages.set(roomId, [...currentList.slice(-60), newMsg]);

    // 2. المزامنة في Supabase إن كان الجدول متوفراً
    try {
      await supabase.from('room_messages').insert([
        {
          id: msgId,
          room_id: roomId,
          sender_id: sender.id,
          sender_name: senderName,
          sender_photo: sender.profile_photo || '',
          sender: newMsg.sender,
          message_type: type,
          text: text,
          gift_data: giftData || null,
          target_user_name: targetUserName || null,
          created_at: newMsg.created_at,
        },
      ]);
    } catch {
      // الاستمرار في العمل بالاعتماد على الذاكرة الحية
    }

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

    // بث إشعار الهدية كرسالة داخل شات الغرفة تلقائياً
    await this.sendRoomMessage(
      roomId,
      `أرسل ${gift.name_ar || gift.name} إلى ${targetName}`,
      sender,
      'gift',
      gift,
      targetName
    );

    return { success: true };
  }

  static getMicAnimations(roomId: string) {
    return [];
  }

  static sendMicAnimation(roomId: string, sender: User, targetSeatIndex: number, animationType: string) {
    return null;
  }
}