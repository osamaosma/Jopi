import React from 'react';
import { ArrowRight, ChevronRight, RefreshCw, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { Language } from '../../context/LangContext';

interface SettingsScreenProps {
  settingsView: string;
  setSettingsView: (view: any) => void;
  setShowSettingsScreen: (show: boolean) => void;
  t: (key: string) => string;
  lang: Language;
  setLang: (lang: Language) => void;
  availableLanguages: Array<{ code: Language; name: string; nativeName: string; flag: string }>;
  toggles: { [key: string]: boolean };
  handleToggle: (key: any) => void;
  handleClearCache: () => void;
  handleLanguageSelect: (code: Language) => void;
  diagnosing: boolean;
  diagResult: string | null;
  handleRunDiagnostics: () => void;
  showToast: (msg: string, type: any) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settingsView,
  setSettingsView,
  setShowSettingsScreen,
  t,
  lang,
  setLang,
  availableLanguages,
  toggles,
  handleToggle,
  handleClearCache,
  handleLanguageSelect,
  diagnosing,
  diagResult,
  handleRunDiagnostics,
  showToast
}) => {
  if (settingsView === 'security') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('accountSecurity')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200">
            <button onClick={() => showToast('Edit Password', 'info')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>Edit Account Password</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => showToast('Payment Security', 'info')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>Payment Security Settings</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800"><span>Phone binding</span><span className="text-slate-400 text-[11px]">+90-534723****</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (settingsView === 'notifications') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('notifications')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 text-xs font-bold text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between"><span>New Message Alerts</span><span className="text-brand-500">Enabled</span></div>
            <div className="flex items-center justify-between">
              <span>Visitor notification</span>
              <button onClick={() => handleToggle('visitorNotif')} className="cursor-pointer">
                {toggles.visitorNotif ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Chat room notifications</span>
              <button onClick={() => handleToggle('chatNotif')} className="cursor-pointer">
                {toggles.chatNotif ? (<ToggleRight className="w-6 h-6 text-brand-600" />) : (<ToggleLeft className="w-6 h-6 text-slate-400" />)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (settingsView === 'language') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setSettingsView('main')} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('languageSetting')}</h1>
          <button onClick={() => setSettingsView('main')} className="text-xs font-bold text-brand-600 cursor-pointer">Confirm</button>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {availableLanguages.map((item) => (
            <button key={item.code} onClick={() => handleLanguageSelect(item.code)} className="w-full p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <div className="flex items-center gap-2.5"><span className="text-base">{item.flag}</span><span>{item.nativeName} ({item.name})</span></div>
              {lang === item.code && <Check className="w-4 h-4 text-brand-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (settingsView === 'main') {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 select-none flex flex-col justify-between">
        <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setShowSettingsScreen(false)} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">{t('settings')}</h1>
          <div className="w-9" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm text-xs font-bold text-slate-800 dark:text-slate-200">
            <button onClick={() => setSettingsView('security')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>{t('accountSecurity')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('notifications')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>{t('notifications')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('language')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>{t('languageSetting')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('chat')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>{t('chatSettings')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('privacy')} className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer"><span>{t('privacy')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
            <button onClick={() => setSettingsView('about')} className="w-full flex items-center justify-between p-4 cursor-pointer"><span>{t('aboutApp')}</span><ChevronRight className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="pt-2">
            <button onClick={handleClearCache} className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"><RefreshCw className="w-4 h-4" /> <span>Clear Cache</span></button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};