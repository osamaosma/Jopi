// ============================================================================
// jopi Settings Screen
// Account preferences, Privacy, Language, Theme, Blocked Users, Terms & Account Deletion
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Moon, Sun, Globe, Bell, EyeOff, 
  Ban, FileText, HelpCircle, LogOut, Trash2, 
  ChevronRight, ChevronLeft, RefreshCw, AlertTriangle, X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storageService';
import { BlockedUsersModal } from './BlockedUsersModal';

export const SettingsScreen: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t, isRTL } = useLang();
  const { showToast, refreshDeck, refreshWallet, refreshNotifications } = useApp();

  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Toggles state
  const [ghostMode, setGhostMode] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleResetDemoData = () => {
    StorageService.resetToDemoData();
    refreshDeck();
    refreshWallet();
    refreshNotifications();
    showToast('تمت إعادة ضبط جميع البيانات التجريبية بنجاح! 🔄', 'success');
  };

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      <h1 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
        {t('settingsTitle')}
      </h1>

      <div className="space-y-4">
        
        {/* PREFERENCES SECTION */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 shadow-sm">
          <h2 className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            التفضيلات والمظهر
          </h2>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold">{t('darkMode')}</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isDark ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">{t('languageSetting')}</span>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
            >
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English (الإنجليزية)</option>
            </select>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">{t('notificationsSetting')}</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(prev => !prev)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                notificationsEnabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* PRIVACY & SAFETY SECTION */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 shadow-sm">
          <h2 className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            {t('privacySettings')}
          </h2>

          {/* Ghost Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">{t('ghostMode')}</span>
                <span className="text-[10px] text-slate-400">إخفاء ملفك من بطاقات الاستكشاف مؤقتاً</span>
              </div>
            </div>
            <button
              onClick={() => setGhostMode(prev => !prev)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                ghostMode ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Blocked Users */}
          <div 
            onClick={() => setBlockedModalOpen(true)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Ban className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">{t('blockedUsers')}</span>
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* SUPPORT & DEMO CONTROLS */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 shadow-sm">
          <h2 className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            الدعم والشروط
          </h2>

          <div 
            onClick={() => setTermsModalOpen(true)}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">{t('termsOfService')} & {t('privacyPolicy')}</span>
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400" />
          </div>

          {/* Reset Demo Data Button */}
          <div 
            onClick={handleResetDemoData}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">{t('resetDemoData')}</span>
            </div>
            <ArrowIcon className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* LOGOUT & DESTRUCTIVE ACCOUNT DELETION */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('deleteAccount')}</span>
          </button>
        </div>

      </div>

      {/* BLOCKED USERS MODAL */}
      <BlockedUsersModal
        isOpen={blockedModalOpen}
        onClose={() => setBlockedModalOpen(false)}
      />

      {/* DELETE ACCOUNT CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-base font-black text-rose-600 mb-1">
                {t('deleteConfirmTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {t('deleteConfirmDesc')}
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    deleteAccount();
                    setDeleteConfirmOpen(false);
                    showToast('تم حذف الحساب ومسح البيانات', 'info');
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  نعم، احذف حسابي نهائياً
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TERMS & PRIVACY MODAL */}
      <AnimatePresence>
        {termsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm">{t('termsOfService')}</h3>
                <button onClick={() => setTermsModalOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
                <p>
                  مرحباً بك في <strong>jopi</strong>. تلتزم المنصة بأعلى معايير الخصوصية وحماية بيانات المستخدمين وأمان المحادثات المشفرة.
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white">1. السلوك والآداب</h4>
                <p>
                  يُحظر تماماً أي شكل من أشكال التحرش أو المحتوى غير اللائق أو الحسابات المزيفة. يتم اتخاذ إجراءات فورية بحظر الحسابات المخالفة.
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white">2. العملات والهدايا</h4>
                <p>
                  العملات الافتراضية هي عناصر داخل التطبيق تُستخدم لإرسال الهدايا والتفاعل المميز ولا تخضع للاسترجاع النقدي بعد الاستخدام.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
              >
                موافق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
