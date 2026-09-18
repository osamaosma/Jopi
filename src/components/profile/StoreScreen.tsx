import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Coins, Sparkles, Crown, Car, Image as ImageIcon, Flame, Award } from 'lucide-react';

interface StoreScreenProps {
  onBack: () => void;
  showToast: (msg: string, type: any) => void;
  coinBalance: number;
  onOpenTopUp: () => void;
}

export const StoreScreen: React.FC<StoreScreenProps> = ({ onBack, showToast, coinBalance, onOpenTopUp }) => {
  const [topCategory, setTopCategory] = useState<'Frames' | 'Vehicles' | 'Token' | 'Bullet Comments' | 'Unique IDs' | 'Room Backgrounds' | 'Backpack Gifts' | 'Animated Nickname' | 'On-mic Effects'>('Frames');
  const [subTab, setSubTab] = useState<'General' | 'VIP Only' | 'SVIP Only' | 'Fragments Section'>('General');
  const [filterType, setFilterType] = useState<'All' | 'Frames' | 'Vehicles' | 'Token' | 'Backpack Gifts'>('All');

  // بيانات المنتجات والعناصر داخل المتجر مطابقة للفيديو
  const storeItems = [
    { id: '1', title: 'Frames', price: 30000, duration: '5 Day', badge: 'New', image: '👑', category: 'Frames', tab: 'General' },
    { id: '2', title: 'Frames', price: 80000, duration: '5 Day', badge: '', image: '🌟', category: 'Frames', tab: 'General' },
    { id: '3', title: 'Frames', price: 30000, duration: '5 Day', badge: 'Only 30', image: '🔥', category: 'Frames', tab: 'General' },
    { id: '4', title: 'Frames', price: 15000, duration: '5 Day', badge: 'Only 28', image: '💎', category: 'Frames', tab: 'General' },
    { id: '5', title: 'Frames', price: 4500, duration: '3 Day', badge: 'VIP7', image: '💍', category: 'Frames', tab: 'VIP Only' },
    { id: '6', title: 'Vehicles', price: 50000, duration: '7 Day', badge: 'VIP8 New', image: '🏎️', category: 'Vehicles', tab: 'VIP Only' },
    { id: '7', title: 'Frames', price: 30000, duration: '7 Day', badge: 'SVIP7', image: '⚡', category: 'Frames', tab: 'SVIP Only' },
    { id: '8', title: 'Vehicles', price: 720, duration: '1 Day', badge: 'Fragment', image: '✨', category: 'Vehicles', tab: 'Fragments Section' },
  ];

  const filteredItems = storeItems.filter(item => {
    if (subTab !== 'Fragments Section' && item.tab === 'Fragments Section') return false;
    if (subTab === 'VIP Only' && item.tab !== 'VIP Only' && item.tab !== 'General') return false;
    if (subTab === 'SVIP Only' && item.tab !== 'SVIP Only' && item.tab !== 'General') return false;
    return true;
  });

  const handleBuyItem = (item: any) => {
    showToast(`تم شراء ${item.title} بنجاح مقابل ${item.price.toLocaleString()} عملة! 🎉`, 'success');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-28 select-none flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto">
        
        {/* الترويسة العليا */}
        <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black">Store</h1>
          <ShoppingBag className="w-5 h-5 text-amber-400" />
        </div>

        {/* الأقسام الدائرية العليا (Categories Grid / Scroll) */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { name: 'Frames', icon: '👑' },
              { name: 'Vehicles', icon: '🏎️' },
              { name: 'Token', icon: '🪙' },
              { name: 'Bullet Comments', icon: '💬' },
              { name: 'Unique IDs', icon: '🆔' },
              { name: 'Room Backgrounds', icon: '🌆' },
              { name: 'Backpack Gifts', icon: '🎁' },
              { name: 'Animated Nickname', icon: '✨' },
            ].map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => setTopCategory(cat.name as any)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl cursor-pointer transition ${
                  topCategory === cat.name ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-md">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate w-full">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* التبويبات الفرعية (General, VIP Only, SVIP Only, Fragments Section) */}
        <div className="px-4 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-slate-800">
          {(['General', 'VIP Only', 'SVIP Only', 'Fragments Section'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`text-xs font-black transition relative pb-1 whitespace-nowrap cursor-pointer ${
                subTab === tab ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {subTab === tab && <motion.span layoutId="store-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />}
            </button>
          ))}
        </div>

        {/* فلترة الإطارات والعربات */}
        <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['All', 'Frames', 'Vehicles', 'Token', 'Backpack Gifts'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                filterType === filter ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* شبكة المنتجات المعروضة في المتجر */}
        <div className="p-4 grid grid-cols-2 gap-3.5">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between space-y-3 relative group">
              
              {item.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[9px] font-black shadow-md z-10">
                  {item.badge}
                </span>
              )}

              <div className="h-28 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition duration-300">
                {item.image}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-semibold">{item.title}</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 fill-amber-400" /> {item.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{item.duration}</span>
                </div>
              </div>

              <button 
                onClick={() => handleBuyItem(item)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition cursor-pointer"
              >
                Buy
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* الشريط السفلي الثابت (الرصيد وزر الشحن Recharge) */}
      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-3.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-800">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-white">{coinBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-cyan-400">7,224</span>
          </div>
        </div>

        <button 
          onClick={onOpenTopUp}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg cursor-pointer hover:scale-105 transition"
        >
          Recharge
        </button>
      </div>

    </div>
  );
};