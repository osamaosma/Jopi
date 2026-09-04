// ============================================================================
// MingleUp Chat & Messaging Service (Production Supabase + Realtime + Auto-Greet)
// ============================================================================

import { Message, Conversation, MessageType, Gift, User } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { UserService } from './userService';
import { socketService } from './socketService';
import { supabase } from './supabaseClient';
import { NotificationService } from './notificationService';

const AUTO_GREETING_BANK: string[] = [
  'مرحباً بك! أعجبني حسابك جداً، هل أنت متفرغ للحديث قليلاً؟ ✨',
  'يا هلا! نورت التطبيق، كيف تقضي يومك؟ ☕🌹',
  'مرحبا! لاحظت اهتماماتك المشتركة معي وحبيت أسلّم عليك 😊',
  'مساء الورد! صوتك أو ملفك لفت انتباهي، من أي مدينة أنت؟ 🌟',
  'أهلاً وسهلاً! يسعدني التعرف على شخص راقٍ مثلك 💫',
];

const MOCK_REPLY_BANK: Record<string, string[]> = {
  default: [
    'سعدت جداً بسماع رأيك! ما هي خططك لباقي اليوم؟ ✨',
    'كلامك جميل وملهم جداً! أتفق معك تماماً ☕',
    'يا هلا! يعطيك العافية، شو أحسن مكان زرته مؤخراً؟ ✈️',
    'أحببت طاقتك الإيجابية، تسلم كلك ذوق! 😊',
  ],
  gift: [
    'وااو شكراً جزيلاً على الهدية الرائعة! ذوقك رفيع جداً كالعادة 💖🎁',
    'أحلى هدية وصلتني اليوم! تسلم إيدك يا ذوق 🥰✨',
  ],
  voice: [
    'صوتك جداً لطيف ومريح! استمتعت بسماع رسالتك 🎙️🎧',
  ]
};

export class ChatService {
  static getConversations(): Conversation[] {
    StorageService.initializeDefaults();
    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const blockedList = StorageService.get<{ blocked_id: string }[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const blockedIds = new Set(blockedList.map(b => b.blocked_id));

    return conversations.filter(c => !blockedIds.has(c.partner?.id));
  }

  static getMessages(conversationId: string): Message[] {
    StorageService.initializeDefaults();
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return messages.filter(m => m.conversation_id === conversationId);
  }

  static async sendMessage(params: {
    conversationId: string;
    receiverId: string;
    messageType?: MessageType;
    text?: string;
    mediaUrl?: string;
    mediaDuration?: number;
    giftData?: Gift;
  }): Promise<Message> {
    const currentUser = UserService.getCurrentUser();
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: params.conversationId,
      sender_id: currentUser?.id || 'guest',
      receiver_id: params.receiverId,
      message_type: params.messageType || 'text',
      text: params.text,
      media_url: params.mediaUrl,
      media_duration: params.mediaDuration,
      gift_id: params.giftData?.id,
      gift_data: params.giftData,
      is_read: true,
      is_delivered: true,
      created_at: new Date().toISOString(),
    };

    messages.push(newMessage);
    StorageService.set(STORAGE_KEYS.MESSAGES, messages);

    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const convIndex = conversations.findIndex(c => c.id === params.conversationId);
    if (convIndex >= 0) {
      conversations[convIndex].last_message = newMessage;
      conversations[convIndex].updated_at = new Date().toISOString();
      StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }

    if (!currentUser || !currentUser.id || currentUser.id.startsWith('user-') || currentUser.id.includes('current-user')) {
      socketService.sendMessage(newMessage);
      return newMessage;
    }

    const { error } = await supabase.from('messages').insert({
      id: newMessage.id,
      sender_id: currentUser.id,
      receiver_id: params.receiverId,
      text: params.text || (params.giftData ? `Sent gift: ${params.giftData.name}` : ''),
      media_url: params.mediaUrl || null,
      message_type: params.messageType || 'text',
      conversation_id: params.conversationId
    });

    if (error) {
      console.error('Error syncing message to Supabase:', error);
    }

    socketService.sendMessage(newMessage);

    return newMessage;
  }

