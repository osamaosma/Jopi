// ============================================================================
// Nova Main Application Root Component
// Fully Responsive Mobile-First & Cloud Connected
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

// Main Feature Screens
import { DiscoverScreen } from './components/discover/DiscoverScreen';
import { PartyScreen } from './components/party/PartyScreen';
import { MatchesScreen } from './components/matches/MatchesScreen';
import { ChatScreen } from './components/chat/ChatScreen';
import { MomentsScreen } from './components/moments/MomentsScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';

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
  const { activeTab, activeConversation } = useApp();
  const [showSplash, setShowSplash] = useState(false);

  // التقاط توكن OAuth القادم من Google وإدارته تلقائياً عند الإقلاع
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        localStorage.setItem('mingleup_is_authenticated', 'true');
        // إذا كان هناك هاش توكن في الرابط، نقوم بتنظيفه لتجنب التكرار
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });
  }, []);

  // Initialize Real-time WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.init(user);
      const u = user as any;
      console.log('[App] Real-time socket initialized for user:', u.display_name || u.name || u.id);
    }
  }, [isAuthenticated, user]);
  

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!isOnboarded) {
    return <ProfileOnboarding />;
  }

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden transition-colors select-none">
      
      {/* App Header */}
      <Header />

      {/* Main Content Area - Expands to Fill Entire Screen */}
      <main className="w-full flex-1 flex flex-col pb-20 overflow-y-auto">
        {activeTab === 'discover' && <DiscoverScreen />}
        {activeTab === 'party' && <PartyScreen />}
        {activeTab === 'messages' && (
          activeConversation ? <ChatScreen /> : <MatchesScreen />
        )}
        {activeTab === 'wallet' && <MomentsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Bottom Navigation Fixed */}
      <BottomNav />

      {/* Live Party Rooms Modals & Floating PiP Player */}
      <LiveRoomModal />
      <CreateRoomModal />
      <FloatingRoomPlayer />

      {/* Other Modals & Overlays */}
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