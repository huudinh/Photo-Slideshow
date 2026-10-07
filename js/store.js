/**
 * Kho trạng thái của cả ứng dụng — thay cho useState của React.
 *
 * Cách dùng: đọc `store.state`, ghi bằng `store.set({...})`. Mỗi lần ghi, các
 * hàm đã đăng ký qua `store.subscribe()` được gọi lại; phần vẽ giao diện tự so
 * chữ ký để biết vùng nào cần vẽ lại (xem js/app.js).
 *
 * Trạng thái cố ý để PHẲNG một cấp cho dễ so sánh. Bốn nhóm cấu hình giữ dạng
 * object vì chúng được lưu nguyên khối xuống localStorage.
 */

import {DEFAULT_ALBUMS, DEFAULT_PHOTOS, getRandomQuote} from './data.js';
import {KEYS, photoStorage} from './storage.js';

const DEFAULT_FRAME = {
  theme: 'oak-wood',
  matteSize: 'thin',
  matteColor: 'ivory',
  hasInnerBevel: true,
  hasDropShadow: true,
  slideshowInterval: 15,
  transition: 'ken-burns',
  shuffle: false,
  autoSplitPortrait: true,
  orientation: 'auto',
  rotation: 0,
  layoutMode: 'single',
};

const DEFAULT_WIDGET = {
  showClock: true,
  clockType: 'digital',
  showLunarDate: true,
  showWeather: true,
  useGPS: true,
  weatherCity: 'Hà Nội',
  showPhotoInfo: true,
  showFamilyQuote: true,
  customQuote: '',
  showAnniversary: true,
  anniversaries: [
    {id: 'an-1', title: 'Tết Nguyên Đán', date: '2027-02-06', icon: '🏮'},
    {id: 'an-2', title: 'Kỷ niệm Ngày Gia Đình', date: '2026-06-28', icon: '👨‍👩‍👧‍👦'},
  ],
  widgetPosition: 'bottom-left',
  widgetSize: 'md',
  overlayOpacity: 0.95,
};

const DEFAULT_NIGHT = {
  enabled: true,
  startHour: 22,
  startMinute: 0,
  endHour: 6,
  endMinute: 0,
  dimLevel: 0.2,
  clockColor: 'amber',
  enablePixelShift: true,
};

const DEFAULT_SOUND = {
  track: 'off',
  volume: 0.4,
};

class Store {
  constructor() {
    this.listeners = new Set();

    this.state = {
      // --- Dữ liệu ---
      photos: DEFAULT_PHOTOS,
      albums: DEFAULT_ALBUMS,
      activeAlbumId: photoStorage.getActiveAlbumId(),
      currentIndex: 0,
      isPlaying: true,
      currentQuote: getRandomQuote(),
      isDevicePortrait: window.innerHeight > window.innerWidth,

      // --- Trạng thái giao diện ---
      /** null | 'settings' | 'photos' | 'kiosk' | 'ios-install' */
      openModal: null,
      isNightModeActive: false,
      isFullscreen: false,
      isWakeLockActive: false,
      isOnline: navigator.onLine,
      weather: null,

      // --- Trạng thái tạm của giao diện ---
      /** Menu đang bật trên thanh điều khiển: null|'album'|'theme'|'sound'|'orientation' */
      openMenu: null,
      controlsVisible: true,
      /** Kiểu chuyển động Ken Burns đang dùng (1..3), đổi vòng mỗi lần sang ảnh. */
      kenBurnsIndex: 1,
      /** Cài được PWA không — bật khi trình duyệt bắn beforeinstallprompt. */
      canInstall: false,
      isIOS: /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()),

      // --- Form trong hộp thoại Cài đặt ---
      settingsTab: 'orientation',
      gpsStatus: null,
      isLocating: false,
      annivTitle: '',
      annivDate: '',

      // --- Form trong hộp thoại Quản lý ảnh ---
      pmAlbumId: 'all',
      pmUploading: false,
      pmShowAlbumForm: false,
      pmShowUrlForm: false,
      pmAlbumName: '',
      pmAlbumDesc: '',
      pmUrl: '',
      pmUrlTitle: '',

      // --- Cấu hình (lưu xuống localStorage) ---
      frame: photoStorage.getSettings(KEYS.frame, DEFAULT_FRAME),
      widget: photoStorage.getSettings(KEYS.widget, DEFAULT_WIDGET),
      night: photoStorage.getSettings(KEYS.night, DEFAULT_NIGHT),
      sound: photoStorage.getSettings(KEYS.sound, DEFAULT_SOUND),
    };
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  /** Ghi đè nông vào state rồi báo cho mọi nơi vẽ lại. */
  set(patch) {
    Object.assign(this.state, patch);
    this.notify();
  }

