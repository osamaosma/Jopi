import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Share2, MoreVertical, Edit3, ChevronRight, 
  Users, Shield, Heart, Image as ImageIcon, MapPin, Briefcase, Calendar, Lock, Star,
  Award, Car, ThumbsUp
} from 'lucide-react';
import { User } from '../../types';

interface InternalProfileViewProps {
  displayUser: User;
  isViewingOtherUser: boolean;
  onBack: () => void;
  onEditProfile: () => void;
  showToast: (msg: string, type: any) => void;
  startCall: (user: User, type: 'voice' | 'video') => void;
  setActiveConversation: (conv: any) => void;
}

export const InternalProfileView: React.FC<InternalProfileViewProps> = ({
  displayUser,
  isViewingOtherUser,
  onBack,
  onEditProfile,
  showToast,
  startCall,
  setActiveConversation
}) => {
  const [profileTab, setProfileTab] = useState<'profile' | 'honor' | 'moments' | 'relationships'>('profile');
  const [showShareModal, setShowShareModal] = useState(false);

  const albumThumbnails = [
    displayUser.profile_photo || '',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-32 select-none flex flex-col relative">
      
      {/* الغلاف العلوي وصورة البروفيسل البارزة */}
      <div className="relative w-full h-80 bg-slate-900">
        <img 
          src={displayUser.profile_photo} 
          alt={displayUser.display_name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-slate-950" />

        {/* أزرار العودة والمشاركة والإعدادات بالاعلى */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowShareModal(true)} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer"><Share2 className="w-4 h-4" /></button>
            <button onClick={onEditProfile} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer"><Edit3 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* شريط الصور المصغرة المتحركة فوق الغلاف */}
        <div className="absolute bottom-3 inset-x-4 flex items-center gap-2 overflow-x-auto z-20 no-scrollbar">
          {albumThumbnails.map((img, i) => (
            <div key={i} className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white/70 shadow-lg">
              <img src={img} alt="album thumb" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* معلومات الاسم والشارات */}
      <div className="px-5 pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black flex items-center gap-1.5">
            <span>{displayUser.display_name}</span>
            <span className="text-xs">🇦🇺 🌹</span>
          </h1>
        </div>

        {/* شارات المستوى والرتب الملونة */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black">♂ 37</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-black">💎 16</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-black">🔥 3</span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[9px] font-black">VIP 5</span>
        </div>
      </div>

      {/* التبويبات الداخلية (Profile, Honor, Moments, Relationships) */}
      <div className="px-5 flex items-center gap-6 border-b border-slate-800 pb-2 mt-4">
        <button onClick={() => setProfileTab('profile')} className={`text-xs font-bold transition relative pb-1 cursor-pointer ${profileTab === 'profile' ? 'text-white' : 'text-slate-400'}`}>
          Profile {profileTab === 'profile' && <motion.span layoutId="inner-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
        </button>
        <button onClick={() => setProfileTab('honor')} className={`text-xs font-bold transition relative pb-1 cursor-pointer ${profileTab === 'honor' ? 'text-white' : 'text-slate-400'}`}>
          Honor {profileTab === 'honor' && <motion.span layoutId="inner-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
        </button>
        <button onClick={() => setProfileTab('moments')} className={`text-xs font-bold transition relative pb-1 cursor-pointer ${profileTab === 'moments' ? 'text-white' : 'text-slate-400'}`}>
          Moments {profileTab === 'moments' && <motion.span layoutId="inner-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
        </button>
        <button onClick={() => setProfileTab('relationships')} className={`text-xs font-bold transition relative pb-1 cursor-pointer ${profileTab === 'relationships' ? 'text-white' : 'text-slate-400'}`}>
          Relationships {profileTab === 'relationships' && <motion.span layoutId="inner-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
        </button>
      </div>

      {/* 1. تبويب PROFILE الداخلي */}
      {profileTab === 'profile' && (
        <div className="px-5 py-4 space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div onClick={() => showToast('My Room opened', 'info')} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500 transition">
              <div className="flex items-center gap-2.5">
                <img src={displayUser.profile_photo} alt="Room" className="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-xs font-black text-white">My room</h4>
                  <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1"><Users className="w-3 h-3" /> 0</span>
                </div>
              </div>
            </div>

            <div onClick={() => showToast('My Family opened', 'info')} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">🛡️</div>
                <div>
                  <h4 className="text-xs font-black text-white">My Family</h4>
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1"><Shield className="w-3 h-3" /> 29</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Private album</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">0 <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-dashed border-slate-700 flex items-center justify-center text-slate-400 cursor-pointer hover:border-brand-500">
              <span className="text-xl">+</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-black text-slate-300">Information</h3>
            <p className="text-xs text-slate-400 leading-relaxed">I'm here for make a friends & have fun ✌️😂🎉</p>

            <div className="space-y-3 pt-2 text-xs font-bold divide-y divide-slate-800/60">
              <div className="flex items-center justify-between pt-2"><span className="text-slate-400 flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> ID</span><span className="font-mono text-slate-200">118497822</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Height</span><span className="text-slate-200">173cm</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Weight</span><span className="text-slate-200">63kg</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Field</span><span className="text-slate-200">IT</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Nationality</span><span className="text-slate-200">Finland</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Current Address</span><span className="text-slate-200">Finland</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Birthday</span><span className="text-slate-200">01/01</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Constellation</span><span className="text-slate-200">Capricorn</span></div>
              <div className="flex items-center justify-between pt-3"><span className="text-slate-400 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Registration Time</span><span className="text-slate-200">2025/04/18</span></div>
            </div>
          </div>

        </div>
      )}

      {/* 2. تبويب HONOR (شارات الشرف، الألقاب، الهدايا، والمركبات والمداليات) */}
      {profileTab === 'honor' && (
        <div className="px-5 py-4 space-y-3">
          <div onClick={() => showToast('Badges Wall details', 'info')} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm cursor-pointer space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-amber-400">
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Badges Wall</span>
              <span className="text-slate-400 flex items-center gap-0.5">27 <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="flex items-center justify-around py-1 text-3xl">👑 🦋 🔮</div>
          </div>

          <div onClick={() => showToast('Titles Wall details', 'info')} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm cursor-pointer space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-purple-400">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Titles Wall</span>
              <span className="text-slate-400 flex items-center gap-0.5">4 <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[9px] font-bold">★ Star Final - TOP3</span>
              <span className="px-2.5 py-1 rounded-xl bg-pink-600 text-white text-[9px] font-bold">Heartbeat Glow 💖</span>
            </div>
          </div>

          <div onClick={() => showToast('Vehicles Wall details', 'info')} className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm cursor-pointer space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-cyan-400">
              <span className="flex items-center gap-1.5"><Car className="w-4 h-4" /> Vehicles Wall (المركبات)</span>
              <span className="text-slate-400 flex items-center gap-0.5">1 <ChevronRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="flex items-center justify-around py-1">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl border border-cyan-500/40">🏎️</div>
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-600 border border-dashed border-slate-700"><Car className="w-5 h-5 opacity-40" /></div>
            </div>
          </div>
        </div>
      )}

      {/* 3. تبويب MOMENTS (اللحظات بشكل صحيح) */}
      {profileTab === 'moments' && (
        <div className="px-5 py-4 space-y-3">
          {[1, 2].map((m) => (
            <div key={m} className="p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={displayUser.profile_photo} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-black text-white">{displayUser.display_name} 🌹</h4>
                    <span className="text-[10px] text-slate-400">05:20 • 2878km</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[8px] font-bold">VIP 4</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                حدث جمع النشرات متاح الآن! ادخل واقبل عليه! ✨🎉
              </div>
              <div className="flex items-center justify-end gap-4 pt-1 text-slate-400 text-xs">
                <button onClick={() => showToast('أعجبك المنشور ❤️', 'info')} className="flex items-center gap-1 hover:text-rose-500 cursor-pointer"><ThumbsUp className="w-4 h-4" /> <span>24</span></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. تبويب RELATIONSHIPS (العلاقات بشكل صحيح) */}
      {profileTab === 'relationships' && (
        <div className="px-5 py-4 space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-950/40 via-rose-950/30 to-purple-950/40 border border-pink-800/40 shadow-md relative overflow-hidden">
            <span className="absolute top-2 start-3 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[8px] font-black">Couple Lv.49</span>
            <div className="flex items-center justify-around pt-4">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-400 p-0.5 shadow-md">
                  <img src={displayUser.profile_photo} alt={displayUser.display_name} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-pink-200 mt-1">{displayUser.display_name}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs shadow-md">19 days 💖</div>
                <span className="w-16 h-0.5 bg-pink-700 mt-2 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المشاركة (Share Profile Modal) */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs select-none">
            <div className="fixed inset-0" onClick={() => setShowShareModal(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="relative z-10 w-full max-w-md bg-slate-900 rounded-t-[32px] p-6 space-y-4">
              <h3 className="text-center font-black text-sm text-white mb-4">Share Profile</h3>
              <div className="grid grid-cols-4 gap-4 text-center text-xs font-bold text-slate-300">
                <div onClick={() => { showToast('Shared to Friends', 'success'); setShowShareModal(false); }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">👥</div>
                  <span>Friends</span>
                </div>
                <div onClick={() => { showToast('Shared to Facebook', 'success'); setShowShareModal(false); }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">f</div>
                  <span>Facebook</span>
                </div>
                <div onClick={() => { showToast('Shared to Twitter', 'success'); setShowShareModal(false); }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">🐦</div>
                  <span>Twitter</span>
                </div>
                <div onClick={() => { showToast('Link Copied!', 'success'); setShowShareModal(false); }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">🔗</div>
                  <span>Copy Link</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};