// ============================================================================
// Jopi Friend Service (Supabase Cloud Sync for Friendships & Requests)
// ============================================================================

import { supabase } from './supabaseClient';
import { User } from '../types';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: User;
  receiver?: User;
}

export class FriendService {
  // إرسال طلب صداقة لمستخدم آخر عبر الـ ID العادي
  static async sendFriendRequest(receiverId: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'غير مسجل الدخول' };

    if (user.id === receiverId) {
      return { success: false, error: 'لا يمكنك إرسال طلب صداقة لنفسك' };
    }

    const { data: existing } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'accepted') {
        return { success: false, error: 'أنتم أصدقاء بالفعل 🤝' };
      }
      return { success: false, error: 'يوجد طلب صداقة قيد الانتظار مسبقاً' };
    }

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      });

    if (error) {
      console.error('Error sending friend request:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // إرسال طلب صداقة عبر معرف المستخدم الظاهري (Custom ID / ID)
  static async sendFriendRequestByCustomId(currentUserId: string, targetCustomId: string): Promise<boolean> {
    try {
      const { data: targetUser, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .or(`custom_id.eq.${targetCustomId},id.eq.${targetCustomId}`)
        .maybeSingle();

      if (searchError || !targetUser) {
        console.error('User not found by ID:', searchError);
        return false;
      }

      if (targetUser.id === currentUserId) {
        return false;
      }

      const { data: existing } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${currentUserId})`)
        .maybeSingle();

      if (existing) {
        return false;
      }

      const { error: insertError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: currentUserId,
          receiver_id: targetUser.id,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error inserting friend request:', insertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error in sendFriendRequestByCustomId:', err);
      return false;
    }
  }

  // جلب طلبات الصداقة الواردة المعلقة
  static async getPendingRequests(): Promise<FriendRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');

    if (error || !data) return [];

    const requestsWithSenders: FriendRequest[] = [];
    for (const req of data) {
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.sender_id)
        .single();

      requestsWithSenders.push({
        ...req,
        sender: senderProfile as User
      });
    }

    return requestsWithSenders;
  }

  // قبول أو رفض طلب الصداقة
  static async respondToRequest(requestId: string, accept: boolean): Promise<boolean> {
    const status = accept ? 'accepted' : 'rejected';
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      console.error('Error responding to request:', error);
      return false;
    }
    return true;
  }

  // جلب قائمة الأصدقاء المقبولين للمستخدم الحالي
  static async getFriends(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error || !data) return [];

    const friendIds = data.map(req => req.sender_id === userId ? req.receiver_id : req.sender_id);
    if (friendIds.length === 0) return [];

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', friendIds);

    if (profileError || !profiles) return [];
    return profiles as User[];
  }
}