  /**
   * Sửa một nhóm cấu hình và lưu luôn xuống localStorage.
   * @param {'frame'|'widget'|'night'|'sound'} section
   */
  setSettings(section, patch) {
    const next = {...this.state[section], ...patch};
    this.state[section] = next;
    photoStorage.saveSettings(KEYS[section], next);
    this.notify();
  }

  /* ------------------------------------------------ Dẫn xuất từ state */

  /**
   * Ảnh của album đang chọn.
   * Album rỗng thì trả về toàn bộ ảnh — thà chiếu nhầm album còn hơn hiện
   * khung đen, vì đây là khung tranh treo tường.
   */
  get albumPhotos() {
    const {photos, activeAlbumId} = this.state;
    if (activeAlbumId === 'all') return photos;
    const list = photos.filter((p) => p.albumId === activeAlbumId);
    return list.length > 0 ? list : photos;
  }

  get currentPhoto() {
    const list = this.albumPhotos;
    return list[this.state.currentIndex] || list[0] || DEFAULT_PHOTOS[0];
  }

  get nextPhoto() {
    const list = this.albumPhotos;
    if (list.length === 0) return undefined;
    return list[(this.state.currentIndex + 1) % list.length];
  }

  /* ------------------------------------------------------- Thao tác */

  next() {
    const list = this.albumPhotos;
    if (list.length <= 1) return;
    const step = this.state.frame.layoutMode === 'dual' ? 2 : 1;

    let nextIdx;
    if (this.state.frame.shuffle) {
      nextIdx = Math.floor(Math.random() * list.length);
      if (nextIdx === this.state.currentIndex) nextIdx = (nextIdx + 1) % list.length;
    } else {
      nextIdx = (this.state.currentIndex + step) % list.length;
    }

    // Thỉnh thoảng đổi câu châm ngôn cho đỡ lặp, không đổi mỗi lần sang ảnh.
    const patch = {currentIndex: nextIdx};
    if (Math.random() > 0.6) patch.currentQuote = getRandomQuote();
    this.set(patch);
  }

  prev() {
    const list = this.albumPhotos;
    if (list.length <= 1) return;
    const step = this.state.frame.layoutMode === 'dual' ? 2 : 1;
    this.set({currentIndex: (this.state.currentIndex - step + list.length) % list.length});
  }

  selectAlbum(albumId) {
    photoStorage.saveActiveAlbumId(albumId);
    this.set({activeAlbumId: albumId, currentIndex: 0});
  }

  /** Giữ chỉ số ảnh trong khoảng hợp lệ sau khi xóa ảnh hoặc đổi album. */
  clampIndex() {
    const len = this.albumPhotos.length;
    if (len === 0) return;
    if (this.state.currentIndex >= len) this.set({currentIndex: 0});
  }

  async addPhotos(newPhotos) {
    for (const photo of newPhotos) await photoStorage.savePhoto(photo);
    this.set({photos: [...this.state.photos, ...newPhotos]});
  }

  async deletePhoto(photoId) {
    await photoStorage.deletePhoto(photoId);
    this.set({photos: this.state.photos.filter((p) => p.id !== photoId)});
    this.clampIndex();
  }

  async createAlbum(name, description) {
    const album = {
      id: `custom-album-${Date.now()}`,
      name,
      description,
      isCustom: true,
    };
    await photoStorage.saveAlbum(album);
    this.set({albums: [...this.state.albums, album]});
  }

  resetDefaultPhotos() {
    photoStorage.saveActiveAlbumId('all');
    this.set({
      photos: DEFAULT_PHOTOS,
      albums: DEFAULT_ALBUMS,
      activeAlbumId: 'all',
      currentIndex: 0,
    });
  }

  /** Nạp ảnh và album người dùng đã tự thêm từ lần chạy trước. */
  async loadSavedData() {
    const [customPhotos, customAlbums] = await Promise.all([
      photoStorage.getAllCustomPhotos(),
      photoStorage.getCustomAlbums(),
    ]);

    const patch = {};
    if (customAlbums.length > 0) patch.albums = [...DEFAULT_ALBUMS, ...customAlbums];
    if (customPhotos.length > 0) patch.photos = [...DEFAULT_PHOTOS, ...customPhotos];
    if (Object.keys(patch).length > 0) this.set(patch);
  }
}

export const store = new Store();