  static receiveIncomingMessage(msg: Message): void {
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    if (!messages.some(m => m.id === msg.id)) {
      messages.push(msg);
      StorageService.set(STORAGE_KEYS.MESSAGES, messages);

      const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
      const conv = conversations.find(c => c.id === msg.conversation_id || c.partner?.id === msg.sender_id);
      
      if (conv) {
        conv.last_message = msg;
        conv.unread_count = (conv.unread_count || 0) + 1;
        conv.updated_at = new Date().toISOString();
      } else {
        const senderUser = UserService.getUserById(msg.sender_id);
        if (senderUser) {
          conversations.unshift({
            id: msg.conversation_id || `conv-${msg.sender_id}`,
            partner: senderUser,
            last_message: msg,
            unread_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
      StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }

  static markAsRead(conversationId: string): void {
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) return;
    let hasChanges = false;

    messages.forEach(m => {
      if (m.conversation_id === conversationId && m.receiver_id === currentUser.id && !m.is_read) {
        m.is_read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      StorageService.set(STORAGE_KEYS.MESSAGES, messages);
    }

    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.unread_count = 0;
      StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }

  static subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
    return supabase
      .channel(`public:messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();
  }

  static startAutoGreetingScheduler(onNewMessageReceived?: (msg: Message) => void): () => void {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser || !currentUser.id || currentUser.id.startsWith('user-')) return () => {};

    const initialTimer = setTimeout(() => {
      this.sendRandomAutoGreeting(onNewMessageReceived);
    }, 6000);

    const intervalTimer = setInterval(() => {
      this.sendRandomAutoGreeting(onNewMessageReceived);
    }, 90000 + Math.random() * 60000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(intervalTimer);
    };
  }

  private static async sendRandomAutoGreeting(callback?: (msg: Message) => void): Promise<void> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser || !currentUser.id || currentUser.id.startsWith('user-')) return;

    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

    if (otherUsers.length === 0) return;

    const randomSender = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const text = AUTO_GREETING_BANK[Math.floor(Math.random() * AUTO_GREETING_BANK.length)];
    const conversationId = `conv-${randomSender.id}`;

    const autoMsg: Message = {
      id: `msg-auto-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: randomSender.id,
      receiver_id: currentUser.id,
      message_type: 'text',
      text,
      is_read: false,
      is_delivered: true,
      created_at: new Date().toISOString(),
    };

    this.receiveIncomingMessage(autoMsg);

    await supabase.from('messages').insert({
      id: autoMsg.id,
      sender_id: randomSender.id,
      receiver_id: currentUser.id,
      text: text,
      message_type: 'text',
      conversation_id: conversationId
    });

    NotificationService.addNotification({
      user_id: currentUser.id,
      type: 'new_message',
      title: `${randomSender.display_name} أرسل رسالة 💬`,
      title_ar: `${randomSender.display_name} أرسل رسالة 💬`,
      body: text,
      body_ar: text,
      avatar_url: randomSender.profile_photo,
      reference_id: randomSender.id,
    });

    if (callback) {
      callback(autoMsg);
    }
  }

  static triggerSimulatedReply(
    conversationId: string, 
    partnerId: string, 
    triggerType: 'default' | 'gift' | 'voice' = 'default',
    onReplyReady?: (reply: Message) => void
  ): void {
    const partner = UserService.getUserById(partnerId);
    if (!partner) return;

    const delay = 1400 + Math.random() * 1200;

    setTimeout(async () => {
      const bank = MOCK_REPLY_BANK[triggerType] || MOCK_REPLY_BANK.default;
      const text = bank[Math.floor(Math.random() * bank.length)];

      const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
      const currentUser = UserService.getCurrentUser();
      if (!currentUser) return;

      const replyMessage: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: partnerId,
        receiver_id: currentUser.id,
        message_type: 'text',
        text,
        is_read: false,
        is_delivered: true,
        created_at: new Date().toISOString(),
      };

      messages.push(replyMessage);
      StorageService.set(STORAGE_KEYS.MESSAGES, messages);

      const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.last_message = replyMessage;
        conv.unread_count = (conv.unread_count || 0) + 1;
        conv.updated_at = new Date().toISOString();
        StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
      }

      if (!currentUser.id || currentUser.id.startsWith('user-')) {
        if (onReplyReady) {
          onReplyReady(replyMessage);
        }
        return;
      }

      await supabase.from('messages').insert({
        id: replyMessage.id,
        sender_id: partnerId,
        receiver_id: currentUser.id,
        text: text,
        message_type: 'text',
        conversation_id: conversationId
      });

      if (onReplyReady) {
        onReplyReady(replyMessage);
      }
    }, delay);
  }
}