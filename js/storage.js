/**
 * Lưu ảnh và cấu hình bền vững.
 *
 *  - Ảnh và album tự thêm: IndexedDB (ảnh tải lên là chuỗi base64, dễ vượt hạn
 *    mức 5MB của localStorage nên không dùng localStorage cho phần này).
 *  - Cấu hình: localStorage, vì nhỏ và cần đọc đồng bộ ngay lúc khởi động.
 *
 * Safari trên iOS cũ đôi khi chặn IndexedDB (chế độ riêng tư) — mọi hàm đều có
 * đường lui sang localStorage thay vì ném lỗi.
 */

const DB_NAME = 'SmartPhotoFrameDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const ALBUM_STORE = 'albums';

class PhotoFrameStorage {
  constructor() {
    this.db = null;
    this.isReady = this.initDB();
  }

  initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using localStorage fallback.');
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const photoStore = db.createObjectStore(PHOTO_STORE, {keyPath: 'id'});
          photoStore.createIndex('albumId', 'albumId', {unique: false});
        }
        if (!db.objectStoreNames.contains(ALBUM_STORE)) {
          db.createObjectStore(ALBUM_STORE, {keyPath: 'id'});
        }
      };
    });
  }

  /* ------------------------------------------------------------- Ảnh */

  async getAllCustomPhotos() {
    await this.isReady;
    if (!this.db) {
      try {
        const data = localStorage.getItem('spf_custom_photos');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(PHOTO_STORE, 'readonly');
        const req = tx.objectStore(PHOTO_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async savePhoto(photo) {
    await this.isReady;
    if (!this.db) {
      try {
        const photos = await this.getAllCustomPhotos();
        const updated = [...photos.filter((p) => p.id !== photo.id), photo];
        localStorage.setItem('spf_custom_photos', JSON.stringify(updated));
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
        const req = tx.objectStore(PHOTO_STORE).put(photo);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async deletePhoto(id) {
    await this.isReady;
    if (!this.db) {
      try {
        const photos = await this.getAllCustomPhotos();
        localStorage.setItem(
          'spf_custom_photos',
          JSON.stringify(photos.filter((p) => p.id !== id))
        );
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(PHOTO_STORE, 'readwrite');
        const req = tx.objectStore(PHOTO_STORE).delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  /* ----------------------------------------------------------- Album */

  async getCustomAlbums() {
    await this.isReady;
    if (!this.db) {
      try {
        const data = localStorage.getItem('spf_custom_albums');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(ALBUM_STORE, 'readonly');
        const req = tx.objectStore(ALBUM_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  async saveAlbum(album) {
    await this.isReady;
    if (!this.db) {
      try {
        const albums = await this.getCustomAlbums();
        const updated = [...albums.filter((a) => a.id !== album.id), album];
        localStorage.setItem('spf_custom_albums', JSON.stringify(updated));
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(ALBUM_STORE, 'readwrite');
        const req = tx.objectStore(ALBUM_STORE).put(album);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  /* --------------------------------------------------------- Cấu hình */

  /** Đọc một nhóm cấu hình, trộn lên giá trị mặc định để thiếu khóa vẫn chạy. */
  getSettings(key, defaults) {
    try {
      const data = localStorage.getItem(key);
      return data ? {...defaults, ...JSON.parse(data)} : {...defaults};
    } catch (e) {
      return {...defaults};
    }
  }

  saveSettings(key, settings) {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) {
      /* hết dung lượng hoặc chế độ riêng tư: bỏ qua, phiên này vẫn chạy */
    }
  }

  getActiveAlbumId() {
    try {
      return localStorage.getItem('spf_active_album') || 'all';
    } catch (e) {
      return 'all';
    }
  }

  saveActiveAlbumId(albumId) {
    try {
      localStorage.setItem('spf_active_album', albumId);
    } catch (e) {
      /* bỏ qua */
    }
  }
}

export const photoStorage = new PhotoFrameStorage();

/** Khóa localStorage của từng nhóm cấu hình. */
export const KEYS = {
  frame: 'spf_frame_settings',
  widget: 'spf_widget_settings',
  night: 'spf_night_settings',
  sound: 'spf_sound_settings',
};
