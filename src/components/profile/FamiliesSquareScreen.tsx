import React from 'react';
import { ArrowRight, Shield, Trophy, Users, ChevronRight } from 'lucide-react';

interface FamiliesSquareScreenProps {
  onBack: () => void;
  showToast: (msg: string, type: any) => void;
}

export const FamiliesSquareScreen: React.FC<FamiliesSquareScreenProps> = ({ onBack, showToast }) => {
  const families = [
    { id: '1', name: '❤️ LOVELINK ❤️', members: 46, desc: '"Si buscas una família real, @LOVELINK👑" conectados somos invencibles.', tag: 'Make friends', female: '52% Female', bg: 'from-pink-900/40 to-rose-950' },
    { id: '2', name: 'Papión Ardiente 🔥', members: 39, desc: '1. No quitarse las iniciales. 2. Ayudar a la familia con las tareas y la familia te ayuda...', tag: 'Male friends', female: '79% Female', bg: 'from-amber-900/40 to-orange-950' },
    { id: '3', name: 'M 👑 N S T E R S ✨', members: 13, desc: 'BIENVENIDOS ALA FAMILIA @M👑NSTERS✨ Wealth 76% Female', tag: 'Wealth', female: '76% Female', bg: 'from-purple-900/40 to-indigo-950' },
    { id: '4', name: 'ES UN SECRETO 🔥', members: 336, desc: '¡Bienvenidos a nuestra familia! solo pide respeto y apoyo entre todos los integrantes!', tag: 'Wealth', female: '81% Female', bg: 'from-red-900/40 to-slate-950' },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-24 select-none flex flex-col">
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="text-sm font-black">Families Square</h1>
        <Trophy className="w-5 h-5 text-amber-400 cursor-pointer" onClick={() => showToast('Family Leaderboard', 'info')} />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        
        {/* إعلان أو بانر العائلة المميزة الأعلى */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-purple-600/20 to-indigo-600/20 border border-amber-500/40 shadow-lg relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">Mine</span>
            <span className="text-xs font-black text-amber-400">⚡ UCHIHA ⚡</span>
          </div>
          <p className="text-xs text-slate-300 font-bold">Weekly active rank 50+ • Daily active rank 50+</p>
        </div>

        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">Recommend Family</h3>

        {/* قائمة العائلات */}
        {families.map((fam) => (
          <div key={fam.id} className={`p-4 rounded-3xl bg-gradient-to-r ${fam.bg} border border-slate-800 shadow-md space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/30 text-amber-400 flex items-center justify-center font-black shadow-inner">🛡️</div>
                <div>
                  <h4 className="text-xs font-black text-white">{fam.name}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> {fam.members} Members</span>
                </div>
              </div>
              <button onClick={() => showToast(`Joined ${fam.name} successfully! 🎉`, 'success')} className="px-5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md cursor-pointer transition">
                Join
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-2xl border border-white/5">
              {fam.desc}
            </p>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-bold">{fam.tag}</span>
              <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[9px] font-bold">{fam.female}</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};