// ============================================================================
// MingleUp Moments Screen (SUGO Style - Exact 3-Dots Menu, Share to Friends & Family)
// ============================================================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Plus, Image as ImageIcon, Video, Send, Sparkles, X, Users, Shield, AlertTriangle, EyeOff, VolumeX, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface Comment {
  id: string;
  name: string;
  text: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  profile_photo: string;
  is_online: boolean;
  is_verified: boolean;
}

interface Post {
  id: string;
  author: Author;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: number;
  isLiked: boolean;
  commentsList: Comment[];
  time: string;
}

export const MomentsScreen: React.FC = () => {
  const { user } = useAuth();
  const { showToast, setActiveTab, setActiveConversation } = useApp();

  const [newPostText, setNewPostText] = useState('');
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // حالات النوافذ المنبثقة المطابقة لـ SUGO
  const [menuPost, setMenuPost] = useState<Post | null>(null); // نافذة الـ 3 نقاط الرئيسية
  const [showShareToFriends, setShowShareToFriends] = useState(false); // شاشة مشاركة الأصدقاء
  const [searchQuery, setSearchQuery] = useState('');
  const [shareTab, setShareTab] = useState<'recent' | 'friends' | 'following' | 'followers'>('recent');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        id: 'user-sara',
        name: 'سارة خالد',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        badge: 'VIP 5',
        profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        is_online: true,
        is_verified: true
      },
      content: 'Estan todos invitados mis amores a compartir este PK DE CHICAS conmigo..espero contar contigo ❤️ Gracias desde ya por el apoyo y el cariño 🥰✨',
      mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
      mediaType: 'image',
      likes: 34,
      isLiked: false,
      commentsList: [
        { id: 'c1', name: 'عمر الفاروق', text: 'منورة يا سارة، بالتوفيق دائماً!' }
      ],
      time: '35 minutes ago'
    }
  ]);

  // قائمة الأصدقاء الوهمية لشاشة المشاركة (موافقة لصورة SUGO)
  const mockFriendsList = [
    { id: 'f1', name: '🍷 ℰℓiα', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', vip: 'VIP5', time: '22:31' },
    { id: 'f2', name: 'ملك ملوكه', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', vip: 'VIP3', time: '22:04' },
    { id: 'f3', name: 'دلال 🐺♯', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', vip: 'VIP1', time: '22:04' },
    { id: 'f4', name: '🍒نوراG*', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', vip: 'VIP2', time: '22:04' },
    { id: 'f5', name: 'ام روان 🥰💕', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', vip: 'VIP5', time: '22:03' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setMediaFileUrl(localUrl);
      setMediaType(type);
      showToast(type === 'image' ? 'تم اختيار الصورة بنجاح 🖼️' : 'تم اختيار الفيديو بنجاح 🎬', 'success');
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !mediaFileUrl) {
      showToast('يرجى كتابة نص أو اختيار صورة/فيديو من المعرض!', 'error');
      return;
    }

    const authUser = user as any;
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: authUser?.id || 'my-id',
        name: authUser?.display_name || 'أنا',
        avatar: authUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        badge: 'VIP',
        profile_photo: authUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_online: true,
        is_verified: true
      },
      content: newPostText,
      mediaUrl: mediaFileUrl,
      mediaType,
      likes: 0,
      isLiked: false,
      commentsList: [],
      time: 'الآن'
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setMediaFileUrl('');
    showToast('تم نشر اللحظة بنجاح! 📸✨', 'success');
  };

  const handleToggleLike = (postId: string) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        return { ...p, isLiked: nextLiked, likes: nextLiked ? p.likes + 1 : p.likes - 1 };
      }
      return p;
    }));
  };

  const handleSendHi = (author: Author) => {
    setActiveConversation({
      id: `conv-${author.id}`,
      partner: author as any,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setActiveTab('messages');
    showToast(`تم إرسال تحية ❤️ إلى ${author.name}`, 'success');
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    const authUser = user as any;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsList: [...p.commentsList, { id: Date.now().toString(), name: authUser?.display_name || 'أنا', text: commentText.trim() }]
        };
      }
      return p;
    }));
    setCommentText('');
    showToast('تم إضافة التعليق بنجاح 💬', 'success');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24 select-none space-y-4">
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileSelect(e, mediaType)} 
        accept={mediaType === 'image' ? 'image/*' : 'video/*'} 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-amber-500" /> اللحظات (Moments)
        </h1>
        <span className="text-[10px] text-slate-400 font-bold">تفاعل مع الأصدقاء</span>
      </div>

      {/* Quick Post Box */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handlePostSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            <img src={(user as any)?.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="Me" className="w-10 h-10 rounded-full object-cover" />
            <textarea
              rows={2}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="اكتب ما يدور في ذهنك، شارك لحظاتك..."
              className="w-full py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
            />
          </div>

          {mediaFileUrl && (
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700">
              {mediaType === 'video' ? (
                <video src={mediaFileUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={mediaFileUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button type="button" onClick={() => setMediaFileUrl('')} className="absolute top-2 end-2 p-1 rounded-full bg-black/60 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setMediaType('image'); fileInputRef.current?.click(); }} className="text-slate-500 hover:text-brand-500 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <ImageIcon className="w-4 h-4 text-brand-500" /> صورة من المعرض
              </button>
              <button type="button" onClick={() => { setMediaType('video'); fileInputRef.current?.click(); }} className="text-slate-500 hover:text-rose-500 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Video className="w-4 h-4 text-rose-500" /> فيديو قصير
              </button>
            </div>
            <button type="submit" className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition">
              نشر اللحظة
            </button>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={post.author.avatar} alt={post.author.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{post.author.name}</h3>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold">{post.author.badge}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{post.time}</span>
                </div>
              </div>
              
              <button onClick={() => handleSendHi(post.author)} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-rose-500/20 transition active:scale-95">
                ❤️ Hi
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {post.content}
            </p>

            {post.mediaUrl && (
              <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-black">
                {post.mediaType === 'video' ? (
                  <video controls className="w-full h-64 object-cover">
                    <source src={post.mediaUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img src={post.mediaUrl} alt="Post media" className="w-full h-64 object-cover" />
                )}
              </div>
            )}

            {/* Actions Bar - مطابقة تماماً لصورة SUGO (3 نقاط، اعجاب، تعليق) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              
              {/* زر الثلاث نقاط (...) لفتح نافذة مشاركة اللحظات والخيارات */}
              <button 
                onClick={() => setMenuPost(post)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl transition ${
                    post.isLiked ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} /> 
                  <span>{post.likes}</span>
                </button>

                <button 
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl text-slate-400 hover:text-brand-500 transition"
                >
                  <MessageCircle className="w-4 h-4" /> 
                  <span>{post.commentsList.length}</span>
                </button>
              </div>
            </div>

            {/* Comments Drawer */}
            <AnimatePresence>
              {activeCommentPostId === post.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5"
                >
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {post.commentsList.map(comm => (
                      <div key={comm.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white ml-1.5">{comm.name}:</span>
                        <span className="text-slate-600 dark:text-slate-300">{comm.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="اكتب تعليقاً..."
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button onClick={() => handleAddComment(post.id)} className="p-2 rounded-xl bg-brand-600 text-white shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

      {/* 1. SUGO Style Share Moments Bottom Sheet (مطابق للصورة الأولى) */}
      <AnimatePresence>
        {menuPost && !showShareToFriends && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 space-y-6"
            >
              <div className="text-center font-bold text-xs text-slate-400 uppercase tracking-wider">Share Moments</div>

              {/* أزرار مشاركة الأصدقاء والعائلة */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowShareToFriends(true)}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-md">
                    <Users className="w-7 h-7 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Friends</span>
                </button>

                <button
                  onClick={() => {
                    showToast('تمت مشاركة اللحظة في عائلة UCHIHA بنجاح 🏰❤️', 'success');
                    setMenuPost(null);
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-md">
                    <Shield className="w-7 h-7 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Family</span>
                </button>
              </div>

              {/* أزرار الإبلاغ والإخفاء وكتم المستخدم */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <button onClick={() => { showToast('تم إرسال الإبلاغ بنجاح 🛡️', 'info'); setMenuPost(null); }} className="flex flex-col items-center gap-1.5 p-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></div>
                  Report
                </button>
                <button onClick={() => { showToast('تم إخفاء هذا المنشور 👁️', 'info'); setMenuPost(null); }} className="flex flex-col items-center gap-1.5 p-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><EyeOff className="w-4 h-4" /></div>
                  Hide
                </button>
                <button onClick={() => { showToast('تم كتم المستخدم بنجاح 🔕', 'info'); setMenuPost(null); }} className="flex flex-col items-center gap-1.5 p-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><VolumeX className="w-4 h-4" /></div>
                  Mute this user
                </button>
              </div>

              <button onClick={() => setMenuPost(null)} className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                إلغاء
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SUGO Style Share To Friends Screen (مطابق للصورة الثانية تماماً) */}
      <AnimatePresence>
        {showShareToFriends && (
          <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white select-none">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowShareToFriends(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold">Share to</h2>
              <div className="w-5" />
            </div>

            {/* Tabs (Recent, Friends, Following, Followers) */}
            <div className="flex items-center justify-around border-b border-slate-100 dark:border-slate-800 px-2 text-xs font-semibold">
              {(['recent', 'friends', 'following', 'followers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setShareTab(tab)}
                  className={`py-3 capitalize transition relative ${shareTab === tab ? 'text-brand-600 font-bold' : 'text-slate-400'}`}
                >
                  {tab}
                  {shareTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="p-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID/Nickname"
                  className="w-full ps-9 pe-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Friends List with Share Button */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-6">
              {mockFriendsList.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="text-xs font-bold">{friend.name}</h4>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold">{friend.vip}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{friend.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast(`تمت مشاركة اللحظة بنجاح مع ${friend.name} 📤✨`, 'success');
                      setShowShareToFriends(false);
                      setMenuPost(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm"
                  >
                    Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};