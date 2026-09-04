// ============================================================================
// MingleUp Family Detail & Group Chat Screen (SUGO Style)
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Crown, Users, Award, MessageSquare, Gift, Flame, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FamilyDetailScreen: React.FC = () => {
  const { setActiveTab } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'tasks' | 'moments'>('chat');
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black">.,•UCHiHA•,.</h1>
          <span className="text-[10px] text-emerald-400 font-semibold">● 0 people online</span>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" className="w-full h-full object-cover" />
        </div>
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
              <div className="text-center text-[10px] text-slate-400">2026/08/30 01:11</div>
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
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <Flame className="w-4 h-4 text-rose-500" /> Family Weekly Active Value
                </h3>
                <span className="text-[10px] text-amber-500 font-bold">0 Active</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-400">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">530</div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">1580</div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">3020</div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">4780</div>
              </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-2">
              {['Send messages 1 times in family chat', 'Send a gift 1 times in family chat', 'Like a family member moments 1 times'].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{task}</h4>
                    <span className="text-[10px] text-amber-500 font-semibold">Active Value +5</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm">Go</button>
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Abedalhamid</h4>
                      <span className="text-[10px] text-slate-400">9 days ago</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1">
                    ❤️ Hi
                  </button>
                </div>
                <div className="w-full h-48 rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" alt="Moment" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bottom Family Navigation Bar (Matching SUGO Image) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 flex items-center justify-around z-30">
        <button onClick={() => setActiveSubTab('tasks')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <span className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">📋</span>
          Tasks
        </button>
        <button onClick={() => setActiveSubTab('moments')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <span className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">🌅</span>
          Moments
        </button>
        <button onClick={() => setActiveSubTab('chat')} className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          <span className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">💬</span>
          Chat
        </button>
      </div>

    </div>
  );
};