// ============================================================================
// jopi Voice & Video Calling Modals
// Fullscreen calling interfaces with duration counter, audio pulse, video stream mock & controls
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Video, VideoOff, RefreshCw, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';
import { CallService } from '../../services/callService';

export const VoiceCallModal: React.FC = () => {
  const { 
    callSession, 
    acceptCall,
    endActiveCall, 
    toggleCallMute, 
    toggleCallSpeaker 
  } = useApp();
  const { t } = useLang();
  
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const isRinging = callSession?.status === 'ringing';
  const isOutgoing = (callSession as any)?.isOutgoing;
  const isIncoming = isRinging && isOutgoing === false; 

  useEffect(() => {
    if (isRinging && isIncoming) {
      ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(() => {});
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, [isRinging, isIncoming]);

  if (!callSession || callSession.call_type !== 'voice') return null;

  const displayUser = isOutgoing ? callSession.receiver : callSession.caller;
  const minutes = Math.floor(callSession.duration_seconds / 60);
  const seconds = callSession.duration_seconds % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-brand-950 to-slate-950 text-white flex flex-col items-center justify-between py-12 px-6 select-none">
      
      {/* عنصر الصوت الحقيقي لحل مشكلة المتصفح */}
      <audio id="remote-media-element" autoPlay playsInline className="hidden" />

      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isRinging ? (isIncoming ? 'مكالمة صوتية واردة...' : 'جاري الاتصال...') : 'مكالمة صوتية مشفرة'}</span>
        </div>
        <h2 className="text-2xl font-black">{displayUser.display_name}</h2>
        {!isRinging && (
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-widest text-emerald-400 font-bold">
            {timeFormatted}
          </p>
        )}
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-56 h-56 rounded-full bg-brand-500/20 blur-xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute w-44 h-44 rounded-full border border-brand-500/40 pointer-events-none"
        />

        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl shadow-brand-500/50 z-10">
          <img
            src={displayUser.profile_photo}
            alt={displayUser.display_name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {isRinging ? (
        isIncoming ? (
          <div className="w-full max-w-xs flex items-center justify-around gap-4">
            <button
              onClick={endActiveCall}
              className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>رفض</span>
            </button>
            <button
              onClick={acceptCall}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer animate-pulse"
            >
              <Phone className="w-5 h-5" />
              <span>قبول</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={endActiveCall}
              className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        )
      ) : (
        <div className="w-full max-w-xs flex items-center justify-around">
          <button
            onClick={toggleCallMute}
            className={`p-4 rounded-full transition active:scale-95 shadow-lg ${
              callSession.is_muted 
                ? 'bg-rose-500/80 text-white' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="Mute Mic"
          >
            {callSession.is_muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={endActiveCall}
            className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <button
            onClick={toggleCallSpeaker}
            className={`p-4 rounded-full transition active:scale-95 shadow-lg ${
              callSession.is_speaker_on 
                ? 'bg-brand-600 text-white' 
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="Speaker"
          >
            {callSession.is_speaker_on ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      )}
    </div>
  );
};

export const VideoCallModal: React.FC = () => {
  const { 
    callSession, 
    acceptCall,
    endActiveCall, 
    toggleCallMute, 
    toggleCallVideo, 
    switchCallCamera 
  } = useApp();

  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const isRinging = callSession?.status === 'ringing';
  const isOutgoing = (callSession as any)?.isOutgoing;
  const isIncoming = isRinging && isOutgoing === false;

  useEffect(() => {
    if (isRinging && isIncoming) {
      ringtoneRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(() => {});
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    }

    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, [isRinging, isIncoming]);

  // ربط كاميرتك المحلية (أنت) بالمربع الصغير عند الرد
  useEffect(() => {
    if (!isRinging && callSession?.status === 'connected') {
      const localVideo = document.getElementById('local-media-element') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = CallService.getLocalStream();
      }
    }
  }, [isRinging, callSession?.status, callSession?.is_video_enabled, callSession?.id]);

  if (!callSession || callSession.call_type !== 'video') return null;

  const displayUser = isOutgoing ? callSession.receiver : callSession.caller;
  const minutes = Math.floor(callSession.duration_seconds / 60);
  const seconds = callSession.duration_seconds % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* REMOTE VIDEO STREAM */}
      <div className="absolute inset-0 z-0">
        <img
          src={displayUser.profile_photo}
          alt={displayUser.display_name}
          className="absolute inset-0 w-full h-full object-cover filter blur-xs -z-10"
        />
        {/* الكاميرا الحقيقية للطرف الآخر */}
        <video id="remote-media-element" autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold drop-shadow">{displayUser.display_name}</h2>
          <span className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
            {isRinging ? (isIncoming ? 'مكالمة فيديو واردة...' : 'جاري الاتصال...') : timeFormatted}
          </span>
        </div>

        {/* LOCAL PIP CAMERA FEED */}
        {!isRinging && (
          <div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl bg-slate-800">
            <video id="local-media-element" autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>

      {isRinging ? (
        isIncoming ? (
          <div className="relative z-10 p-8 flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-black/90 to-transparent">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-500 shadow-2xl animate-bounce">
              <img src={displayUser.profile_photo} alt="Caller" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-center gap-4 w-full max-w-xs">
              <button
                onClick={endActiveCall}
                className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>رفض</span>
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Video className="w-5 h-5" />
                <span>قبول</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 p-8 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 to-transparent">
            <button
              onClick={endActiveCall}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )
      ) : (
        <div className="relative z-10 p-8 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 to-transparent">
          <button
            onClick={toggleCallMute}
            className={`p-3.5 rounded-full transition active:scale-95 shadow-lg cursor-pointer ${
              callSession.is_muted ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {callSession.is_muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCallVideo}
            className={`p-3.5 rounded-full transition active:scale-95 shadow-lg cursor-pointer ${
              !callSession.is_video_enabled ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {!callSession.is_video_enabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={switchCallCamera}
            className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={endActiveCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
};