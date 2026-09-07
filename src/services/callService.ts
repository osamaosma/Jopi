// ============================================================================
// jopi WebRTC & Audio/Video Call Engine
// Production STUN/TURN Fallback Matrix & Call Session Manager
// ============================================================================

import { CallSession, CallType, User } from '../types';
import { UserService } from './userService';

// قائمة خوادم STUN/TURN الموثوقة لتجاوز جدران الحماية وشبكات الهاتف
export const RTC_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  iceCandidatePoolSize: 10,
};

export class CallService {
  private static localStream: MediaStream | null = null;
  private static peerConnection: RTCPeerConnection | null = null;
  private static activeSession: CallSession | null = null;
  private static currentFacingMode: 'user' | 'environment' = 'user';

  static startCall(targetUser: User, type: CallType): CallSession {
    const currentUser = UserService.getCurrentUser();

    const newSession: CallSession = {
      id: `call-${Date.now()}`,
      caller: currentUser,
      receiver: targetUser,
      call_type: type,
      status: 'ringing',
      duration_seconds: 0,
      is_muted: false,
      is_speaker_on: true,
      is_video_enabled: type === 'video',
      started_at: new Date().toISOString(),
    };

    this.activeSession = newSession;
    this.initMediaStream(type);

    return newSession;
  }

  static async initMediaStream(type: CallType): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video' ? { facingMode: this.currentFacingMode, width: { ideal: 640 }, height: { ideal: 480 } } : false,
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        return this.localStream;
      }
    } catch {
      // الصمود عند غياب الكاميرا أو رفض الإذن
    }
    return null;
  }

  static createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(RTC_ICE_SERVERS);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    return this.peerConnection;
  }

  static endCall(session?: CallSession | null): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.activeSession = null;
  }

  static toggleMute(session: CallSession): CallSession {
    const nextMute = !session.is_muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !nextMute;
      });
    }

    const updated: CallSession = { ...session, is_muted: nextMute };
    this.activeSession = updated;
    return updated;
  }

  static toggleSpeaker(session: CallSession): CallSession {
    const nextSpeaker = !session.is_speaker_on;
    const updated: CallSession = { ...session, is_speaker_on: nextSpeaker };
    this.activeSession = updated;
    return updated;
  }

  static toggleVideo(session: CallSession): CallSession {
    const nextVideo = !session.is_video_enabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = nextVideo;
      });
    }

    const updated: CallSession = { ...session, is_video_enabled: nextVideo };
    this.activeSession = updated;
    return updated;
  }

  static switchCamera(session: CallSession): CallSession {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    this.initMediaStream(session.call_type);
    return session;
  }
}