// ============================================================================
// Jopi Authentication Screen (Real Supabase Production Ready)
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Phone, User as UserIcon, 
  ShieldAlert, ShieldCheck, KeyRound 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useApp } from '../../context/AppContext';
import { SignUpData } from '../../services/authService';
import { COUNTRIES_LIST, Country } from '../../data/countriesData';
import { supabase } from '../../services/supabaseClient';

export const AuthScreen: React.FC = () => {
  const { login, signUp, sendPhoneOtp, verifyPhoneOtp, socialLogin } = useAuth();
  const { t } = useLang();
  const { showToast } = useApp();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'signup'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES_LIST[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES_LIST.filter((c: Country) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    date_of_birth: '2000-01-01',
    gender: 'female',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف بشكل صحيح');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await sendPhoneOtp(selectedCountry.dialCode, phoneNumber);
      if (res.success) {
        setOtpSent(true);
        setOtpCode(''); // إزالة الرمز الوهمي ليكون الاعتماد على الرمز الحقيقي المرسل فقط
        showToast(res.message, 'success');
      } else {
        setErrorMessage(res.message || 'فشل إرسال رمز التحقق عبر السيرفر');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 4) {
      setErrorMessage('يرجى إدخال رمز التحقق المؤلف من أرقام صحيحة');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await verifyPhoneOtp(selectedCountry.dialCode, phoneNumber, otpCode);
      if (res.success) {
        showToast('تم التحقق بنجاح! مرحباً بك 🚀', 'success');
        window.location.reload();
      } else {
        setErrorMessage(res.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل التحقق من الرمز');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('تم تسجيل الدخول بنجاح!', 'success');
        window.location.reload();
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول، تأكد من البيانات');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة بدقة');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await signUp(signUpData);
      if (res.success) {
        showToast('تم إنشاء الحساب بنجاح!', 'success');
        window.location.reload();
      } else {
        setErrorMessage(res.error || 'فشل إنشاء الحساب السحابي');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await socialLogin(provider);
      if (!res.success) {
        setErrorMessage('فشل تسجيل الدخول عبر المنصة الخارجية');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل الاتصال بخدمة المصادقة الخارجية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-center px-4 py-8 transition-colors">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
            Jopi
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t('tagline') || 'تطبيق الدردشة والترفيه الاجتماعي الألطف'}
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setOtpSent(false); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMethod === 'phone' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('phoneAuthTab') || 'الهاتف'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMethod === 'email' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t('emailAuthTab') || 'البريد'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authMethod === 'signup' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{t('signupBtn') || 'حساب جديد'}</span>
          </button>
        </div>

        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {authMethod === 'phone' && (
            <motion.div key="phone-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      أدخل رقم الهاتف
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-36 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-between hover:bg-slate-200 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1 truncate">
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span dir="ltr">{selectedCountry.dialCode}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">▼</span>
                      </button>

                      <div className="relative flex-1" dir="ltr">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="51234567"
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md cursor-pointer">
                    {loading ? 'جاري الإرسال عبر السيرفر...' : 'إرسال رمز التحقق SMS الحقيقي'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 mx-auto mb-2 flex items-center justify-center">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black">أدخل رمز التحقق المرسل لهاتفك</h3>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full text-center py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-brand-500 text-xl font-mono font-black tracking-widest focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOtpSent(false)} className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                      تغيير الرقم
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white font-bold text-xs cursor-pointer">
                      {loading ? 'جاري التحقق...' : 'تحقق واعتماد الحساب'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {authMethod === 'email' && (
            <motion.form key="email-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3.5 top-3.5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute start-3.5 top-3.5 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md cursor-pointer">
                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </button>
            </motion.form>
          )}

          {authMethod === 'signup' && (
            <motion.form key="signup-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSignUp} className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكامل</label>
                <input type="text" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} required placeholder="الاسم الكامل" className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني</label>
                <input type="email" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required placeholder="name@email.com" className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كلمة المرور</label>
                <input type="password" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required placeholder="••••••••" className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 text-white font-bold text-xs cursor-pointer">
                {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-5 pt-5 border-t border-slate-200/70 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="text-red-500 font-black text-sm">G</span>
            <span>متابعة باستخدام Google</span>
          </button>
        </div>

        <div className="mt-4 pt-3 text-center border-t border-slate-100 dark:border-slate-800/60">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>جلسة تسجيل دخول مشفرة ومحمية بواسطة Jopi</span>
          </div>
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl max-h-[80vh] flex flex-col shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-200">اختر الدولة</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold px-2 cursor-pointer">✕</button>
            </div>
            
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم الدولة أو الرمز..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none text-right"
              />
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filteredCountries.map((country: Country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    setIsModalOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition text-right cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-slate-200 font-medium">{country.name}</span>
                  </div>
                  <span className="text-purple-400 font-bold" dir="ltr">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};