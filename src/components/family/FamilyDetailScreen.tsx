// ============================================================================
// jopi Family Detail & Group Chat Screen (Fully Integrated with SUGO Exact Features)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Crown, Users, Award, MessageSquare, Gift, Flame, CheckCircle, Sparkles, X, Settings, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const FamilyDetailScreen: React.FC = () => {
  const { setActiveTab } = useApp();
  const { user: currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tasks' | 'moments' | 'members'>('chat');
  
  // حالة نافذة تأكيد تعيين نائب القائد
  const [confirmDeputyModal, setConfirmDeputyModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const familyInfo = {
    name: '.,•UCHiHA•,.',
    id: '9123931',
    level: 1,
    activeValue: 1832,
    maxActiveValue: 18000,
    membersCount: 29,
    maxMembers: 50,
    femalePercentage: 6,
    dailyRank: '50+',
    weeklyRank: '50+',
    members: [
      { id: '1', display_name: 'PiTaChiO,,', role: 'leader', age: 29, profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' },
      { id: '2', display_name: 'Abdallahe Hazem', role: 'member', age: 18, profile_photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
      { id: '3', display_name: 'Abdollmotlid Ouchaou', role: 'member', age: 18, profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { id: '4', display_name: 'نشمى المواسي', role: 'member', age: 18, profile_photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100' },
    ]
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 select-none flex flex-col justify-between relative">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-20">
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black">{familyInfo.name}</h1>
          <span className="text-[10px] text-emerald-400 font-semibold">● 0 people online</span>
        </div>
        <button 
          onClick={() => setActiveSubTab('members')}
          className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-xs border border-amber-400/40"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content View based on Tabs */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        
        {activeSubTab === 'chat' && (
          <>
            {/* Family Battle Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-indigo-950 border border-purple-500/30 text-white text-center shadow-lg">
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">Family War</span>
              <h2 className="text-xs font-bold my-2">The Family Battle will begin in 3 minutes. Join now!</h2>
              <button className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-black shadow-md">
                Go
              </button>
            </div>

            {/* Chat Messages inside Family */}
            <div className="space-y-3">
              <div className="text-center text-[10px] text-slate-400">2026/09/08 12:40</div>
              <div className="flex items-start gap-2">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="User" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">مالك .. ❤️ Jojo</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold">VIP 3</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-sm max-w-[220px]">
                    منورين الغرفة يا شباب .. ❤️
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSubTab === 'tasks' && (
          <div className="space-y-3">
            {/* Family Honor & Level Progress */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 text-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">Lv.{familyInfo.level}</span>
                  <h3 className="text-xs font-black">Family Weekly Active Value 🔥</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">{familyInfo.activeValue} / {familyInfo.maxActiveValue}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full" style={{ width: `${(familyInfo.activeValue / familyInfo.maxActiveValue) * 100}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-300">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700"><span className="block font-bold text-amber-400">530</span>Chest 1</div>
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700"><span className="block font-bold text-amber-400">1580</span>Chest 2</div>
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700"><span className="block font-bold text-amber-400">3020</span>Chest 3</div>
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700"><span className="block font-bold text-amber-400">4780</span>Chest 4</div>
              </div>
            </div>

            {/* Daily Check-In Row (مطابق للصورة الأولى) */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                <span>Family Check-In 🌟</span>
                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Done</span>
              </h4>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((day, idx) => (
                  <div key={idx} className={`p-2 rounded-xl border ${idx === 0 ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'}`}>
                    <span className="block text-[9px]">+{(idx + 1) * 5}</span>
                    <span className="text-[10px]">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks list مطابقة للصور */}
            <div className="space-y-2.5">
              {[
                { title: 'Send messages 1 times in the family group chat', val: '+5' },
                { title: 'Send a gift 1 times in the family group chat', val: '+10' },
                { title: 'Send lucky bag 1 time in the family group chat', val: '+15' },
                { title: 'Send a gift to a family member and receive a gift in return', val: '+10' },
                { title: "Be active in a family member's chat room for more than 10 minutes", val: '+15' },
                { title: 'Like a family member moments 1 times', val: '+5' },
              ].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{task.title}</h4>
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500" /> Active Value {task.val}
                    </span>
                  </div>
                  <button className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm">Go</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'moments' && (
          <div className="space-y-3">
            {[1, 2].map((m) => (
              <div key={m} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Author" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">PiTaChiO,,</h4>
                      <span className="text-[10px] text-slate-400">9 days ago</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1">
                    ❤️ Like
                  </button>
                </div>
                <div className="w-full h-48 rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" alt="Moment" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* تبويب أعضاء العائلة والإدارة الكاملة (مطابق للصورة الثانية والثالثة) */}
        {activeSubTab === 'members' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white">Family Members ({familyInfo.members.length}/50)</h3>
              <button onClick={() => setActiveSubTab('chat')} className="text-xs text-purple-500 font-bold">Complete</button>
            </div>
            {familyInfo.members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={member.profile_photo} alt="" className="w-11 h-11 rounded-full object-cover border border-amber-400" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{member.display_name}</span>
                      {idx === 0 && <span className="px-1.5 py-0.2 rounded bg-purple-600/20 text-purple-500 text-[9px] font-bold">Leader</span>}
                    </div>
                    <span className="text-[10px] bg-sky-500/10 text-sky-500 px-1.5 py-0.5 rounded font-semibold mt-1 inline-block">♂ {member.age}</span>
                  </div>
                </div>

                {idx !== 0 && (
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => { setSelectedMember(member); setConfirmDeputyModal(true); }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 hover:opacity-80 transition"
                      title="Set Deputy"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:opacity-80 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* نافذة تأكيد تعيين نائب القائد المنبثقة (مطابقة للصورة الرابعة) */}
      {confirmDeputyModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Confirm to set this member as a deputy leader?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{selectedMember.display_name}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmDeputyModal(false)} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button onClick={() => { setConfirmDeputyModal(false); alert('تم تعيين نائب القائد بنجاح!'); }} className="py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg">
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Family Navigation Bar (Matching SUGO Images) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-around z-30 shadow-lg">
        <button onClick={() => setActiveSubTab('tasks')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeSubTab === 'tasks' ? 'text-purple-600' : 'text-slate-500'}`}>
          <span className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">📋</span>
          Tasks
        </button>
        <button onClick={() => setActiveSubTab('moments')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeSubTab === 'moments' ? 'text-amber-500' : 'text-slate-500'}`}>
          <span className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">🌅</span>
          Moments
        </button>
        <button onClick={() => setActiveSubTab('chat')} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${activeSubTab === 'chat' ? 'text-emerald-500' : 'text-slate-500'}`}>
          <span className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">💬</span>
          Chat
        </button>
      </div>

    </div>
  );
};