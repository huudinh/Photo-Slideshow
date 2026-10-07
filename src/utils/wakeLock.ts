/**
 * Bộ quản lý giữ sáng màn hình đa nền tảng (Screen Wake Lock)
 * Tương thích cả thiết bị hiện đại và các dòng iPad/iPhone cũ (iOS 12+)
 */

class ScreenWakeLockManager {
  private wakeLockSentinel: any = null;
  private isSupported: boolean = false;
  private fallbackAudio: HTMLAudioElement | null = null;
  private isActive: boolean = false;

  constructor() {
    this.isSupported = 'wakeLock' in navigator;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      document.addEventListener('fullscreenchange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange() {
    if (this.isActive && document.visibilityState === 'visible') {
      this.requestWakeLock();
    }
  }

  public async requestWakeLock(): Promise<boolean> {
    this.isActive = true;

    // 1. Phương thức chuẩn W3C Screen Wake Lock API
    if (this.isSupported) {
      try {
        if (!this.wakeLockSentinel || this.wakeLockSentinel.released) {
          // @ts-ignore
          this.wakeLockSentinel = await navigator.wakeLock.request('screen');
          this.wakeLockSentinel.addEventListener('release', () => {
            if (this.isActive && document.visibilityState === 'visible') {
              this.requestWakeLock();
            }
          });
          return true;
        }
      } catch (err) {
        console.warn('Screen WakeLock API error, activating fallback:', err);
      }
    }

    // 2. Phương thức dự phòng cho Safari iOS cũ (iPhone 6, iPad 2/3/4/mini):
    // Sử dụng file audio tĩnh im lặng dạng Data URI lặp vô tận (silent loop)
    try {
      if (!this.fallbackAudio) {
        // Tín hiệu WAV im lặng 0.5s dạng base64
        const silentAudioUri = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.fallbackAudio = new Audio(silentAudioUri);
        this.fallbackAudio.loop = true;
        this.fallbackAudio.volume = 0.01;
      }
      this.fallbackAudio.play().catch(() => {
        // Có thể cần người dùng tương tác trước khi phát trên iOS cũ
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public releaseWakeLock() {
    this.isActive = false;
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch (e) {}
      this.wakeLockSentinel = null;
    }
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
      } catch (e) {}
    }
  }

  public getStatus(): boolean {
    return this.isActive;
  }
}

export const wakeLockManager = new ScreenWakeLockManager();
