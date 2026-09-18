import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

interface EventCenterScreenProps {
  onBack: () => void;
}

export const EventCenterScreen: React.FC<EventCenterScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-24 select-none flex flex-col">
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="text-sm font-black">Event Center</h1>
        <div className="w-9" />
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-3">
        <Calendar className="w-12 h-12 text-pink-500 animate-pulse" />
        <h2 className="text-base font-bold">مركز الأحداث والفعاليات</h2>
        <p className="text-xs text-slate-400">تابع أحدث الفعاليات والمسابقات الحصرية واكسب الجوائز.</p>
      </div>
    </div>
  );
};