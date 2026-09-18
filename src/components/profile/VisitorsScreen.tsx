import React from 'react';
import { ArrowRight, Eye, Heart, Crown, MapPin } from 'lucide-react';

interface VisitorsScreenProps {
  onBack: () => void;
  showToast: (msg: string, type: any) => void;
}

export const VisitorsScreen: React.FC<VisitorsScreenProps> = ({ onBack, showToast }) => {
  const visitors = [
    { id: '1', name: 'Alina', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', time: 'Visited you 7hour ago', distance: '2607km', vip: 'VIP 5', online: true },
    { id: '2', name: 'Sophia', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300', time: 'Visited you 19hour ago', distance: '11038km', vip: 'VIP 7', online: false },
    { id: '3', name: 'Victoria', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300', time: 'Visited you 1hour ago', distance: '14099km', vip: 'VIP 4', online: true },
    { id: '4', name: 'Maria', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300', time: 'Visited you 19hour ago', distance: '11826km', vip: 'VIP 7', online: true },
    { id: '5', name: 'Elena', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300', time: 'Visited you 19hour ago', distance: '9121km', vip: 'VIP 3', online: false },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-24 select-none flex flex-col">
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="text-sm font-black">Visitors</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-y-auto">
        {visitors.map((v) => (
          <div key={v.id} className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between p-3 h-52 group cursor-pointer" onClick={() => showToast(`Opening ${v.name}'s profile`, 'info')}>
            <img src={v.photo} alt={v.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-black text-amber-400 border border-amber-400/30">
                {v.vip}
              </span>
              <button className="w-7 h-7 rounded-full bg-pink-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </button>
            </div>

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${v.online ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span className="text-xs font-black text-white">{v.name}</span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-400" /> {v.distance}
              </div>
              <div className="text-[9px] text-amber-300 font-semibold bg-black/50 px-2 py-0.5 rounded-md inline-block">
                {v.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};