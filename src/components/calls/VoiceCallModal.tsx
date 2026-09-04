// ============================================================================
// MingleUp Voice & Video Calling Modals
// Fullscreen calling interfaces with duration counter, audio pulse, video stream mock & controls
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Video, VideoOff, RefreshCw, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLang } from '../../context/LangContext';

export const VoiceCallModal: React.FC = () => {
  const { 
    callSession, 
    endActiveCall, 
    toggleCallMute, 
    toggleCallSpeaker 
  } = useApp();
  const { t } = useLang();

  if (!callSession || callSession.call_type !== 'voice') return null;

  const partner = callSession.receiver;
  const minutes = Math.floor(callSession.duration_seconds / 60);
  const seconds = callSession.duration_seconds % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-brand-950 to-slate-950 text-white flex flex-col items-center justify-between py-12 px-6 select-none">
      
      {/* Top Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>مكالمة صوتية مشفرة</span>
        </div>
        <h2 className="text-2xl font-black">{partner.display_name}</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono tracking-widest text-emerald-400 font-bold">
          {timeFormatted}
        </p>
      </div>

      {/* Pulsing Avatar Centerpiece */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Acoustic Rings */}
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

        {/* Main Avatar */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl shadow-brand-500/50 z-10">
          <img
            src={partner.profile_photo}
            alt={partner.display_name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls Dock */}
      <div className="w-full max-w-xs flex items-center justify-around">
        {/* Mute Button */}
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

        {/* End Call Button */}
        <button
          onClick={endActiveCall}
          className="p-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>

        {/* Speaker Button */}
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

    </div>
  );
};

export const VideoCallModal: React.FC = () => {
  const { 
    callSession, 
    endActiveCall, 
    toggleCallMute, 
    toggleCallVideo, 
    switchCallCamera 
  } = useApp();

  if (!callSession || callSession.call_type !== 'video') return null;

  const partner = callSession.receiver;
  const minutes = Math.floor(callSession.duration_seconds / 60);
  const seconds = callSession.duration_seconds % 60;
  const timeFormatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      
      {/* REMOTE VIDEO STREAM (Full Screen Simulation) */}
      <div className="absolute inset-0 z-0">
        <img
          src={partner.profile_photo}
          alt={partner.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* TOP HEADER */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold drop-shadow">{partner.display_name}</h2>
          <span className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded-full border border-white/20">
            {timeFormatted}
          </span>
        </div>

        {/* LOCAL PIP CAMERA FEED */}
        <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
            alt="Self"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* CONTROLS DOCK */}
      <div className="relative z-10 p-8 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 to-transparent">
        {/* Mute */}
        <button
          onClick={toggleCallMute}
          className={`p-3.5 rounded-full transition active:scale-95 shadow-lg ${
            callSession.is_muted ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          {callSession.is_muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video On/Off */}
        <button
          onClick={toggleCallVideo}
          className={`p-3.5 rounded-full transition active:scale-95 shadow-lg ${
            !callSession.is_video_enabled ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          {!callSession.is_video_enabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Switch Camera Front/Back */}
        <button
          onClick={switchCallCamera}
          className="p-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 shadow-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* End Call */}
        <button
          onClick={endActiveCall}
          className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-600/50 hover:scale-110 active:scale-95 transition"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
};
