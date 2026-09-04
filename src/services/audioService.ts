// ============================================================================
// MingleUp WebRTC Audio Service for Live Voice Rooms (Complete Production Version)
// ============================================================================

export class AudioService {
  private static localStream: MediaStream | null = null;
  private static audioElement: HTMLAudioElement | null = null;

  // فتح ميكروفون المستخدم المحلي
  static async startMicrophone(): Promise<MediaStream | null> {
    try {
      if (this.localStream) return this.localStream;
      
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }, 
        video: false 
      });
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return null;
    }
  }

  // كتم أو إلغاء كتم المايك المحلي
  static toggleMicrophone(mute: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }

  // إيقاف المايك تماماً عند مغادرة الغرفة أو النزول من المايك
  static stopMicrophone(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // تشغيل الصوت الوارد من مشارك آخر
  static playRemoteStream(stream: MediaStream): void {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.autoplay = true;
    }
    this.audioElement.srcObject = stream;
    this.audioElement.play().catch(e => console.log('Audio play error:', e));
  }
}