/**
 * Quản lý lưu trữ ảnh & cấu hình bền vững với IndexedDB
 * Tương thích tốt với Safari iOS trên iPad/iPhone cũ
 */

import { FrameSettings, NightModeSettings, PhotoAlbum, PhotoItem, SoundSettings, WidgetSettings } from '../types';

const DB_NAME = 'SmartPhotoFrameDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const ALBUM_STORE = 'albums';

export class PhotoFrameStorage {
  private db: IDBDatabase | null = null;
  private isReady: Promise<boolean>;

  constructor() {
    this.isReady = this.initDB();
  }

  private initDB(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using memory/local fallback.');
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const photoStore = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
          photoStore.createIndex('albumId', 'albumId', { unique: false });
        }
        if (!db.objectStoreNames.contains(ALBUM_STORE)) {
          db.createObjectStore(ALBUM_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  // --- Photo CRUD ---
  public async getAllCustomPhotos(): Promise<PhotoItem[]> {
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
        const tx = this.db!.transaction(PHOTO_STORE, 'readonly');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  public async savePhoto(photo: PhotoItem): Promise<boolean> {
    await this.isReady;
    if (!this.db) {
      try {
        const photos = await this.getAllCustomPhotos();
        const updated = [...photos.filter(p => p.id !== photo.id), photo];
        localStorage.setItem('spf_custom_photos', JSON.stringify(updated));
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(PHOTO_STORE, 'readwrite');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.put(photo);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  public async deletePhoto(id: string): Promise<boolean> {
    await this.isReady;
    if (!this.db) {
      try {
        const photos = await this.getAllCustomPhotos();
        const updated = photos.filter(p => p.id !== id);
        localStorage.setItem('spf_custom_photos', JSON.stringify(updated));
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(PHOTO_STORE, 'readwrite');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // --- Albums CRUD ---
  public async getCustomAlbums(): Promise<PhotoAlbum[]> {
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
        const tx = this.db!.transaction(ALBUM_STORE, 'readonly');
        const store = tx.objectStore(ALBUM_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });
  }

  public async saveAlbum(album: PhotoAlbum): Promise<boolean> {
    await this.isReady;
    if (!this.db) {
      try {
        const albums = await this.getCustomAlbums();
        const updated = [...albums.filter(a => a.id !== album.id), album];
        localStorage.setItem('spf_custom_albums', JSON.stringify(updated));
        return true;
      } catch (e) {
        return false;
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(ALBUM_STORE, 'readwrite');
        const store = tx.objectStore(ALBUM_STORE);
        const req = store.put(album);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // --- Settings Persistence ---
  public getFrameSettings(defaults: FrameSettings): FrameSettings {
    try {
      const data = localStorage.getItem('spf_frame_settings');
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch (e) {
      return defaults;
    }
  }

  public saveFrameSettings(settings: FrameSettings) {
    try {
      localStorage.setItem('spf_frame_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  public getWidgetSettings(defaults: WidgetSettings): WidgetSettings {
    try {
      const data = localStorage.getItem('spf_widget_settings');
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch (e) {
      return defaults;
    }
  }

  public saveWidgetSettings(settings: WidgetSettings) {
    try {
      localStorage.setItem('spf_widget_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  public getNightModeSettings(defaults: NightModeSettings): NightModeSettings {
    try {
      const data = localStorage.getItem('spf_night_settings');
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch (e) {
      return defaults;
    }
  }

  public saveNightModeSettings(settings: NightModeSettings) {
    try {
      localStorage.setItem('spf_night_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  public getSoundSettings(defaults: SoundSettings): SoundSettings {
    try {
      const data = localStorage.getItem('spf_sound_settings');
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch (e) {
      return defaults;
    }
  }

  public saveSoundSettings(settings: SoundSettings) {
    try {
      localStorage.setItem('spf_sound_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  public getActiveAlbumId(): string {
    return localStorage.getItem('spf_active_album') || 'all';
  }

  public saveActiveAlbumId(albumId: string) {
    localStorage.setItem('spf_active_album', albumId);
  }
}

export const photoStorage = new PhotoFrameStorage();
