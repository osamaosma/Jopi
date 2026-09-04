// ============================================================================
// MingleUp Real-Time Client Socket Service (Full Production Version)
// Manages real-time bidirectional communication and Supabase live channels
// ============================================================================

import { io, Socket } from 'socket.io-client';
import { User, Message, VoiceRoom, Gift } from '../types';
import { getBackendUrl } from '../config';
import { supabase } from './supabaseClient';
import { ChatService } from './chatService';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private supabaseChannel: any = null;

  public init(user: User) {
    // 1. Initialize Supabase Realtime Database Listeners
    this.initSupabaseRealtime(user.id);

    if (this.socket && this.isConnected) {
      this.socket.emit('USER_ONLINE', user);
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      // تحقق ذكي: إذا كان الرابط محلياً وغير متاح، نتخطى السيرفر لتجنب الأخطاء الحمراء
      if (!backendUrl || backendUrl.includes('localhost:4000')) {
        console.warn('[SocketService] Local backend is not running. Using Supabase Realtime mode.');
        return;
      }

      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log(`[SocketService] Connected to backend: ${this.socket?.id}`);
        this.socket?.emit('USER_ONLINE', user);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[SocketService] Disconnected from backend');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[SocketService] Connection warning (Safe to ignore if offline):', err.message);
      });
    } catch (e) {
      console.warn('[SocketService] Init error:', e);
    }
  }

  private initSupabaseRealtime(userId: string) {
    if (this.supabaseChannel) {
      supabase.removeChannel(this.supabaseChannel);
    }

    // Listen to real-time database insertions in Supabase for messages and gifts
    this.supabaseChannel = supabase
      .channel('mingleup-realtime-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newRow = payload.new;
          const incomingMessage: Message = {
            id: newRow.id,
            conversation_id: newRow.conversation_id,
            sender_id: newRow.sender_id,
            receiver_id: newRow.receiver_id,
            message_type: newRow.message_type || 'text',
            text: newRow.content,
            media_url: newRow.media_url,
            is_read: false,
            is_delivered: true,
            created_at: newRow.created_at,
          };

          ChatService.receiveIncomingMessage(incomingMessage);
        }
      )
      .subscribe();
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // --- Swiping & Matching ---
  public sendSwipe(senderUser: User, targetUserId: string, isSuperLike = false) {
    try {
      this.socket?.emit('SWIPE_ACTION', { senderUser, targetUserId, isSuperLike });
    } catch (e) {}
  }

  public onMatchAlert(callback: (data: { matchedUser: User; isMutual: boolean }) => void) {
    this.socket?.off('MATCH_ALERT');
    this.socket?.on('MATCH_ALERT', callback);
  }

  // --- Private Chat ---
  public sendMessage(message: Message) {
    try {
      this.socket?.emit('SEND_MESSAGE', message);
    } catch (e) {}
  }

  public onNewMessage(callback: (message: Message) => void) {
    this.socket?.off('NEW_MESSAGE');
    this.socket?.on('NEW_MESSAGE', callback);
  }

  public sendTypingStatus(receiver_id: string, isTyping: boolean) {
    try {
      this.socket?.emit('TYPING_STATUS', { receiver_id, isTyping });
    } catch (e) {}
  }

  public onUserTyping(callback: (data: { isTyping: boolean }) => void) {
    this.socket?.off('USER_TYPING');
    this.socket?.on('USER_TYPING', callback);
  }

  // --- Live Voice & Video Rooms ---
  public joinRoom(roomId: string, user: User) {
    try {
      this.socket?.emit('JOIN_ROOM', { roomId, user });
    } catch (e) {}
  }

  public leaveRoom(roomId: string, user: User) {
    try {
      this.socket?.emit('LEAVE_ROOM', { roomId, user });
    } catch (e) {}
  }

  public takeSeat(roomId: string, seatIndex: number, user: User) {
    try {
      this.socket?.emit('TAKE_SEAT', { roomId, seatIndex, user });
    } catch (e) {}
  }

  public leaveSeat(roomId: string, user: User) {
    try {
      this.socket?.emit('LEAVE_SEAT', { roomId, user });
    } catch (e) {}
  }

  public toggleSeatMute(roomId: string, seatIndex: number) {
    try {
      this.socket?.emit('TOGGLE_SEAT_MUTE', { roomId, seatIndex });
    } catch (e) {}
  }

  public sendRoomMessage(roomId: string, message: any) {
    try {
      this.socket?.emit('SEND_ROOM_MESSAGE', { roomId, message });
    } catch (e) {}
  }

  public sendRoomGift(roomId: string, gift: Gift, sender: User, targetName: string, targetCount = 1) {
    try {
      this.socket?.emit('SEND_ROOM_GIFT', { roomId, gift, sender, targetName, targetCount });
    } catch (e) {}
  }

  public sendDiceRoll(roomId: string, user: User, value: number) {
    try {
      this.socket?.emit('ROLL_DICE_EVENT', { roomId, user, value });
    } catch (e) {}
  }

  public onRoomStateUpdated(callback: (room: VoiceRoom) => void) {
    this.socket?.off('ROOM_STATE_UPDATED');
    this.socket?.on('ROOM_STATE_UPDATED', callback);
  }

  public onRoomMessageBroadcast(callback: (message: any) => void) {
    this.socket?.off('ROOM_MESSAGE_BROADCAST');
    this.socket?.on('ROOM_MESSAGE_BROADCAST', callback);
  }

  public onRoomGiftExplosion(callback: (data: any) => void) {
    this.socket?.off('ROOM_GIFT_EXPLOSION');
    this.socket?.on('ROOM_GIFT_EXPLOSION', callback);
  }

  // --- WebRTC Calls ---
  public initiateCall(targetUserId: string, caller: User, callType: 'voice' | 'video') {
    try {
      this.socket?.emit('CALL_USER', { targetUserId, caller, callType });
    } catch (e) {}
  }

  public acceptCall(callerId: string, receiver: User) {
    try {
      this.socket?.emit('CALL_ACCEPTED', { callerId, receiver });
    } catch (e) {}
  }

  public rejectCall(callerId: string) {
    try {
      this.socket?.emit('CALL_REJECTED', { callerId });
    } catch (e) {}
  }

  public endCall(targetUserId: string) {
    try {
      this.socket?.emit('CALL_ENDED', { targetUserId });
    } catch (e) {}
  }

  public onIncomingCall(callback: (data: { caller: User; callType: 'voice' | 'video' }) => void) {
    this.socket?.off('INCOMING_CALL');
    this.socket?.on('INCOMING_CALL', callback);
  }

  public onCallConnected(callback: (data: { receiver: User }) => void) {
    this.socket?.off('CALL_CONNECTED');
    this.socket?.on('CALL_CONNECTED', callback);
  }

  public onCallTerminated(callback: () => void) {
    this.socket?.off('CALL_TERMINATED');
    this.socket?.on('CALL_TERMINATED', callback);
  }
}

export const socketService = new SocketService();