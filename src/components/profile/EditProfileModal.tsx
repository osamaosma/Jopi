// ============================================================================
// MingleUp Edit Profile Modal with Real Image Upload to Supabase Storage
// ============================================================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Save, User as UserIcon, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { ImageUploadService } from '../../services/imageUploadService';

export const EditProfileModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { editProfileOpen, setEditProfileOpen, showToast } = useApp();
  const { t } = useLang();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [jobTitle, setJobTitle] = useState(user?.job_title || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editProfileOpen || !user) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // فحص حجم الملف (أقل من 5 ميجابايت)
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت ⚠️', 'warning');
      return;
    }

    setIsUploading(true);
    showToast('جاري رفع الصورة إلى السحابة... ⏳', 'info');

    const publicUrl = await ImageUploadService.uploadAvatar(user.id, file);

    setIsUploading(false);
    if (publicUrl) {
      setProfilePhoto(publicUrl);
      showToast('تم رفع الصورة بنجاح! 📸✨', 'success');
    } else {
      showToast('فشل في رفع الصورة، تحقق من الاتصال بالإنترنت ❌', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUser({
        display_name: displayName.trim(),
        bio: bio.trim(),
        city: city.trim(),
        country: country.trim(),
        job_title: jobTitle.trim(),
        profile_photo: profilePhoto,
      });

      showToast('تم حفظ التعديلات بنجاح! ✅', 'success');
      setEditProfileOpen(false);
    } catch {
      showToast('حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('editProfile')}</span>
            </h3>
            <button
              onClick={() => setEditProfileOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Avatar Upload Area */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={profilePhoto || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 end-0 p-2.5 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 active:scale-95 transition"
                  title="تغيير الصورة"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-2">
                انقر على أيقونة الكاميرا لرفع صورة حقيقية من هاتفك
              </span>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الاسم الظاهر
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                  placeholder="اسمك الظاهر في التطبيق"
                />
              </div>
            </div>

            {/* Bio / About */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('aboutMe')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-brand-500 transition resize-none"
                placeholder="اكتب نبذة مميزة عنك واهتماماتك..."
              />
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  المدينة
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                  placeholder="المدينة"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الدولة
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                  placeholder="الدولة"
                />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                المهنة / العمل
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                placeholder="مهنتك أو مجال دراستك"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};