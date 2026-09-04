// ============================================================================
// MingleUp Create Party Room Modal
// Setup custom room title, category, audio/video stage mode & background theme
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Mic, Video, Sparkles, Plus } from 'lucide-react';
import { RoomCategory, RoomStageType } from '../../types';
import { RoomService } from '../../services/roomService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

const THEMES = [
  { id: 'from-brand-950 via-slate-900 to-indigo-950', name: 'بنفسجي ملكي' },
  { id: 'from-rose-950 via-slate-900 to-purple-950', name: 'شفق وردي' },
  { id: 'from-amber-950 via-slate-900 to-rose-950', name: 'لهب ذهبي' },
  { id: 'from-cyan-950 via-slate-900 to-blue-950', name: 'أزرق نيون' },
];

export const CreateRoomModal: React.FC = () => {
  const { user } = useAuth();
  const { 
    createRoomModalOpen, 
    setCreateRoomModalOpen, 
    openRoom, 
    showToast 
  } = useApp();
  const { t } = useLang();

  const [title, setTitle] = useState(`${user?.display_name || 'مجلس'} - سوالف ووناسة ☕✨`);
  const [description, setDescription] = useState('مرحباً بالجميع! تفضلوا بالدخول ومشاركتنا الحديث.');
  const [category, setCategory] = useState<RoomCategory>('chat');
  const [stageType, setStageType] = useState<RoomStageType>('audio');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);

  if (!createRoomModalOpen || !user) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('يرجى كتابة عنوان للغرفة', 'warning');
      return;
    }

    const room = await RoomService.createRoom({
      title: title.trim(),
      description: description.trim(),
      category,
      type: stageType,
      host: user,
      bgTheme: selectedTheme,
    });

    setCreateRoomModalOpen(false);
    openRoom(room);
    showToast('تم إنشاء غرفتك الحية بنجاح! أنت المضيف الآن 👑🎙️', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm select-none">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-600 text-white shadow-md">
                <Radio className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-sm">{t('createRoom')}</h2>
            </div>
            <button
              onClick={() => setCreateRoomModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('roomTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="اكتب عنواناً جذاباً لغرفتك..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نمط المسرح
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStageType('audio')}
                  className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${
                    stageType === 'audio'
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{t('stageAudio')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStageType('video')}
                  className={`p-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition ${
                    stageType === 'video'
                      ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{t('stageVideo')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('roomCategory')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'chat', label: t('catChat') },
                  { id: 'music', label: t('catMusic') },
                  { id: 'gaming', label: t('catGaming') },
                  { id: 'dating', label: t('catDating') },
                  { id: 'friendship', label: t('catFriendship') },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as RoomCategory)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      category === item.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('roomWallpaper')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                      selectedTheme === theme.id ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-tr ${theme.id}`} />
                    <span className="text-[11px] font-bold">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                وصف الغرفة
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="أخبر الزوار بنوع الفعالية أو الحوار..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 text-white font-black text-xs shadow-xl shadow-brand-500/30 transition active:scale-98"
            >
              إطلاق الغرفة الآن 🚀
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};