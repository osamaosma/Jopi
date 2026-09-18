import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Send, Bot, User, Sparkles, Headphones } from 'lucide-react';

interface CustomerServiceScreenProps {
  onBack: () => void;
  showToast: (msg: string, type: any) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const CustomerServiceScreen: React.FC<CustomerServiceScreenProps> = ({ onBack, showToast }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'أهلاً بك في دعم Jopi الذكي! 🤖✨ أنا هنا لمساعدتك بلغتكم المفضلة والإجابة على أي استفسار يخص التطبيق (الشحن، الغرف الصوتية، شارات الـ VIP، أو العائلات). تفضل باطرح سؤالك!\n\nWelcome to Jopi AI Support! 🌍 I am here to help you in your preferred language.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // تم تصحيح تعريف المرجع هنا بإضافة const
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // دالة ذكية متعددة اللغات للرد على أسئلة تطبيق Jopi فقط
  const getMultiLingualJopiResponse = (query: string): string => {
    const q = query.toLowerCase();
    const isEnglish = /^[a-zA-Z0-9\s,?.!'-]+$/.test(query);

    if (q.includes('recharge') || q.includes('coins') || q.includes('شحن') || q.includes('عملات') || q.includes('top up')) {
      return isEnglish 
        ? '💎 To top up coins in Jopi: Go to your "Profile" page, click on "Top Up Coins" next to your wallet balance, and choose your preferred package.'
        : '💎 لشحن العملات في تطبيق Jopi: يمكنك الانتقال إلى صفحة "الملف الشخصي" ثم النقر على زر (Top Up Coins) بجانب رصيد المحفظة، واختيار الباقة المناسبة لك.';
    }
    
    if (q.includes('withdraw') || q.includes('diamonds') || q.includes('سحب') || q.includes('الماسات') || q.includes('أرباح')) {
      return isEnglish
        ? '💰 To withdraw diamonds and earnings: Go to your wallet and click on "Withdrawal". Ensure you meet the minimum required balance.'
        : '💰 لسحب الأرباح والماسات: توجه إلى محفظتك الشخصية، واضغط على خيار السحب أو التصريف (Withdrawal)، وتأكد من توفر الحد الأدنى المطلوب.';
    }

    if (q.includes('vip') || q.includes('svip') || q.includes('feature') || q.includes('مميزات')) {
      return isEnglish
        ? '👑 For VIP / SVIP privileges: Tap the VIP/SVIP card in your profile to explore all 16 levels, exclusive frames, and special entry effects.'
        : '👑 للحصول على مزايا VIP / SVIP: يمكنك النقر على بطاقة VIP/SVIP في ملفك الشخصي لاستعراض المستويات الـ 16 وفتح الإطارات والتميز الخاص.';
    }

    if (q.includes('family') || q.includes('عائلة') || q.includes('group')) {
      return isEnglish
        ? '🛡️ Families Square: Explore this section to create your own family or join active groups to boost your daily and weekly interactions.'
        : '🛡️ ساحة العائلات (Families Square): يمكنك من خلاله إنشاء عائلتك الخاصة أو الانضمام لعائلات أخرى لزيادة نقاط التفاعل وكسب المكافآت.';
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('مرحبا') || q.includes('السلام')) {
      return isEnglish
        ? 'Hello! How can I assist you with Jopi app today? 😊'
        : 'مرحباً بك! كيف يمكنني مساعدتك اليوم في استخدام تطبيق Jopi؟ 😊';
    }

    return isEnglish
      ? 'I am specialized only in answering questions related to Jopi app services (recharge, rooms, families, and levels). Please ask about the app or contact human support.'
      : 'عذراً، أنا مخصص فقط للإجابة على الأسئلة المتعلقة بخدمات تطبيق Jopi (الشحن، الغرف، العائلات، والمستويات). يرجى طرح سؤال يخص التطبيق.';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = getMultiLingualJopiResponse(userText);
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white select-none flex flex-col justify-between">
      
      {/* الشريط العلوي */}
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800 z-20">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-cyan-400" />
          <h1 className="text-sm font-black">Jopi Global AI Support</h1>
        </div>
        <div className="w-9" />
      </div>

      {/* صندوق المحادثة والرسائل */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              msg.sender === 'ai' ? 'bg-gradient-to-tr from-cyan-500 to-teal-500 text-slate-950 shadow-md' : 'bg-brand-600 text-white'
            }`}>
              {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-brand-200' : 'text-slate-500'}`}>
                {msg.time}
              </span>
            </div>

          </div>
        ))}

        {/* مؤشر الكتابة */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> AI is generating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* حقل إدخال الرسالة السفلي */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question in any language..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button 
            type="submit"
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 flex items-center justify-center shadow-md cursor-pointer transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};