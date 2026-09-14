// ============================================================================
// jopi Chat & Messaging Service (Production Supabase + Realtime Instant Sync)
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
  // جلب المحادثات مع التحقق من عدم حظر الشريك وضبط حالة الاتصال بدقة
  static getConversations(): Conversation[] {
    StorageService.initializeDefaults();
    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const blockedList = StorageService.get<{ blocked_id: string }[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const blockedIds = new Set(blockedList.map(b => b.blocked_id));

    return conversations
      .filter(c => c && c.partner && !blockedIds.has(c.partner.id))
      .map(c => {
        const liveUser = UserService.getUserById(c.partner.id);
        return {
          ...c,
          partner: {
            ...c.partner,
            is_online: liveUser?.is_online ?? false // عدم إظهار المستخدمين كمتصلين دائمًا
          }
        };
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  // جلب رسائل المحادثة ودمجها مع Supabase وفرزها زمنياً بدقة
  static async getMessages(conversationId: string): Promise<Message[]> {
    StorageService.initializeDefaults();
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const localMessages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
        const mergedMap = new Map<string, Message>();
        
        localMessages.forEach(m => mergedMap.set(m.id, m));
        data.forEach((m: any) => {
          mergedMap.set(m.id, {
            id: m.id,
            conversation_id: m.conversation_id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            message_type: m.message_type || 'text',
            text: m.text || m.content,
            media_url: m.media_url,
            media_duration: m.media_duration,
            is_read: m.is_read ?? false,
            is_delivered: m.is_delivered ?? true,
            created_at: m.created_at,
          });
        });
        
        const mergedMessages = Array.from(mergedMap.values());
        StorageService.set(STORAGE_KEYS.MESSAGES, mergedMessages);

        // فرز زمني تصاعدي حتى تظهر الرسائل الجديدة في الأسفل والقديمة في الأعلى
        return mergedMessages
          .filter(m => m.conversation_id === conversationId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    } catch (e) {
      console.error('[ChatService] Error fetching messages:', e);
    }

    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    return messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // إرسال رسالة: تبدأ كـ غير مقروءة (is_read: false) وحفظ المحادثة سحابياً ومحلياً
  static async sendMessage(params: {
    conversationId: string;
    receiverId: string;
    messageType?: MessageType;
    text?: string;
    mediaUrl?: string;
    mediaDuration?: number;
    giftData?: Gift;
    partnerProfile?: User;
  }): Promise<Message> {
    const currentUser = UserService.getCurrentUser();
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: params.conversationId,
      sender_id: currentUser?.id || 'guest',
      receiver_id: params.receiverId,
      message_type: params.messageType || 'text',
      text: params.text,
      media_url: params.mediaUrl,
      media_duration: params.mediaDuration,
      gift_id: params.giftData?.id,
      gift_data: params.giftData,
      is_read: false, // لا تصبح مقروءة حتى يفتحها المستلم
      is_delivered: true,
      created_at: new Date().toISOString(),
    };

    // 1. حفظ الرسالة محلياً
    messages.push(newMessage);
    StorageService.set(STORAGE_KEYS.MESSAGES, messages);

    // 2. ضمان بقاء المحادثة في القائمة وعدم اختفائها أبداً عند الخروج
    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    let convIndex = conversations.findIndex(c => c.id === params.conversationId || c.partner?.id === params.receiverId);
    
    let partnerUser = params.partnerProfile || UserService.getUserById(params.receiverId);
    if (!partnerUser && convIndex >= 0) {
      partnerUser = conversations[convIndex].partner;
    }

    if (convIndex >= 0) {
      conversations[convIndex].last_message = newMessage;
      conversations[convIndex].updated_at = new Date().toISOString();
      if (partnerUser) {
        conversations[convIndex].partner = {
          ...conversations[convIndex].partner,
          ...partnerUser,
          is_online: partnerUser.is_online ?? false
        };
      }
    } else {
      const fallbackPartner: User = partnerUser || {
        id: params.receiverId,
        display_name: 'مستخدم',
        username: 'user',
        profile_photo: '',
        is_online: false,
        coin_balance: 0,
        interests: []
      };

      conversations.unshift({
        id: params.conversationId,
        partner: fallbackPartner,
        last_message: newMessage,
        unread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);

    // 3. إرسال إلى Supabase
    try {
      await supabase.from('messages').insert({
        id: newMessage.id,
        sender_id: currentUser?.id || 'guest',
        receiver_id: params.receiverId,
        text: params.text || (params.giftData ? `Sent gift: ${params.giftData.name}` : ''),
        media_url: params.mediaUrl || null,
        media_duration: params.mediaDuration || null,
        message_type: params.messageType || 'text',
        conversation_id: params.conversationId,
        created_at: newMessage.created_at,
        is_read: false,
        is_delivered: true
      });
    } catch (err) {
      console.error('[ChatService] Insert error in Supabase:', err);
    }

    socketService.sendMessage(newMessage);
    return newMessage;
  }

  // استقبال رسالة جديدة وحفظها في المحادثات وتحديث العدادات
  static receiveIncomingMessage(msg: Message, senderUser?: User): void {
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    
    const existingMsgIndex = messages.findIndex(m => m.id === msg.id);
    if (existingMsgIndex >= 0) {
      messages[existingMsgIndex] = { ...messages[existingMsgIndex], ...msg };
      StorageService.set(STORAGE_KEYS.MESSAGES, messages);
      return;
    }

    messages.push(msg);
    StorageService.set(STORAGE_KEYS.MESSAGES, messages);

    // تحديث المحادثة في القائمة الرئيسية لضمان بقائها
    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    let conv = conversations.find(c => c.id === msg.conversation_id || c.partner?.id === msg.sender_id);
    
    const partner = senderUser || UserService.getUserById(msg.sender_id) || (conv ? conv.partner : null);

    if (conv) {
      conv.last_message = msg;
      if (!msg.is_read) {
        conv.unread_count = (conv.unread_count || 0) + 1;
      }
      conv.updated_at = new Date().toISOString();
      if (partner) {
        conv.partner = { ...conv.partner, ...partner, is_online: partner.is_online ?? false };
      }
    } else {
      const newPartner: User = partner || {
        id: msg.sender_id,
        display_name: 'مستخدم',
        username: 'user',
        profile_photo: '',
        is_online: false,
        coin_balance: 0,
        interests: []
      };

      conversations.unshift({
        id: msg.conversation_id || `conv_${msg.sender_id}`,
        partner: newPartner,
        last_message: msg,
        unread_count: msg.is_read ? 0 : 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
  }

  // تحديث حالة القراءة: يرسل UPDATE إلى Supabase ليعرف الطرف الآخر فوراً وتزرق علامة الصح عنده
static async markAsRead(conversationId: string, partnerId?: string): Promise<void> {
    const currentUser = UserService.getCurrentUser();
    if (!currentUser) return;

    // 1. تحديث الحالة في الذاكرة المحلية
    const messages = StorageService.get<Message[]>(STORAGE_KEYS.MESSAGES, []);
    let hasChanges = false;

    messages.forEach(m => {
      const isFromPartner = partnerId ? m.sender_id === partnerId : true;
      const isMatch = (m.conversation_id === conversationId || isFromPartner) && m.receiver_id === currentUser.id;
      if (isMatch && !m.is_read) {
        m.is_read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      StorageService.set(STORAGE_KEYS.MESSAGES, messages);
    }

    // 2. تصفير العداد للمحادثة
    const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = conversations.find(c => c.id === conversationId || (partnerId && c.partner?.id === partnerId));
    if (conv) {
      conv.unread_count = 0;
      StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
    }

    // 3. التحديث المباشر في Supabase ليتحول الصح إلى أزرق عند المرسل فوراً
    try {
      let query = supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      if (partnerId) {
        query = query.eq('sender_id', partnerId);
      } else {
        query = query.eq('conversation_id', conversationId);
      }

      await query;
    } catch (e) {
      console.error('[ChatService] Error marking as read in Supabase:', e);
    }
  }

  // الاستماع المباشر للتحديثات (خاصة تحديث القراءة UPDATE لتحويل الصح للأزرق فوراً)
  static subscribeToMessages(conversationId: string, onMessageUpdate: (msg: Message) => void) {
    const channelName = `realtime-chat-sync-${conversationId}`;
    
    return supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // استماع للـ INSERT و الـ UPDATE
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as any;
          if (raw && raw.conversation_id === conversationId) {
            const updatedMsg: Message = {
              id: raw.id,
              conversation_id: raw.conversation_id,
              sender_id: raw.sender_id,
              receiver_id: raw.receiver_id,
              message_type: raw.message_type || 'text',
              text: raw.text || raw.content,
              media_url: raw.media_url,
              media_duration: raw.media_duration,
              is_read: raw.is_read ?? false,
              is_delivered: raw.is_delivered ?? true,
              created_at: raw.created_at,
            };

            this.receiveIncomingMessage(updatedMsg);
            onMessageUpdate(updatedMsg);
          }
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
      clearInterval(intervalTimer);
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
    const conversationId = `conv_${randomSender.id}`;

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

    this.receiveIncomingMessage(autoMsg, randomSender);

    await supabase.from('messages').insert({
      id: autoMsg.id,
      sender_id: randomSender.id,
      receiver_id: currentUser.id,
      text: text,
      message_type: 'text',
      conversation_id: conversationId,
      is_read: false
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

      this.receiveIncomingMessage(replyMessage, partner);

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
        conversation_id: conversationId,
        is_read: false
      });

      if (onReplyReady) {
        onReplyReady(replyMessage);
      }
    }, delay);
  }
}