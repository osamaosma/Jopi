import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function PhoneAuth() {
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' لإدخال الرقم، أو 'otp' لإدخال الرمز
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // الخطوة الأولى: إرسال رمز التحقق إلى رقم الهاتف
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone, // يجب أن يكون الرقم بصيغة دولية صحيحة مثل +965xxxxxxxx أو +20xxxxxxxxxx
      });

      if (error) throw error;

      setMessage('تم إرسال رمز التحقق بنجاح إلى هاتفك!');
      setStep('otp'); // الانتقال لخطوة إدخال الرمز
    } catch (error) {
      setMessage(`خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // الخطوة الثانية: التحقق من الرمز المدخل وتسجيل الدخول
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms',
      });

      if (error) throw error;

      setMessage('تم تسجيل الدخول بنجاح!');
      console.log('بيانات الجلسة:', data);
      // هنا يمكنك توجيه المستخدم لصفحة التطبيق الرئيسية
    } catch (error) {
      setMessage(`خطأ في الرمز: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>تسجيل الدخول برقم الهاتف</h2>

      {message && <p style={{ color: message.includes('خطأ') ? 'red' : 'green' }}>{message}</p>}

      {step === 'phone' ? (
        <form onSubmit={handleSendOTP}>
          <div style={{ marginBottom: '15px' }}>
            <label>رقم الهاتف (مع رمز الدولة):</label>
            <input
              type="text"
              placeholder="+965xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div style={{ marginBottom: '15px' }}>
            <label>أدخل رمز التحقق (OTP):</label>
            <input
              type="text"
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {loading ? 'جاري التحقق...' : 'تأكيد وتسجيل الدخول'}
          </button>
        </form>
      )}
    </div>
  );
}