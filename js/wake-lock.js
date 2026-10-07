/**
 * Giữ sáng màn hình, chạy được cả trên máy mới lẫn iPad/iPhone đời cũ.
 *
 * Ưu tiên Screen Wake Lock API chuẩn W3C. Safari trên iOS cũ (iPad 2/3/4/mini,
 * iPhone 6) không có API đó nên rơi về mẹo phát một đoạn audio im lặng lặp vô
 * tận — iOS coi tab đang phát media nên không tắt màn.
 */

class ScreenWakeLockManager {
  constructor() {
    this.wakeLockSentinel = null;
    this.isSupported = 'wakeLock' in navigator;
    this.fallbackAudio = null;
    this.isActive = false;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    document.addEventListener('fullscreenchange', this.handleVisibilityChange);
  }

  /** Quay lại tab là xin lại khóa — hệ điều hành tự nhả khi ẩn tab. */
  handleVisibilityChange() {
    if (this.isActive && document.visibilityState === 'visible') {
      this.requestWakeLock();
    }
  }

  async requestWakeLock() {
    this.isActive = true;

    if (this.isSupported) {
      try {
        if (!this.wakeLockSentinel || this.wakeLockSentinel.released) {
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

    try {
      if (!this.fallbackAudio) {
        // WAV im lặng dạng Data URI, phát lặp vô tận.
        const silentAudioUri =
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.fallbackAudio = new Audio(silentAudioUri);
        this.fallbackAudio.loop = true;
        this.fallbackAudio.volume = 0.01;
      }
      this.fallbackAudio.play().catch(() => {
        // iOS cũ đòi người dùng chạm một lần trước khi cho phát.
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  releaseWakeLock() {
    this.isActive = false;
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch (e) {
        /* đã nhả rồi */
      }
      this.wakeLockSentinel = null;
    }
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
      } catch (e) {
        /* chưa từng phát */
      }
    }
  }

  getStatus() {
    return this.isActive;
  }
}

export const wakeLockManager = new ScreenWakeLockManager();
