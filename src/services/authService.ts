// ============================================================================
// MingleUp Authentication Service (Production Fixed Version)
// ============================================================================

import { User } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { supabase } from './supabaseClient';

export interface SignUpData {
  name: string;
  email?: string;
  phone_number?: string;
  password?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'non_binary' | 'other';
  country: string;
  city: string;
  profile_photo?: string;
}

const generateCustomId = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

export class AuthService {
  static getCurrentUser(): User | null {
    StorageService.initializeDefaults();
    return StorageService.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static isAuthenticated(): boolean {
    return StorageService.get<boolean>(STORAGE_KEYS.IS_AUTHENTICATED, false);
  }

  // --- Phone Number + OTP SMS Authentication (Real Supabase Sync) ---
  static async sendPhoneOtp(countryCode: string, phoneNumber: string): Promise<{ success: boolean; message: string }> {
    const fullPhone = `${countryCode}${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;
    
    // استخدام خدمة Supabase الحقيقية لإرسال OTP للهاتف
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: `تم إرسال رمز التحقق (SMS OTP) إلى ${fullPhone}`,
    };
  }

  static async verifyPhoneOtp(
    countryCode: string, 
    phoneNumber: string, 
    code: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const fullPhone = `${countryCode}${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;

    if (code.length < 4) {
      return { success: false, error: 'رمز التحقق غير صحيح، يجب أن يتكون من 4 أرقام على الأقل' };
    }

    // التحقق من الرمز عبر Supabase Auth
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: code,
      type: 'sms',
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'فشل التحقق من الرمز' };
    }

    const syncedUser = await this.syncUserProfile(data.user, { phone_number: fullPhone });
    if (syncedUser) {
      StorageService.set(STORAGE_KEYS.CURRENT_USER, syncedUser);
      StorageService.set(STORAGE_KEYS.IS_AUTHENTICATED, true);
      return { success: true, user: syncedUser };
    }

    return { success: false, error: 'فشل مزامنة بيانات المستخدم' };
  }

  // --- Email & Password Authentication (Supabase Integrated) ---
  static async login(email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!password) {
      return { success: false, error: 'الرجاء إدخال كلمة المرور' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const user = await this.syncUserProfile(data.user);
      if (user) {
        StorageService.set(STORAGE_KEYS.CURRENT_USER, user);
        StorageService.set(STORAGE_KEYS.IS_AUTHENTICATED, true);
        return { success: true, user };
      }
    }
    return { success: false, error: 'فشل تسجيل الدخول' };
  }

  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const res = await this.login(email, password);
    return { user: res.user || null, error: res.error || null };
  }

  // --- Registration Flow (Supabase Real Cloud Sync) ---
  static async signUp(data: SignUpData): Promise<{ success: boolean; user?: User; error?: string }> {
    const email = data.email;
    const password = data.password;
    const name = data.name;

    if (!email || !password) {
      return { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' };
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (authData.user) {
      const syncedUser = await this.syncUserProfile(authData.user, data);
      if (syncedUser) {
        StorageService.set(STORAGE_KEYS.CURRENT_USER, syncedUser);
        StorageService.set(STORAGE_KEYS.IS_AUTHENTICATED, true);
        return { success: true, user: syncedUser };
      }
    }

    return { success: false, error: 'فشل إنشاء الحساب السحابي' };
  }

  // --- Google & Social Sign-In (Real Supabase OAuth) ---
static async socialLogin(provider: 'google' | 'apple'): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin // استخدام رابط المتصفح الحالي لتجنب أخطاء الـ Scheme على الويب
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Social login failed' };
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await supabase.auth.resetPasswordForEmail(email);
    return { 
      success: true, 
      message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}` 
    };
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
    StorageService.set(STORAGE_KEYS.IS_AUTHENTICATED, false);
    StorageService.set(STORAGE_KEYS.CURRENT_USER, null);
  }

  static logout(): void {
    this.signOut();
  }

  static deleteAccount(): void {
    StorageService.resetToDemoData();
    StorageService.set(STORAGE_KEYS.IS_AUTHENTICATED, false);
  }

  // مزامنة حقيقية مع جدول profiles الصحيح في Supabase
  private static async syncUserProfile(authUser: any, additionalData?: any): Promise<User | null> {
    if (!authUser) return null;

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingUser) return existingUser as User;

    const birthYear = additionalData?.date_of_birth ? new Date(additionalData.date_of_birth).getFullYear() : 2000;
    const currentYear = new Date().getFullYear();
    const age = Math.max(18, currentYear - birthYear);

    const newUser: Partial<User> = {
      id: authUser.id,
      custom_id: generateCustomId(),
      email: authUser.email || additionalData?.email || '',
      phone_number: authUser.phone || additionalData?.phone_number || '',
      display_name: authUser.user_metadata?.display_name || additionalData?.name || 'مستخدم MingleUp',
      date_of_birth: additionalData?.date_of_birth || '2000-01-01',
      age: age,
      gender: additionalData?.gender || 'other',
      country: additionalData?.country || 'المملكة العربية السعودية',
      city: additionalData?.city || 'الرياض',
      bio: 'عضو جديد في عائلة MingleUp! ✨',
      profile_photo: authUser.user_metadata?.avatar_url || additionalData?.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'],
      interests: ['Coffee', 'Travel', 'Music'],
      languages: ['العربية', 'English'],
      is_online: true,
      last_seen: new Date().toISOString(),
      is_verified: false,
      vip_level: 1,
      coin_balance: 200,
      role: 'user',
      auth_provider: authUser.phone ? 'phone' : 'email',
    };

    const { data: insertedUser, error } = await supabase
      .from('profiles')
      .insert([newUser])
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile to Supabase:', error.message);
      return newUser as User;
    }

    return insertedUser as User;
  }
}