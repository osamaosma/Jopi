// ============================================================================
// jopi Discovery Filter Modal
// Filter by age, gender, distance, country, interests, and online status
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { MOCK_INTERESTS } from '../../data/mockData';

export const FilterModal: React.FC = () => {
  const { 
    filterModalOpen, 
    setFilterModalOpen, 
    filters, 
    updateFilters, 
    resetFilters,
    showToast 
  } = useApp();
  const { t, lang } = useLang();

  const [localFilters, setLocalFilters] = useState(filters);

  if (!filterModalOpen) return null;

  const handleApply = () => {
    updateFilters(localFilters);
    setFilterModalOpen(false);
    showToast('تم تحديث تفضيلات البحث بنجاح!', 'success');
  };

  const handleReset = () => {
    resetFilters();
    setFilterModalOpen(false);
    showToast('تمت استعادة الإعدادات الافتراضية للفلاتر', 'info');
  };

  const toggleInterest = (name: string) => {
    setLocalFilters(prev => {
      const selected = prev.selected_interests || [];
      if (selected.includes(name)) {
        return { ...prev, selected_interests: selected.filter(i => i !== name) };
      } else {
        return { ...prev, selected_interests: [...selected, name] };
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="font-bold text-base">{t('filtersTitle')}</h2>
            </div>
            <button
              onClick={() => setFilterModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-5 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Gender Preference */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('interestedIn')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'everyone', label: t('everyone') },
                  { id: 'women', label: t('women') },
                  { id: 'men', label: t('men') },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, gender_preference: item.id as any })}
                    className={`py-2.5 rounded-xl font-bold transition text-xs ${
                      localFilters.gender_preference === item.id
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('ageRange')}
                </label>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">
                  {localFilters.age_min} - {localFilters.age_max} عام
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={localFilters.age_min}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    age_min: Math.min(Number(e.target.value), localFilters.age_max - 1) 
                  })}
                  className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={localFilters.age_max}
                  onChange={(e) => setLocalFilters({ 
                    ...localFilters, 
                    age_max: Math.max(Number(e.target.value), localFilters.age_min + 1) 
                  })}
                  className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('maxDistance')}
                </label>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">
                  {localFilters.max_distance_km} كم
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={localFilters.max_distance_km}
                onChange={(e) => setLocalFilters({ ...localFilters, max_distance_km: Number(e.target.value) })}
                className="w-full accent-brand-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Country Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                الدولة
              </label>
              <select
                value={localFilters.country || 'all'}
                onChange={(e) => setLocalFilters({ ...localFilters, country: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">جميع الدول</option>
                <option value="السعودية">المملكة العربية السعودية</option>
                <option value="الإمارات">الإمارات العربية المتحدة</option>
                <option value="مصر">مصر</option>
                <option value="الكويت">الكويت</option>
                <option value="الأردن">الأردن</option>
                <option value="لبنان">لبنان</option>
                <option value="المملكة المتحدة">المملكة المتحدة</option>
                <option value="فرنسا">فرنسا</option>
              </select>
            </div>

            {/* Toggle Switches (Online Only & Verified Only) */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{t('onlineOnly')}</span>
                <input
                  type="checkbox"
                  checked={localFilters.online_only}
                  onChange={(e) => setLocalFilters({ ...localFilters, online_only: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{t('verifiedOnly')}</span>
                <input
                  type="checkbox"
                  checked={localFilters.verified_only}
                  onChange={(e) => setLocalFilters({ ...localFilters, verified_only: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Interests Filter */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('filterInterests')}
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {MOCK_INTERESTS.map((interest) => {
                  const isSelected = (localFilters.selected_interests || []).includes(interest.name);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.name)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm'
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
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center transition"
              title={t('resetFilters')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition active:scale-98"
            >
              {t('applyFilters')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
