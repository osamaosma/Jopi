import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Coins, Sparkles, Trophy } from 'lucide-react';

interface TasksScreenProps {
  onBack: () => void;
  showToast: (msg: string, type: any) => void;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ onBack, showToast }) => {
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Daily Check-in', reward: '+15 Coins', completed: true },
    { id: 't2', title: 'Say hi to 1 girl(0/1)', reward: '+5 Coins', completed: false },
    { id: 't3', title: 'Say hi to 5 girls(0/5)', reward: '+10 Coins', completed: false },
    { id: 't4', title: 'Intimacy with one girl >30', reward: '+25 Coins', completed: false },
    { id: 't5', title: 'Send a gift in chatting', reward: '+20 Coins', completed: false },
    { id: 't6', title: 'Enter a chat room(stay for 5 minutes)', reward: '+20 Coins', completed: true },
    { id: 't7', title: 'Send a gift in chat room', reward: '+20 Coins', completed: false },
  ]);

  const handleClaim = (id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    showToast(`تم إستلام مكافأة "${title}" بنجاح! 🎉`, 'success');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-white pb-24 select-none flex flex-col">
      <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="text-sm font-black">Tasks</h1>
        <Trophy className="w-5 h-5 text-amber-400" />
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        
        {/* بانر إنجاز المهام اليومية */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">Daily Tasks</span>
            <h3 className="text-xs font-black text-white mt-0.5">Finish your daily task to win 🪙 135 Coins.</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">🏆</div>
        </div>

        {/* قائمة المهام */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div key={task.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {task.completed ? '✓' : '🎁'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{task.title}</h4>
                  <span className="text-[10px] text-amber-400 font-mono font-black">{task.reward}</span>
                </div>
              </div>

              <button 
                onClick={() => handleClaim(task.id, task.title)}
                disabled={task.completed}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                  task.completed 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md hover:scale-105'
                }`}
              >
                {task.completed ? 'Completed' : 'Claim'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};