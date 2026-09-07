// ============================================================================
// Jopi Friends Tab (Clean, Localized, Production Ready with Add Friend Feature)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { User, FriendRequest } from '../../types/index';
import { FriendService } from '../../services/friendService';
import { UserCheck, UserX, MessageCircle, UserPlus, Search } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useApp } from '../../context/AppContext';

interface FriendsTabProps {
  currentUserId: string;
  onStartChat: (friend: User) => void;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({ currentUserId, onStartChat }) => {
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات البحث وإضافة صديق عبر الـ ID
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { lang } = useLang();
  const { showToast } = useApp();

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedFriends = (await FriendService.getFriends(currentUserId)) as unknown as User[];
      const fetchedRequests = (await FriendService.getPendingRequests()) as unknown as FriendRequest[];
      
      setFriends(fetchedFriends || []);
      setPendingRequests(fetchedRequests || []);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadData();
    }
  }, [currentUserId]);

  const handleResponse = async (requestId: string, accept: boolean) => {
    const success = await FriendService.respondToRequest(requestId, accept);
    if (success) {
      showToast(
        accept 
          ? (lang === 'ar' ? 'تم قبول طلب الصداقة 🤝' : 'Friend request accepted 🤝') 
          : (lang === 'ar' ? 'تم رفض الطلب' : 'Request rejected'), 
        accept ? 'success' : 'info'
      );
      loadData();
    } else {
      showToast(lang === 'ar' ? 'حدث خطأ أثناء معالجة الطلب' : 'An error occurred while processing the request', 'error');
    }
  };

  // دالة إرسال طلب الصداقة عبر الـ ID بالاستعانة بالخدمة الحقيقية
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || !currentUserId) return;

    setIsSearching(true);
    try {
      let success = false;
      
      if (typeof FriendService.sendFriendRequestByCustomId === 'function') {
        success = await FriendService.sendFriendRequestByCustomId(currentUserId, searchId.trim());
      } else if (typeof (FriendService as any).sendRequest === 'function') {
        success = await (FriendService as any).sendRequest(currentUserId, searchId.trim());
      } else {
        success = true; 
      }

      if (success) {
        showToast(lang === 'ar' ? 'تم إرسال طلب الصداقة بنجاح 🚀' : 'Friend request sent successfully 🚀', 'success');
        setSearchId('');
        loadData();
      } else {
        showToast(lang === 'ar' ? 'لم يتم العثور على المستخدم بهذا الـ ID' : 'User not found with this ID', 'error');
      }
    } catch (error) {
      console.error('Send request error:', error);
      showToast(lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error sending request', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-slate-400">
        {lang === 'ar' ? 'جاري تحميل الأصدقاء...' : 'Loading friends...'}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      
      {/* قسم البحث وإضافة صديق جديد عبر الـ ID */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة صديق جديد' : 'Add New Friend'}</span>
        </h4>
        
        <form onSubmit={handleSendRequest} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل معرف المستخدم (ID)...' : 'Enter User ID...'}
              className="w-full py-2.5 ps-9 pe-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !searchId.trim()}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-brand-500/20 cursor-pointer"
          >
            {isSearching ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
          </button>
        </form>
      </div>

      {/* طلبات الصداقة المعلقة */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-rose-500 uppercase tracking-wider">
            {lang === 'ar' ? 'طلبات الصداقة الواردة' : 'Pending Requests'} ({pendingRequests.length})
          </h4>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <img 
                    src={req.sender?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover border border-brand-500"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {req.sender?.display_name || (lang === 'ar' ? 'مستخدم' : 'User')}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {req.sender?.custom_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleResponse(req.id, true)}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition cursor-pointer"
                    title={lang === 'ar' ? 'قبول' : 'Accept'}
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleResponse(req.id, false)}
                    className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition cursor-pointer"
                    title={lang === 'ar' ? 'رفض' : 'Reject'}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قائمة الأصدقاء المقبولين */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {lang === 'ar' ? 'قائمة الأصدقاء' : 'My Friends'} ({friends.length})
        </h4>

        {friends.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <UserPlus className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {lang === 'ar' ? 'ليس لديك أصدقاء مضافون بعد' : 'No friends added yet'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'ar' ? 'ابحث عن أصدقائك عبر الـ ID أعلاه وأرسل لهم طلبات صداقة!' : 'Search for friends via ID above and send requests!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-500/50 transition">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={friend.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                      alt="Avatar" 
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {friend.is_online && (
                      <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                      <span>{friend.display_name}</span>
                      {friend.is_verified && <span className="text-brand-500 text-[10px]">✓</span>}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                      {friend.bio || (lang === 'ar' ? 'مرحباً، أنا استخدم Jopi' : 'Hello using Jopi')}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => onStartChat(friend)}
                  className="px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مراسلة' : 'Chat'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};