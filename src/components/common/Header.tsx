// ============================================================================
// jopi Header Component (Clean: Logo + Title without PRO + Filter Only)
// ============================================================================

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setFilterModalOpen 
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform border border-brand-500/30 flex items-center justify-center bg-white dark:bg-slate-950">
            <img 
              src="https://i.imgur.com/GbqJ4Bb.jpeg" 
              alt="Jopi Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              jopi
            </span>
          </div>
        </div>

        {/* Action Controls (Filter Only) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeTab === 'discover' && (
            <button
              onClick={() => setFilterModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};