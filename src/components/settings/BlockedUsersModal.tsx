// ============================================================================
// MingleUp Blocked Users Modal & Report User Modal
// Safety, Privacy moderation tools and reporting reasons handling
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { BlockedUser, ReportReason } from '../../types';
import { UserService } from '../../services/userService';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const BlockedUsersModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBlockedUsers(UserService.getBlockedUsers());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnblock = (userId: string, name: string) => {
    UserService.unblockUser(userId);
    setBlockedUsers(UserService.getBlockedUsers());
    showToast(`تم إلغاء حظر ${name}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm">المستخدمون المحظورون</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2.5 my-3">
          {blockedUsers.length > 0 ? (
            blockedUsers.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-700">
                    <img
                      src={item.user?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[120px]">
                    {item.user?.display_name || 'مستخدم'}
                  </span>
                </div>

                <button
                  onClick={() => handleUnblock(item.blocked_id, item.user?.display_name || 'المستخدم')}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-xs font-bold transition"
                >
                  إلغاء الحظر
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-center py-6 text-slate-400">
              قائمة الحظر فارغة حالياً.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const ReportModal: React.FC = () => {
  const { reportModal, setReportModal, showToast } = useApp();
  const { t } = useLang();

  const [reason, setReason] = useState<ReportReason>('Spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!reportModal.isOpen || !reportModal.targetUser) return null;

  const targetUser = reportModal.targetUser;

  const reasonsList: ReportReason[] = [
    'Spam',
    'Fake Profile',
    'Harassment',
    'Inappropriate Content',
    'Scam',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    UserService.reportUser(targetUser.id, reason, description);
    setSubmitting(false);

    showToast('تم استلام بلاغك وسيقوم فريق الإشراف بمراجعته فوراً 🛡️', 'success');
    setReportModal({ isOpen: false, targetUser: null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm">الإبلاغ عن مستخدم</h3>
          </div>
          <button
            onClick={() => setReportModal({ isOpen: false, targetUser: null })}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          أنت تبلغ عن: <strong className="text-slate-800 dark:text-white">{targetUser.display_name}</strong>. يرجى اختيار سبب الإبلاغ:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5">سبب البلاغ</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {reasonsList.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">تفاصيل إضافية (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="اكتب توضيحاً لمساعدة فريق الإشراف..."
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportModal({ isOpen: false, targetUser: null })}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
