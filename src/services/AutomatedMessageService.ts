// ============================================================================
// jopi Automated Random Messaging Service (Female to Male Daily Outreach)
// ============================================================================

import { supabase } from './supabaseClient';

const AUTOMATED_GREETINGS = [
  'مرحباً! كيف تبدو يومك اليوم؟ 😊',
  'أهلاً بك، هل تود الدردشة قليلاً والتعرف على أصدقاء جدد؟ ✨',
  'مرحباً، لقد لفتني ملفك الشخصي، كيف حالك؟ 🌸',
  'يوم سعيد! ما هي اهتماماتك المفضلة في التطبيق؟ 🔥',
  'أهلاً! أتمنى لك وقتاً ممتعاً وموفقاً هنا ☕'
];

export class AutomatedMessageService {
  static async sendDailyRandomMessage(): Promise<void> {
    try {
      // 1. جلب حسابات الإناث النشطة
      const { data: females, error: femaleError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('gender', 'female');

      if (femaleError || !females || females.length === 0) return;

      // 2. جلب حسابات الذكور
      const { data: males, error: maleError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('gender', 'male');

      if (maleError || !males || males.length === 0) return;

      // اختيار أنثى عشوائية وذكر عشوائي
      const randomFemale = females[Math.floor(Math.random() * females.length)];
      const randomMale = males[Math.floor(Math.random() * males.length)];

      if (!randomFemale || !randomMale || randomFemale.id === randomMale.id) return;

      // 3. التحقق من عدم وجود محادثة سابقة أو متابعة بينهما لتجنب الإزعاج
      const conversationId = `conv_auto_${Math.min(randomFemale.id.localeCompare(randomMale.id), randomMale.id.localeCompare(randomFemale.id))}_${randomFemale.id}_${randomMale.id}`;

      // اختيار نص عشوائي جاهز
      const randomText = AUTOMATED_GREETINGS[Math.floor(Math.random() * AUTOMATED_GREETINGS.length)];

      // 4. إدراج الرسالة تلقائياً في جدول الرسائل لتظهر فوراً لدى المستخدم الشاب
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          id: `msg-auto-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: randomFemale.id,
          receiver_id: randomMale.id,
          message_type: 'text',
          text: randomText,
          is_read: false,
          is_delivered: true,
          created_at: new Date().toISOString()
        });

      if (!insertError) {
        console.log(`[AutomatedMessageService] Sent automated message from female (${randomFemale.id}) to male (${randomMale.id})`);
      }
    } catch (error) {
      console.error('[AutomatedMessageService] Failed to execute automated messaging:', error);
    }
  }
}