// ============================================================================
// MingleUp Admin Moderation & Analytics Dashboard
// User management, verification toggles, ban actions, reports queue & economy analytics
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, ShieldAlert, CheckCircle2, 
  Ban, Coins, MessageCircle, Heart, Gift as GiftIcon, 
  TrendingUp, Search, Eye, ArrowRight, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { User, Report, CoinTransaction, GiftTransaction } from '../../types';
import { UserService } from '../../services/userService';
import { StorageService, STORAGE_KEYS } from '../../services/storageService';
import { MatchService } from '../../services/matchService';
import { ChatService } from '../../services/chatService';
import { GiftService } from '../../services/giftService';
import { WalletService } from '../../services/walletService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const AdminDashboard: React.FC = () => {
  const { setActiveTab, setViewingUser, showToast } = useApp();
  const { t, isRTL } = useLang();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'reports' | 'transactions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [giftTransactions, setGiftTransactions] = useState<GiftTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = () => {
    setUsers(UserService.getAllUsersForAdmin());
    setReports(StorageService.get<Report[]>(STORAGE_KEYS.REPORTS, []));
    setTransactions(WalletService.getTransactions());
    setGiftTransactions(GiftService.getGiftTransactions());
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalUsersCount = users.length;
  const activeMatchesCount = MatchService.getMatches().length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const totalCoinsCirculated = users.reduce((sum, u) => sum + (u.coin_balance || 0), 0);

  const handleToggleVerify = (userId: string) => {
    const newStatus = UserService.toggleUserVerification(userId);
    loadAdminData();
    showToast(newStatus ? 'تم منح علامة التوثيق للمستخدم ✓' : 'تم سحب التوثيق من المستخدم', 'info');
  };

  const handleToggleBan = (userId: string) => {
    const isBanned = UserService.toggleUserBan(userId);
    loadAdminData();
    showToast(isBanned ? 'تم حظر وتعطيل حساب المستخدم 🚫' : 'تم فك حظر حساب المستخدم', 'warning');
  };

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'action_taken') => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: action === 'dismiss' ? 'dismissed' : 'action_taken',
          action_notes: action === 'dismiss' ? 'تم رفض البلاغ بعد المراجعة' : 'تم اتخاذ إجراء تحذيري/حظر',
          updated_at: new Date().toISOString(),
        } as Report;
      }
      return r;
    });

    StorageService.set(STORAGE_KEYS.REPORTS, updated);
    setReports(updated);
    showToast(action === 'dismiss' ? 'تم رفض وتجاهل البلاغ' : 'تم اتخاذ الإجراء اللازم وإغلاق البلاغ', 'success');
  };

  const filteredUsers = users.filter(u => 
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none">
      
      {/* Top Banner & Exit Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white">
              {t('adminTitle')}
            </h1>
            <p className="text-[10px] text-slate-500">MingleUp Control Center</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('exitAdmin')}</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">{t('totalUsers')}</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{totalUsersCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">{t('activeMatches')}</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{activeMatchesCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">{t('pendingReports')}</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-500">{pendingReportsCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase">{t('totalCoins')}</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{totalCoinsCirculated.toLocaleString()}</div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeAdminTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('userManagement')} ({users.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeAdminTab === 'reports'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          البلاغات ({pendingReportsCount})
        </button>
        <button
          onClick={() => setActiveAdminTab('transactions')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeAdminTab === 'transactions'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          المعاملات
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو المدينة..."
              className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2"
              >
                <div 
                  onClick={() => setViewingUser(u)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-700">
                    <img src={u.profile_photo} alt={u.display_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {u.display_name}
                      </h4>
                      {u.is_verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                      {u.is_banned && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-bold">
                          محظور
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      <span className="text-brand-500 font-mono font-bold">ID: {u.custom_id || u.id.substring(0, 8)}</span> • {u.city}, {u.country} • {u.coin_balance} عملة
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleVerify(u.id)}
                    className={`p-2 rounded-xl text-[10px] font-bold transition ${
                      u.is_verified 
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                    title="Toggle Verification"
                  >
                    ✓
                  </button>

                  <button
                    onClick={() => handleToggleBan(u.id)}
                    className={`p-2 rounded-xl text-[10px] font-bold transition ${
                      u.is_banned 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50'
                    }`}
                    title="Toggle Ban"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS QUEUE */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((rep) => (
              <div
                key={rep.id}
                className={`p-4 rounded-2xl border ${
                  rep.status === 'pending'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {rep.reason}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  المُبلِغ: <span className="font-normal text-slate-500">{rep.reporter_name || 'مستخدم'}</span>
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  المُبلَغ عنه: <span className="font-bold text-rose-600 dark:text-rose-400">{rep.reported_user?.display_name || rep.reported_user_id}</span>
                </p>

                {rep.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2 rounded-xl mb-3">
                    "{rep.description}"
                  </p>
                )}

                {rep.status === 'pending' ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismiss')}
                      className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
                    >
                      تجاهل البلاغ
                    </button>
                    <button
                      onClick={() => {
                        handleResolveReport(rep.id, 'action_taken');
                        UserService.toggleUserBan(rep.reported_user_id);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition"
                    >
                      حظر المستخدم
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-semibold pt-1">
                    الحالة: {rep.status === 'dismissed' ? 'تم الرفض' : 'تم اتخاذ الإجراء'} ({rep.action_notes})
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-center py-10 text-slate-400">
              لا توجد بلاغات حالياً.
            </p>
          )}
        </div>
      )}

      {/* TAB 3: LIVE TRANSACTIONS STREAM */}
      {activeAdminTab === 'transactions' && (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-white">
                  {tx.description}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.transaction_type}
                </div>
              </div>
              <span className={`font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount} coins
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
