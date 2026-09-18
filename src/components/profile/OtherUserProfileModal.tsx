// ============================================================================
// jopi Other User Profile Detail Modal (Exact SUGO Cinema Cover & Honor Walls)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Phone, MessageCircle, Heart, Share2, MoreVertical, 
  Volume2, Users, ImageIcon, Award, Sparkles, Crown, Car, ThumbsUp, 
  UserPlus, ChevronRight, Lock, X
} from 'lucide-react';
import { User } from '../../types';
import { useApp } from '../../context/AppContext';

export const OtherUserProfileModal: React.FC = () => {
  const { 
    viewingUser, 
    setViewingUser, 
    setActiveConversation, 
    startCall, 
    showToast 
  } = useApp();

  const [profileTab, setProfileTab] = useState<'profile' | 'honor' | 'moments' | 'relationships'>('profile');
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProposalType, setSelectedProposalType] = useState<'couple' | 'friendship'>('couple');

  if (!viewingUser) return null;

  const albumPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  ];

  const handleClose = () => setViewingUser(null);

  const handleStartChat = () => {
    setActiveConversation({
      id: `conv_${viewingUser.id}`,
      partner: viewingUser,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between select-none overflow-hidden max-w-md mx-auto">
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* 1. الغلاف السينمائي الكبير المطابق للفيديو */}
          <div className="relative w-full h-80 bg-slate-900">
            <img 
              src={viewingUser.profile_photo} 
              alt={viewingUser.display_name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-slate-950" />

            {/* عناصر التحكم العلوية */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
              <button 
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* الأيقونات العائمة: التسجيل الصوتي والغرفة الصوتية */}
            <div className="absolute bottom-16 inset-x-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>7s</span>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>In voice chat</span>
                </div>
              </div>
            </div>

            {/* صور الألبوم المصغرة أسفل الغلاف */}
            <div className="absolute bottom-3 inset-x-4 flex items-center gap-2 overflow-x-auto z-20">
              {albumPhotos.map((img, i) => (
                <div key={i} className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/60 shadow-md">
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="px-4">
            {/* بطاقة الحساب والرتب والشارة الدائرية */}
            <div className="relative rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl mb-4 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{viewingUser.display_name}</span>
                    <span>🌹</span>
                  </h2>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                    <span>Online</span>
                    <span>•</span>
                    <span>9077km</span>
                  </div>
                </div>

                {/* شارة الخاتم الوردية */}
                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💍</span>
                </div>
              </div>

              {/* شارات الرتب */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black shadow-xs">
                  ♂ 37
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-black shadow-xs">
                  💎 20
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black shadow-xs">
                  🔥 4
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[9px] font-black shadow-xs">
                  VIP {viewingUser.vip_level || 5}
                </span>
              </div>
            </div>

            {/* التبويبات الأربعة */}
            <div className="flex items-center justify-around border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              {(['profile', 'honor', 'moments', 'relationships'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                  className={`text-xs font-bold transition relative pb-1 capitalize cursor-pointer ${
                    profileTab === tab ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  {tab === 'moments' ? 'Moment 16' : tab}
                  {profileTab === tab && (
                    <motion.span layoutId="modal-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* محتويات التبويبات نظيفة وبدون أي كروت محفظة أو ألعاب */}
            {profileTab === 'profile' && (
              <div className="space-y-4 mb-4">
                <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-100 via-pink-50 to-indigo-100 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={viewingUser.profile_photo} alt="Room" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                    <div>
                      <h4 className="text-xs font-black text-purple-950 dark:text-purple-200">Her Room</h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" /> 0
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-brand-500" />
                      <span>Private album</span>
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <span>5</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {albumPhotos.map((img, i) => (
                      <div key={i} className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <img src={img} alt="album" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'honor' && (
              <div className="space-y-3 mb-4">
                <div className="p-3.5 rounded-3xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 border border-amber-300/60 dark:border-amber-700/40">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200 block mb-2">Badges Wall</span>
                  <div className="flex items-center justify-around py-1 text-4xl filter drop-shadow">
                    <span>👑</span>
                    <span>🦋</span>
                    <span>🔮</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-200 via-pink-100 to-indigo-100 dark:from-purple-950/50 dark:via-pink-950/30 dark:to-slate-900 border border-purple-300/60 dark:border-purple-700/40">
                  <span className="text-xs font-black text-purple-950 dark:text-purple-200 block mb-2">Titles Wall</span>
                  <div className="flex items-center justify-between gap-1.5 py-1 overflow-x-auto">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500 text-white text-[9px] font-black">★ Star Final - TOP3</span>
                    <span className="px-2.5 py-1 rounded-xl bg-pink-500 text-white text-[9px] font-black">Heartbeat Glow 💖</span>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500 text-white text-[9px] font-black">Floral Artist 🌸</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'moments' && (
              <div className="space-y-3 mb-4">
                {[1, 2].map((m) => (
                  <div key={m} className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={viewingUser.profile_photo} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{viewingUser.display_name}</h4>
                          <span className="text-[10px] text-slate-400">05:20 • 9077km</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[8px] font-bold">VIP 5</span>
                    </div>
                    <p className="p-3 rounded-2xl bg-purple-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200">
                      حدث جمع النشرات متاح الآن! ادخل واقبل عليه! ✨🎉
                    </p>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'relationships' && (
              <div className="space-y-4 mb-4">
                <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-100 via-rose-50 to-purple-100 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-purple-950/40 border border-pink-300/80 dark:border-pink-800/40 relative overflow-hidden">
                  <span className="absolute top-2 start-3 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[8px] font-black">
                    Couple Lv.49
                  </span>
                  <div className="flex items-center justify-around pt-4">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400 p-0.5">
                        <img src={viewingUser.profile_photo} alt={viewingUser.display_name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="text-[10px] font-bold mt-1">{viewingUser.display_name}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs">
                        19 days 💖
                      </div>
                    </div>

                    <div 
                      onClick={() => setShowProposalModal(true)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-slate-800/80 border-2 border-dashed border-pink-400 flex items-center justify-center text-pink-500 group-hover:scale-105 transition">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-pink-600 mt-1">Invite</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الشريط السفلي الثابت (Say hi، اتصال، ورسالة) */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 z-40 max-w-md mx-auto">
          <button 
            onClick={() => startCall(viewingUser, 'voice')}
            className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Phone className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleStartChat}
            className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button 
            onClick={handleStartChat}
            className="flex-1 h-12 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Say hi</span>
          </button>
        </div>

        {/* نافذة تحديد نوع العلاقة والسعر عند الضغط على Invite */}
        <AnimatePresence>
          {showProposalModal && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
              <div className="fixed inset-0" onClick={() => setShowProposalModal(false)} />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] p-6 space-y-4 shadow-2xl"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                <div className="text-center">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">طلب علاقة جديدة ✨</h3>
                  <p className="text-xs text-slate-400 mt-1">اختر نوع العلاقة مع {viewingUser.display_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div
                    onClick={() => setSelectedProposalType('couple')}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                      selectedProposalType === 'couple'
                        ? 'border-pink-500 bg-pink-500/10 shadow-md'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-4xl">💖</span>
                    <div className="text-center">
                      <h4 className="text-xs font-black text-pink-600 dark:text-pink-400">علاقة حب (Couple)</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">5,000 عملة 🪙</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedProposalType('friendship')}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
                      selectedProposalType === 'friendship'
                        ? 'border-purple-500 bg-purple-500/10 shadow-md'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="text-4xl">🌸</span>
                    <div className="text-center">
                      <h4 className="text-xs font-black text-purple-600 dark:text-purple-400">صداقة مقربة (Friend)</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">2,000 عملة 🪙</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    showToast(`تم إرسال طلب ${selectedProposalType === 'couple' ? 'الارتباط 💖' : 'الصداقة 🌸'} إلى ${viewingUser.display_name} بنجاح!`, 'success');
                    setShowProposalModal(false);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow-lg cursor-pointer"
                >
                  تأكيد وإرسال الدعوة ({selectedProposalType === 'couple' ? '5,000' : '2,000'} عملة)
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
};