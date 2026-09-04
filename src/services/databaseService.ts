// ============================================================================
// Jopi Database Service (Connected to 'users' table)
// ============================================================================

import { supabase } from './supabaseClient';
import { User } from '../types';

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
  }
};