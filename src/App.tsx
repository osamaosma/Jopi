// ============================================================================
// Nova Main Application Root Component (Direct Integration & Friends Tab Native)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { LangProvider } from './context/LangContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Services
import { socketService } from './services/socketService';
import { supabase } from './services/supabaseClient';

// Common Components
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';

// Auth Components
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthScreen } from './components/auth/AuthScreen';
import { ProfileOnboarding } from './components/auth/ProfileOnboarding';
import { PhoneAuth } from './components/auth/PhoneAuth';

// Main Feature Screens
import { DiscoverScreen } from './components/discover/DiscoverScreen';
import { PartyScreen } from './components/party/PartyScreen';
import { MatchesScreen } from './components/matches/MatchesScreen';
import { ChatScreen } from './components/chat/ChatScreen';
import { MomentsScreen } from './components/moments/MomentsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FriendsTab } from './components/chat/FriendsTab'; // شاشة الأصدقاء المستقلة

// Party Rooms Components
import { LiveRoomModal, FloatingRoomPlayer } from './components/party/LiveRoomModal';
import { CreateRoomModal } from './components/party/CreateRoomModal';

// Modals & Overlays
import { MatchCelebrationModal } from './components/discover/MatchCelebrationModal';
import { FilterModal } from './components/discover/FilterModal';
import { GiftStoreModal } from './components/gifts/GiftStoreModal';
import { VoiceCallModal, VideoCallModal } from './components/calls/VoiceCallModal';
import { EditProfileModal } from './components/profile/EditProfileModal';
import { OtherUserProfileModal } from './components/profile/OtherUserProfileModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { ReportModal } from './components/settings/BlockedUsersModal';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isOnboarded, user } = useAuth();
  const { activeTab, activeConversation, setActiveConversation, setActiveTab } = useApp();
  const [showSplash, setShowSplash] = useState(false);
  const [authMode, setAuthMode] = useState<'selection' | 'phone'>('selection');

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        localStorage.setItem('mingleup_is_authenticated', 'true');
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.init(user);
    }
  }, [isAuthenticated, user]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen min-h-[100dvh] bg-white dark:bg-slate-950 flex flex-col justify-center items-center p-4">
        {authMode === 'selection' ? (
          <div className="w-full max-w-md flex flex-col gap-4">
            <AuthScreen />
            <button
              onClick={() => setAuthMode('phone')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm cursor-pointer"
            >
              Sign in with Phone Number
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col gap-4">
            <PhoneAuth />
            <button
              onClick={() => setAuthMode('selection')}
              className="w-full py-2 px-4 text-slate-600 dark:text-slate-400 hover:underline text-sm cursor-pointer"
            >
              Back to standard sign-in options
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!isOnboarded) {
    return <ProfileOnboarding />;
  }

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors select-none">
      
      {/* App Header */}
      <Header />

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col pb-20 overflow-y-auto">
        {activeTab === 'discover' && <DiscoverScreen />}
        {activeTab === 'party' && <PartyScreen />}
        
        {/* إذا كان التبويب messages وactiveConversation موجود تفتح شاشة الدردشة، وإلا تعرض شاشة المطابقات */}
        {activeTab === 'messages' && (
          activeConversation ? <ChatScreen /> : <MatchesScreen />
        )}

        {/* الدمج المباشر لشاشة الأصدقاء كشاشة رئيسية مستقلة */}
        {activeTab === 'friends' && (
          <FriendsTab 
            currentUserId={user?.id || ''} 
            onStartChat={(friend) => {
              setActiveConversation({
                id: `conv_${friend.id}`,
                partner: friend,
                unread_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              setActiveTab('messages'); // الانتقال التلقائي للرسائل عند بدء المحادثة
            }} 
          />
        )}

        {activeTab === 'wallet' && <MomentsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Bottom Navigation Fixed */}
      <BottomNav />

      {/* Modals & Overlays */}
      <LiveRoomModal />
      <CreateRoomModal />
      <FloatingRoomPlayer />
      <MatchCelebrationModal />
      <FilterModal />
      <GiftStoreModal />
      <VoiceCallModal />
      <VideoCallModal />
      <EditProfileModal />
      <OtherUserProfileModal />
      <NotificationDrawer />
      <ReportModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LangProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <MainAppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </LangProvider>
  );
}