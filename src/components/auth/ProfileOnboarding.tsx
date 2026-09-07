// ============================================================================
// jopi Profile Onboarding Guard
// Mandates completion of minimum profile attributes before accessing discovery
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, Check, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useApp } from '../../context/AppContext';
import { MOCK_INTERESTS } from '../../data/mockData';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
];

export const ProfileOnboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t, lang } = useLang();
  const { showToast } = useApp();

  const [selectedPhoto, setSelectedPhoto] = useState(user?.profile_photo || AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState(user?.bio || 'مرحبا! متحمس للتعرف على أشخاص مميزين ومشاركة الأفكار 🌟');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || ['Coffee', 'Travel', 'Music']);
  const [jobTitle, setJobTitle] = useState(user?.job_title || 'مطور برمجيات');
  const [gender, setGender] = useState<string>(user?.gender || ''); // تعيين الجنس الافتراضي أو تركها فارغة ليختار المستخدم بدقة

  const toggleInterest = (name: string) => {
    if (selectedInterests.includes(name)) {
      setSelectedInterests(prev => prev.filter(i => i !== name));
    } else {
      if (selectedInterests.length >= 6) {
        showToast('يمكنك اختيار حتى 6 اهتمامات', 'warning');
        return;
      }
      setSelectedInterests(prev => [...prev, name]);
    }
  };

  const handleComplete = () => {
    if (!gender) {
      showToast('الرجاء اختيار الجنس (ذكر أو أنثى) للمتابعة', 'warning');
      return;
    }

    if (selectedInterests.length < 2) {
      showToast('يرجى اختيار اهتمامين على الأقل', 'warning');
      return;
    }

    updateUser({
      profile_photo: selectedPhoto,
      photos: [selectedPhoto, ...AVATAR_OPTIONS.slice(1, 3)],
      bio,
      interests: selectedInterests,
      job_title: jobTitle,
      gender: gender as any, // تجاوز تدقيق النوع الصارم ليتوافق مع Gender
      updated_at: new Date().toISOString(),
    });

    showToast('اكتمل ملفك الشخصي بنجاح! مرحباً بك 🚀', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800">
        
        {/* Onboarding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold">إكمال ملفك الشخصي</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            اختر صورتك وأخبرنا بما تحبه لنساعدك في العثور على أفضل المطابقات!
          </p>
        </div>

        {/* Gender Selection */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            الجنس (Gender) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                gender === 'male'
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>ذكر 👨</span>
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                gender === 'female'
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>أنثى 👩</span>
            </button>
          </div>
        </div>

        {/* Photo Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
            اختر صورتك الرمزية أو الرئيسية
          </label>
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-brand-500 shadow-xl">
              <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(imgUrl)}
                className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition ${
                  selectedPhoto === imgUrl ? 'border-brand-600 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                {selectedPhoto === imgUrl && (
                  <div className="absolute inset-0 bg-brand-600/40 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            نبذة عنك (About Me)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            placeholder="اكتب نبذة مختصرة عن اهتماماتك وطاقتك..."
          />
        </div>

        {/* Interests Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              اختر اهتماماتك (اختر 2 على الأقل)
            </label>
            <span className="text-[10px] text-brand-600 font-bold">
              {selectedInterests.length}/6
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {MOCK_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.name);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{interest.icon}</span>
                  <span>{lang === 'ar' ? (interest.name_ar || interest.name) : interest.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleComplete}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-700 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition active:scale-98"
        >
          ابدأ الاستكشاف الآن 🚀
        </button>

      </div>
    </div>
  );
};