// ============================================================================
// Jopi Sugo-Style Live Voice & Video Chat Room Experience (Fixed & Complete)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Minimize2, Mic, MicOff, Video, 
  Crown, Gift as GiftIcon, Sparkles, Send, Dices, 
  Smile, Users, Plus, Check, Radio 
} from 'lucide-react';
import { VoiceRoom, RoomMessage } from '../../types';
import { RoomService, MicAnimationPayload, MicAnimationType } from '../../services/roomService';
import { AudioService } from '../../services/audioService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { RoomGiftModal, SoundEffectsBar } from './RoomGiftModal';
import { supabase } from '../../services/supabaseClient';

export const LiveRoomModal: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
    activeRoom, 
    isRoomMinimized, 
    closeRoom, 
    minimizeRoom, 
    setRoomGiftModal, 
    setViewingUser,
    showToast 
  } = useApp();
  const { t } = useLang();

  const [room, setRoom] = useState<VoiceRoom | null>(activeRoom);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isFollowingHost, setIsFollowingHost] = useState(false);
  const [stageMode, setStageType] = useState<'audio' | 'video'>(activeRoom?.type || 'audio');
  const [soundBarOpen, setSoundBarOpen] = useState(false);
  const [micAnimations, setMicAnimations] = useState<MicAnimationPayload[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRoom) {
      setRoom(activeRoom);
      setStageType(activeRoom.type);
      setMessages(RoomService.getRoomMessages(activeRoom.id));
      setMicAnimations(RoomService.getMicAnimations(activeRoom.id));

      if (currentUser) {
        RoomService.sendRoomMessage(
          activeRoom.id,
          `انضم ${currentUser.display_name} إلى الغرفة ✨ مرحباً به!`,
          currentUser,
          'entry'
        );
        setMessages(RoomService.getRoomMessages(activeRoom.id));
      }
    }
  }, [activeRoom?.id]);

  // Realtime subscription for room updates
  useEffect(() => {
    if (!room?.id) return;

    const roomSubscription = supabase
      .channel(`public:rooms:id=eq.${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRoom(payload.new as VoiceRoom);
          }
        }
      )
      .subscribe();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [room?.id]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      AudioService.stopMicrophone();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeRoom || !room || isRoomMinimized || !currentUser) return null;

  const mySeat = room.seats?.find(s => s.user?.id === currentUser.id);

  const handleTakeSeat = async (seatIndex: number) => {
    const stream = await AudioService.startMicrophone();
    if (!stream) {
      showToast('تعذر الوصول إلى الميكروفون، يرجى السماح باستخدام الميكروفون من المتصفح', 'error');
      return;
    }

    const updated = await RoomService.takeSeat(room.id, seatIndex, currentUser);
    if (updated) {
      setRoom({ ...updated });
      setMessages(RoomService.getRoomMessages(room.id));
      showToast(`صعدت على المايك رقم ${seatIndex + 1} وصوتك حي الآن 🎙️`, 'success');
    }
  };

  const handleLeaveSeat = async () => {
    AudioService.stopMicrophone();
    const updated = await RoomService.leaveSeat(room.id, currentUser);
    if (updated) {
      setRoom({ ...updated });
      setMessages(RoomService.getRoomMessages(room.id));
      showToast('غادرت المايك وتستمع كجمهور الآن', 'info');
    }
  };

  const handleToggleMyMic = async () => {
    if (mySeat) {
      const isMuted = await RoomService.toggleSeatMute(room.id, mySeat.seat_index);
      AudioService.toggleMicrophone(isMuted);
      setRoom(prev => {
        if (!prev || !prev.seats) return prev;
        const newSeats = [...prev.seats];
        newSeats[mySeat.seat_index].is_muted = isMuted;
        newSeats[mySeat.seat_index].is_speaking = !isMuted;
        return { ...prev, seats: newSeats };
      });
      showToast(isMuted ? 'تم كتم المايك' : 'المايك مفتوح وصوتك مباشر 🎙️', 'info');
    }
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    RoomService.sendRoomMessage(room.id, chatInput.trim(), currentUser, 'chat');
    setMessages(RoomService.getRoomMessages(room.id));
    setChatInput('');
  };

  const handleRollDice = () => {
    const value = RoomService.rollDice(room.id, currentUser);
    setMessages(RoomService.getRoomMessages(room.id));
    showToast(`🎲 حصلت على الرقم ${value}!`, 'success');
  };

  const handleSendMicAnimation = (seatIndex: number, type: MicAnimationType) => {
    RoomService.sendMicAnimation(room.id, currentUser, seatIndex, type);
    setMicAnimations(RoomService.getMicAnimations(room.id));
  };

  const handleFollowHost = () => {
    setIsFollowingHost(prev => !prev);
    showToast(
      !isFollowingHost ? `تمت متابعة المضيف ${room.host?.display_name || 'المضيف'} ❤️` : 'تم إلغاء المتابعة',
      'info'
    );
  };

  const handleCloseRoomWithAudioStop = () => {
    AudioService.stopMicrophone();
    closeRoom();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-b ${room.bg_theme} text-white flex flex-col justify-between overflow-hidden select-none`}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -top-20 -start-20 pointer-events-none"
      />

      {/* Header */}
      <div className="relative z-20 px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 p-1.5 pe-3 rounded-full border border-white/10">
          <div 
            onClick={() => room.host && setViewingUser(room.host)}
            className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400 cursor-pointer flex-shrink-0"
          >
            <img src={room.host?.profile_photo} alt={room.host?.display_name} className="w-full h-full object-cover" />
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400 absolute bottom-0 end-0" />
          </div>

          <div className="min-w-0 cursor-pointer" onClick={() => room.host && setViewingUser(room.host)}>
            <h3 className="text-xs font-black truncate max-w-[90px]">{room.host?.display_name}</h3>
            <p className="text-[9px] text-slate-300 truncate">{room.title}</p>
          </div>

          <button
            type="button"
            onClick={handleFollowHost}
            className={`px-2 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
              isFollowingHost
                ? 'bg-white/20 text-slate-200'
                : 'bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-sm'
            }`}
          >
            {isFollowingHost ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
            <span>{isFollowingHost ? 'متابع' : 'متابعة'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-slate-200">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{room.audience_count}</span>
          </div>

          <button
            type="button"
            onClick={() => setStageType(prev => prev === 'audio' ? 'video' : 'audio')}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white text-xs transition cursor-pointer"
          >
            {stageMode === 'video' ? <Video className="w-4 h-4 text-cyan-400" /> : <Mic className="w-4 h-4 text-rose-400" />}
          </button>

          <button
            type="button"
            onClick={minimizeRoom}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white transition active:scale-95 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCloseRoomWithAudioStop}
            className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-700 text-white transition active:scale-95 shadow-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Seats Stage (8 Mics Sugo Style) */}
      <div className="relative z-10 flex-1 flex flex-col justify-start px-4 pt-3 pb-2 overflow-y-auto">
        {stageMode === 'audio' ? (
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 py-2">
            {room.seats?.map((seat) => {
              const hasUser = !!seat.user;
              const isSeatHost = seat.seat_index === 0;
              const isMeOnSeat = seat.user?.id === currentUser.id;
              const latestAnim = micAnimations.filter(a => a.targetSeatIndex === seat.seat_index).slice(-1)[0];

              return (
                <div key={seat.seat_index} className="flex flex-col items-center gap-1 relative">
                  <div
                    onClick={() => {
                      if (hasUser) {
                        setViewingUser(seat.user!);
                        handleSendMicAnimation(seat.seat_index, 'heart');
                      } else {
                        handleTakeSeat(seat.seat_index);
                      }
                    }}
                    className="relative cursor-pointer group"
                  >
                    <AnimatePresence>
                      {latestAnim && (
                        <motion.div
                          key={latestAnim.id}
                          initial={{ scale: 0.5, y: 10, opacity: 0 }}
                          animate={{ scale: [1, 1.4, 1], y: -25, opacity: [1, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5 }}
                          className="absolute -top-10 start-1/2 -translate-x-1/2 z-30 text-2xl filter drop-shadow-lg pointer-events-none"
                        >
                          {latestAnim.animationType === 'heart' && '❤️'}
                          {latestAnim.animationType === 'kiss' && '😘'}
                          {latestAnim.animationType === 'rose' && '🌹'}
                          {latestAnim.animationType === 'fire' && '🔥'}
                          {latestAnim.animationType === 'laugh' && '😂'}
                          {latestAnim.animationType === 'applause' && '👏'}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {hasUser && seat.is_speaking && !seat.is_muted && (
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className={`absolute -inset-1.5 rounded-full blur-xs pointer-events-none ${
                          isSeatHost ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                    )}

                    <div
                      className={`relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform group-hover:scale-105 shadow-xl ${
                        isSeatHost
                          ? 'border-amber-400 bg-amber-950/60'
                          : hasUser
                          ? 'border-brand-400 bg-brand-950/60'
                          : 'border-dashed border-white/30 bg-white/10 hover:border-white/60'
                      }`}
                    >
                      {hasUser ? (
                        <img
                          src={seat.user?.profile_photo}
                          alt={seat.user?.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white/50 group-hover:text-white">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                          <span className="text-[9px] font-bold">{seat.seat_index + 1}</span>
                        </div>
                      )}
                    </div>

                    {isSeatHost && (
                      <span className="absolute -top-2 start-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 p-1 rounded-full shadow-md z-10">
                        <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
                      </span>
                    )}

                    {hasUser && seat.is_muted && (
                      <span className="absolute -bottom-1 end-0 bg-rose-500 text-white p-0.5 rounded-full shadow border border-white z-10">
                        <MicOff className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {isMeOnSeat && (
                      <span className="absolute -top-1 end-0 bg-brand-500 text-white text-[8px] font-black px-1 rounded-full border border-white z-10">
                        أنت
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-bold truncate max-w-[70px] ${isSeatHost ? 'text-amber-300' : 'text-slate-200'}`}>
                    {hasUser ? seat.user?.display_name.split(' ')[0] : `مايك ${seat.seat_index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-64 rounded-3xl overflow-hidden border border-white/20 bg-slate-950 shadow-2xl relative">
            <img
              src={room.host?.profile_photo}
              alt={room.host?.display_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            <div className="absolute bottom-3 start-3 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{room.host?.display_name} (بث مرئي مباشر)</span>
            </div>
          </div>
        )}

        {/* Live Messages Stream */}
        <div className="mt-auto max-h-48 overflow-y-auto space-y-1.5 p-1 scrollbar-none text-xs">
          {messages.map((msg) => {
            const isEntry = msg.message_type === 'entry';
            const isGift = msg.message_type === 'gift';
            const isGame = msg.message_type === 'game';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 max-w-full"
              >
                {isGift ? (
                  <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-900/80 via-rose-900/80 to-amber-900/80 border border-amber-400/40 text-amber-200 shadow-lg flex items-center gap-2">
                    <span className="text-xl animate-bounce">{msg.gift_data?.icon || '🎁'}</span>
                    <div className="text-[11px] leading-tight">
                      <strong className="text-white">{msg.sender?.display_name}</strong> {msg.text}
                    </div>
                  </div>
                ) : isEntry ? (
                  <div className="px-2.5 py-0.5 rounded-full bg-black/40 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{msg.text}</span>
                  </div>
                ) : isGame ? (
                  <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                    <span>{msg.sender?.display_name}: </span>
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 max-w-[85%] text-slate-100 flex items-baseline gap-1.5">
                    <strong 
                      onClick={() => msg.sender && setViewingUser(msg.sender)}
                      className="text-brand-300 font-extrabold cursor-pointer hover:underline text-[11px]"
                    >
                      {msg.sender?.display_name}:
                    </strong>
                    <span className="text-xs">{msg.text}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
      </div>

      {soundBarOpen && (
        <SoundEffectsBar
          roomId={room.id}
          user={currentUser}
          onClose={() => setSoundBarOpen(false)}
        />
      )}

      {/* Bottom Room Controls Bar */}
      <div className="relative z-20 p-3 bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center gap-2">
        <form onSubmit={handleSendChat} className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="دردش مع رواد الغرفة..."
            className="flex-1 py-2.5 px-3.5 rounded-2xl bg-white/15 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-inner"
          />
          {chatInput.trim() && (
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>

        {mySeat ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleMyMic}
              className={`p-2.5 rounded-2xl shadow-lg transition active:scale-95 cursor-pointer ${
                mySeat.is_muted ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white animate-pulse'
              }`}
            >
              {mySeat.is_muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleLeaveSeat}
              className="px-2.5 py-2.5 rounded-2xl bg-white/20 text-white text-[11px] font-bold cursor-pointer"
            >
              نزول
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleTakeSeat(1)}
            className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>صعود</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setSoundBarOpen(prev => !prev)}
          className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-amber-300 shadow-md transition active:scale-95 cursor-pointer"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleRollDice}
          className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-cyan-300 shadow-md transition active:scale-95 cursor-pointer"
        >
          <Dices className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setRoomGiftModal({
            isOpen: true,
            room,
            targetName: room.host?.display_name || 'المضيف',
            targetCount: 1,
          })}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <GiftIcon className="w-5 h-5" />
        </button>
      </div>

      <RoomGiftModal />
    </div>
  );
};

export const FloatingRoomPlayer: React.FC = () => {
  const { activeRoom, isRoomMinimized, maximizeRoom, closeRoom } = useApp();

  if (!activeRoom || !isRoomMinimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      className="fixed bottom-20 end-4 z-40 p-2.5 rounded-3xl bg-slate-900/95 text-white border border-brand-500 shadow-2xl backdrop-blur-xl flex items-center gap-3 cursor-pointer select-none max-w-[220px]"
      onClick={maximizeRoom}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
        <img src={activeRoom.host?.profile_photo} alt="Host" className="w-full h-full object-cover" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 end-0 border border-black animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-black truncate">{activeRoom.title}</h4>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{activeRoom.audience_count} يستمعون</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          closeRoom();
        }}
        className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};