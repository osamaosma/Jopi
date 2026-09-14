// ============================================================================
// Jopi Database Service (Pure & Safe Cloud Version - Fixed Seats Sync)
// ============================================================================

import { supabase } from './supabaseClient';
import { User, VoiceRoom, RoomCategory } from '../types';

export const DatabaseService = {
  async getProfile(userId: string): Promise<User | null> {
    try {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as User;
    } catch {
      return null;
    }
  },

  async saveProfile(user: Partial<User> & { id: string }): Promise<boolean> {
    try {
      if (!user || !user.id) return false;
      const { error } = await supabase
        .from('users')
        .upsert({
          ...user,
          updated_at: new Date().toISOString(),
        });

      return !error;
    } catch {
      return false;
    }
  },

  async getDiscoverUsers(currentUserId: string): Promise<User[]> {
    try {
      let query = supabase.from('users').select('*').limit(30);
      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }
      const { data, error } = await query;

      if (error || !data) return [];
      return data as User[];
    } catch {
      return [];
    }
  },

  async sendLike(senderId: string, receiverId: string, isSuperLike = false): Promise<boolean> {
    try {
      if (!senderId || !receiverId) return false;
      const { error } = await supabase
        .from('likes')
        .upsert({
          sender_id: senderId,
          receiver_id: receiverId,
          is_super_like: isSuperLike,
        });

      return !error;
    } catch {
      return false;
    }
  },

  // ============================================================================
  // Room Engine (Optimized & Safe Seat User Mapping)
  // ============================================================================

  async fetchActiveRooms(category: RoomCategory = 'all'): Promise<VoiceRoom[]> {
    try {
      let query = supabase.from('voice_rooms').select('*').order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data: rooms, error } = await query;
      if (error || !rooms) return [];

      // جلب جميع المستخدمين دفعة واحدة لتحسين الأداء وسرعة ربط المقاعد
      const { data: allUsers } = await supabase.from('users').select('*');
      const usersMap = new Map((allUsers || []).map((u: any) => [u.id, u]));

      const enhancedRooms = await Promise.all(
        rooms.map(async (room) => {
          const host = room.host_id ? usersMap.get(room.host_id) || null : null;
          const { data: seatsData } = await supabase.from('room_seats').select('*').eq('room_id', room.id);
          
          const seats = (seatsData || []).map((seat: any) => ({
            ...seat,
            user: seat.user_id ? usersMap.get(seat.user_id) || undefined : undefined,
          }));

          return {
            ...room,
            host,
            seats,
          } as VoiceRoom;
        })
      );

      return enhancedRooms;
    } catch (e) {
      console.error('[DatabaseService] fetchActiveRooms exception:', e);
      return [];
    }
  },

  async fetchRoomDetails(roomId: string): Promise<VoiceRoom | null> {
    try {
      const { data: room, error } = await supabase
        .from('voice_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error || !room) return null;

      // جلب كافة المستخدمين لربطهم بالمقاعد والمضيف فوراً ودون أخطاء
      const { data: allUsers } = await supabase.from('users').select('*');
      const usersMap = new Map((allUsers || []).map((u: any) => [u.id, u]));

      const host = room.host_id ? usersMap.get(room.host_id) || null : null;
      const { data: seatsData } = await supabase.from('room_seats').select('*').eq('room_id', room.id);
      
      const seats = (seatsData || []).map((seat: any) => ({
        ...seat,
        user: seat.user_id ? usersMap.get(seat.user_id) || undefined : undefined,
      }));

      return {
        ...room,
        host,
        seats,
      } as VoiceRoom;
    } catch (e) {
      console.error('[DatabaseService] fetchRoomDetails exception:', e);
      return null;
    }
  }
};