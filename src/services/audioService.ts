// ============================================================================
// jopi WebRTC Audio Service (Stable Mesh Signaling Version - Fixed & Separated)
// ============================================================================

import { supabase } from './supabaseClient';

export class AudioService {
  private static localStream: MediaStream | null = null;
  private static peerConnections: Map<string, RTCPeerConnection> = new Map();
  private static remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
  private static pendingCandidates: Map<string, any[]> = new Map();
  private static currentRoomId: string | null = null;
  private static currentUserId: string | null = null;
  private static signalingChannel: any = null;

  private static rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  /**
   * الانضمام إلى الغرفة كمستمع فقط وتفعيل الاستقبال الفوري ومبادرة الاتصال
   */
  static joinRoomAsListener(roomId: string, userId: string): void {
    this.currentRoomId = roomId;
    this.currentUserId = userId;
    this.initSignaling(roomId, userId);
    this.setupAutoplayUnlock();

    // إرسال طلب انضمام فوري ومبادرة لطلب الاتصال من المتواجدين
    setTimeout(() => {
      this.broadcastJoin(userId);
    }, 500);
  }

  /**
   * تشغيل الميكروفون الفعلي للمستخدم عند الصعود على المايك وبث صوته للجميع
   */
  static async startMicrophone(roomId?: string, userId?: string): Promise<MediaStream | null> {
    if (roomId && userId) {
      this.currentRoomId = roomId;
      this.currentUserId = userId;
      this.initSignaling(roomId, userId);
      this.setupAutoplayUnlock();
    }

    try {
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }, 
          video: false 
        });
      }

      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;

        // ربط تراك الصوت المحلي بجميع الاتصالات المفتوحة الحالية لبث الصوت للجمهور
        for (const [remoteUserId, pc] of this.peerConnections.entries()) {
          try {
            const senders = pc.getSenders();
            const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
            if (audioSender) {
              await audioSender.replaceTrack(audioTrack);
            } else {
              pc.addTrack(audioTrack, this.localStream);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              this.sendSignal(remoteUserId, { type: 'offer', offer });
            }
          } catch (err) {
            console.error('[AudioService] Error attaching track to peer:', err);
          }
        }
      }

      // إشعار جميع الحضور في الغرفة بأن هذا المستخدم بدأ التحدث
      if (this.currentUserId) {
        this.broadcastSpeaking(this.currentUserId);
      }

      return this.localStream;
    } catch (error) {
      console.error('[AudioService] Error accessing microphone:', error);
      return null;
    }
  }

  private static initSignaling(roomId: string, userId: string) {
    if (this.currentRoomId === roomId && this.signalingChannel) {
      this.broadcastJoin(userId);
      return;
    }
    
    this.currentRoomId = roomId;
    this.currentUserId = userId;

    if (this.signalingChannel) {
      supabase.removeChannel(this.signalingChannel);
    }

    this.signalingChannel = supabase.channel(`room-audio-${roomId}`, {
      config: { broadcast: { self: false } }
    });

    this.signalingChannel
      .on('broadcast', { event: 'webrtc-signal' }, async ({ payload }: any) => {
        if (!payload || payload.targetUserId !== this.currentUserId) return;

        const senderId = payload.senderId;
        let pc = this.peerConnections.get(senderId);

        if (!pc) {
          pc = this.createPeerConnection(senderId);
        }

        try {
          if (payload.type === 'offer') {
            if (pc.signalingState !== 'stable') {
              await pc.setLocalDescription({ type: 'rollback' } as any).catch(() => {});
            }
            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
            await this.flushPendingCandidates(senderId, pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendSignal(senderId, { type: 'answer', answer });
          } else if (payload.type === 'answer') {
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
              await this.flushPendingCandidates(senderId, pc);
            }
          } else if (payload.type === 'candidate' && payload.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } else {
              let queue = this.pendingCandidates.get(senderId) || [];
              queue.push(payload.candidate);
              this.pendingCandidates.set(senderId, queue);
            }
          }
        } catch (e) {
          console.error('[WebRTC Signaling Error]:', e);
        }
      })
      .on('broadcast', { event: 'user-joined-room' }, async ({ payload }: any) => {
        if (!payload || payload.userId === this.currentUserId) return;
        
        const remoteUserId = payload.userId;
        let pc = this.peerConnections.get(remoteUserId);
        if (!pc) {
          pc = this.createPeerConnection(remoteUserId);
        }

        // إذا لم نكن نرسل صوتاً، نقوم بإنشاء Offer لاستقبال صوت الطرف الآخر فوراً
        if (!this.localStream || !this.localStream.getAudioTracks().some(t => t.enabled)) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(remoteUserId, { type: 'offer', offer });
          } catch (e) {
            console.error('[AudioService] Error creating initial offer for listener:', e);
          }
        }
      })
      .on('broadcast', { event: 'user-speaking' }, async ({ payload }: any) => {
        if (!payload || payload.userId === this.currentUserId) return;
        
        const speakerId = payload.userId;
        let pc = this.peerConnections.get(speakerId);
        if (!pc) {
          pc = this.createPeerConnection(speakerId);
        }
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.broadcastJoin(userId);
        }
      });
  }

  private static async flushPendingCandidates(senderId: string, pc: RTCPeerConnection) {
    const queue = this.pendingCandidates.get(senderId);
    if (queue && queue.length > 0) {
      while (queue.length > 0) {
        const cand = queue.shift();
        if (cand) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(err => {
            console.error('[AudioService] Error adding queued ICE candidate:', err);
          });
        }
      }
      this.pendingCandidates.delete(senderId);
    }
  }

  private static broadcastJoin(userId: string) {
    if (!this.signalingChannel) return;
    this.signalingChannel.send({
      type: 'broadcast',
      event: 'user-joined-room',
      payload: { userId }
    });
  }

  private static broadcastSpeaking(userId: string) {
    if (!this.signalingChannel) return;
    this.signalingChannel.send({
      type: 'broadcast',
      event: 'user-speaking',
      payload: { userId }
    });
  }

  private static createPeerConnection(remoteUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.rtcConfig);

    // إذا كان المستخدم متحدثاً ولديه مايك يعمل، يرسل صوته
    if (this.localStream && this.localStream.getAudioTracks().length > 0) {
      this.localStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    } else {
      // إذا كان مستمعاً فقط في الجمهور، يستقبل الصوت فقط لسماع المتحدثين
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    pc.ontrack = (event) => {
      let audioEl = this.remoteAudioElements.get(remoteUserId);
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        (audioEl as any).playsInline = true;
        audioEl.style.display = 'none';
        document.body.appendChild(audioEl);
        this.remoteAudioElements.set(remoteUserId, audioEl);
      }
      
      const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
      audioEl.srcObject = stream;
      audioEl.play().catch(e => {
        console.warn('[AudioService] Audio play blocked, awaiting user click:', e);
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(remoteUserId, { type: 'candidate', candidate: event.candidate });
      }
    };

    this.peerConnections.set(remoteUserId, pc);
    return pc;
  }

  private static setupAutoplayUnlock() {
    const unlock = () => {
      this.remoteAudioElements.forEach(audio => {
        if (audio.paused && audio.srcObject) {
          audio.play().catch(() => {});
        }
      });
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  private static sendSignal(targetUserId: string, data: any) {
    if (!this.signalingChannel || !this.currentUserId) return;
    this.signalingChannel.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: { ...data, senderId: this.currentUserId, targetUserId }
    });
  }

  static async toggleMicrophone(mute: boolean): Promise<void> {
    if (mute) {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
    } else {
      if (!this.localStream) {
        await this.startMicrophone();
      } else {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      }
    }
  }

  /**
   * إيقاف ميكروفون المستخدم فقط عند النزول من المايك مع إبقائه قادراً على الاستماع للغرفة
   */
  static stopLocalMicrophoneOnly(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    for (const pc of this.peerConnections.values()) {
      pc.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          pc.removeTrack(sender);
        }
      });
    }
  }

  /**
   * إغلاق شبكة الصوت بالكامل عند الخروج النهائي من الغرفة
   */
  static stopMicrophone(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.pendingCandidates.clear();

    this.remoteAudioElements.forEach(audio => {
      audio.pause();
      audio.srcObject = null;
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    });
    this.remoteAudioElements.clear();

    if (this.signalingChannel) {
      supabase.removeChannel(this.signalingChannel);
      this.signalingChannel = null;
    }
    this.currentRoomId = null;
    this.currentUserId = null;
  }
}