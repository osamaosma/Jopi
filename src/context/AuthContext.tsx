// ============================================================================
// Jopi Auth Context (Fixed & Connected to 'users' table)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { AuthService, SignUpData } from '../services/authService';
import { UserService } from '../services/userService';
import { StorageService } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { DatabaseService } from '../services/databaseService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (countryCode: string, phoneNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneOtp: (countryCode: string, phoneNumber: string, code: string) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (provider: 'google' | 'apple') => Promise<{ success: boolean }>;
  logout: () => void;
  deleteAccount: () => void;
  updateUser: (fields: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const isOnboarded = Boolean(
    user && 
    user.display_name && 
    user.profile_photo
  );

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const remoteUser = await DatabaseService.getProfile(session.user.id);
        if (remoteUser) {
          setUser(remoteUser);
          UserService.updateCurrentUser(remoteUser);
        }
      }
    } catch (err) {
      console.error('Refresh User Error:', err);
    }
  };

  const login = async (email: string, password?: string) => {
    const res = await AuthService.login(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      StorageService.set('jopi_is_authenticated', true);
    }
    return res;
  };

  const sendPhoneOtp = async (countryCode: string, phoneNumber: string) => {
    return await AuthService.sendPhoneOtp(countryCode, phoneNumber);
  };

  const verifyPhoneOtp = async (countryCode: string, phoneNumber: string, code: string) => {
    const res = await AuthService.verifyPhoneOtp(countryCode, phoneNumber, code);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      StorageService.set('jopi_is_authenticated', true);
    }
    return res;
  };

  const signUp = async (data: SignUpData) => {
    const res = await AuthService.signUp(data);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      StorageService.set('jopi_is_authenticated', true);
    }
    return res;
  };

  const socialLogin = async (provider: 'google' | 'apple') => {
    return await AuthService.socialLogin(provider);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    StorageService.set('jopi_is_authenticated', false);
  };

  const deleteAccount = async () => {
    if (user?.id) {
      // حذف الحساب من جدول users المعتمد
      await supabase.from('users').delete().eq('id', user.id);
    }
    AuthService.deleteAccount();
    setUser(null);
    setIsAuthenticated(false);
    StorageService.set('jopi_is_authenticated', false);
  };

  const updateUser = async (fields: Partial<User>) => {
    const updated = UserService.updateCurrentUser(fields);
    if (updated) {
      setUser({ ...updated });
      if (updated.id) {
        await DatabaseService.saveProfile(updated);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user && !error) {
          let profile = await DatabaseService.getProfile(session.user.id);
          
          if (!profile && isMounted) {
            // إنشاء بروفايل أولي وحفظه في جدول users مباشرة
            profile = {
              id: session.user.id,
              custom_id: Math.floor(1000000 + Math.random() * 9000000).toString(),
              email: session.user.email || '',
              display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'مستخدم',
              profile_photo: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              photos: [session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || ''],
              gender: 'male',
              country: 'المملكة العربية السعودية',
              city: 'الرياض',
              bio: '',
              interests: [],
              languages: ['العربية'],
              is_online: true,
              last_seen: new Date().toISOString(),
              is_verified: true,
              vip_level: 0,
              coin_balance: 50,
              role: 'user',
              auth_provider: 'google',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await DatabaseService.saveProfile(profile);
          }

          if (profile && isMounted) {
            setUser(profile);
            UserService.updateCurrentUser(profile);
            setIsAuthenticated(true);
            StorageService.set('jopi_is_authenticated', true);
          }
        } else {
          const localUser = AuthService.getCurrentUser();
          const localAuth = StorageService.get<boolean>('jopi_is_authenticated', false) || AuthService.isAuthenticated();
          
          if (localUser && localAuth && isMounted) {
            setUser(localUser);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Init Auth Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        const profile = await DatabaseService.getProfile(session.user.id);
        if (profile) {
          setUser(profile);
          UserService.updateCurrentUser(profile);
          setIsAuthenticated(true);
          StorageService.set('jopi_is_authenticated', true);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setUser(null);
        setIsAuthenticated(false);
        StorageService.set('jopi_is_authenticated', false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isOnboarded,
      login,
      signUp,
      sendPhoneOtp,
      verifyPhoneOtp,
      socialLogin,
      logout,
      deleteAccount,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};