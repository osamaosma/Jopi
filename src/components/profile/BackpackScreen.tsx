import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Backpack, ShoppingBag } from 'lucide-react';

interface BackpackScreenProps {
  onBack: () => void;
  onOpenStore?: () => void;
}

export const BackpackScreen: React.FC<BackpackScreenProps> = ({ onBack, onOpenStore }) => {
  const [backpackTab, setBackpackTab] = useState<string>('Gifts');

  // أقسام الحقيبة تماماً كما ظهرت في الفيديو
  const tabs = [
    'Gifts', 
    'Frames', 
    'Vehicles', 
    'Entry effects', 
    'Animated Nickname', 
    'Props Cards', 
    'Room Bubble', 
    'Chat Bubble', 
    'Profile Cards', 
    'Mic Animations'
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-24 select-none flex flex-col">
      
      {/* الشريط العلوي */}
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="text-sm font-black">Backpack</h1>
        <button onClick={onOpenStore} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 cursor-pointer hover:bg-slate-700 transition">
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {/* شريط التبويبات الأفقي القابل للتمرير */}
      <div className="px-4 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-slate-800/80 bg-slate-900/40">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setBackpackTab(tab)}
            className={`text-xs font-black transition relative pb-1 whitespace-nowrap cursor-pointer ${
              backpackTab === tab ? 'text-purple-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
            {backpackTab === tab && (
              <motion.span layoutId="backpack-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* محتوى الحقيبة (فارغ أو يحتوي على العناصر التابعة للتبويب) */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 my-auto">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
          <Backpack className="w-10 h-10 text-purple-500/60" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-300">Backpack is empty</h3>
          <p className="text-[11px] text-slate-500">عناصر قسم {backpackTab} غير موجودة حالياً في حقيبتك.</p>
        </div>
      </div>

    </div>
  );
};