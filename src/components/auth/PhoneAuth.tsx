import React, { useState } from 'react';
import { COUNTRIES_LIST, Country } from '../../data/countriesData';
import { createClient } from '@supabase/supabase-js';

// استبدل هذه المتغيرات ببيانات مشروعك الفعلية أو قم بربطها بملف التكوين المركزي لديك
const supabaseUrl = 'https://whmpuhjrkuivhollodyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobXB1aGpya3VpdmhvbGxvZHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMzgxOTYsImV4cCI6MjEwMzYxNDE5Nn0.Fb6TqFfm0nvAquazDbtJtm6uU_jmZzG5E4NsH8EG-Lo';
const supabase = createClient(supabaseUrl, supabaseKey);

export const PhoneAuth: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES_LIST[0]); // الافتراضي سوريا أو أول القائمة
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // تصفية الدول بناءً على البحث مع تحديد النوع لتجنب أخطاء TypeScript
  const filteredCountries = COUNTRIES_LIST.filter((c: Country) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  // إرسال رمز التحقق عبر Supabase و Twilio
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setMessage('الرجاء إدخال رقم الهاتف');
      return;
    }

    setLoading(true);
    setMessage('');

    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.trim()}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
    });

    setLoading(false);

    if (error) {
      setMessage(`خطأ: ${error.message}`);
    } else {
      setMessage('تم إرسال رمز التحقق إلى هاتفك بنجاح 📱');
      setStep('OTP');
    }
  };

  // التحقق من الرمز المدخل
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setMessage('الرجاء إدخال رمز التحقق');
      return;
    }

    setLoading(true);
    setMessage('');

    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber.trim()}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhoneNumber,
      token: otpCode,
      type: 'sms',
    });

    setLoading(false);

    if (error) {
      setMessage(`رمز التحقق غير صحيح: ${error.message}`);
    } else {
      setMessage('تم تسجيل الدخول بنجاح! 🎉 أهلاً بك في تطبيق Jopi');
      // هنا يمكنك توجيه المستخدم لداخل التطبيق الرئيسي
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
        تسجيل الدخول برقم الهاتف - Jopi
      </h2>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800 text-sm text-center text-amber-400 border border-slate-700">
          {message}
        </div>
      )}

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">الدولة</label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-750 transition"
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </span>
              <span className="text-purple-400 font-bold" dir="ltr">{selectedCountry.dialCode}</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">رقم الهاتف</label>
            <div className="flex gap-2" dir="ltr">
              <span className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-purple-400 font-bold flex items-center">
                {selectedCountry.dialCode}
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="912345678"
                className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 text-right"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-purple-900/30 disabled:opacity-50"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300 text-right">
              أدخل رمز التحقق المكون من 6 أرقام المرسل إلى رقمك
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full p-3 text-center tracking-widest text-2xl bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-900/30 disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تأكيد وتسجيل الدخول'}
          </button>

          <button
            type="button"
            onClick={() => setStep('PHONE')}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-sm transition"
          >
            تغيير رقم الهاتف أو الدولة
          </button>
        </form>
      )}

      {/* نافذة اختيار الدول المنبثقة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-200">اختر الدولة</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>
            
            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم الدولة أو الرمز..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500 text-right"
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
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition text-right"
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