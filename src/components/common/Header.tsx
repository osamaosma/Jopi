// ============================================================================
// MingleUp Header Component
// Top bar with branding, coin wallet chip, filter, notifications, and quick toggles
// ============================================================================

import React from 'react';
import { 
  Sparkles, SlidersHorizontal, Bell, Coins, 
  Moon, Sun, Globe, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setFilterModalOpen, 
    setNotificationsOpen, 
    unreadNotifsCount, 
    coinBalance 
  } = useApp();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, isRTL } = useLang();

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 fill-brand-500/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                MingleUp
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Coin Balance Chip */}
          <button
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:scale-105 transition-transform shadow-sm"
            title="Wallet Balance"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{coinBalance.toLocaleString()}</span>
          </button>

          {/* Filter Button (Highlighted on Discover tab) */}
          {activeTab === 'discover' && (
            <button
              onClick={() => setFilterModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title="Filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold active:scale-95"
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-4 h-4 inline-block me-0.5" />
            <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Admin Switch */}
          <button
            onClick={() => setActiveTab(activeTab === 'admin' ? 'discover' : 'admin')}
            className={`p-2 rounded-xl transition active:scale-95 ${
              activeTab === 'admin' 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Admin Console"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
