import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FrameSettings, 
  NightModeSettings, 
  PhotoAlbum, 
  PhotoItem, 
  SoundSettings, 
  WidgetSettings, 
  FrameTheme,
  SoundTrackType,
  OrientationMode,
  LayoutMode,
  ScreenRotation
} from './types';
import { DEFAULT_ALBUMS, DEFAULT_PHOTOS } from './data/defaultPhotos';
import { getRandomQuote } from './data/familyQuotes';
import { PhotoFrame } from './components/PhotoFrame';
import { SmartWidgets } from './components/SmartWidgets';
import { SmartHubPanel } from './components/SmartHubPanel';
import { ControlBar } from './components/ControlBar';
import { NightModeOverlay } from './components/NightModeOverlay';
import { SettingsModal } from './components/SettingsModal';
import { PhotoManagerModal } from './components/PhotoManagerModal';
import { KioskGuideModal } from './components/KioskGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { photoStorage } from './utils/storage';
import { wakeLockManager } from './utils/wakeLock';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  // --- Data State ---
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [albums, setAlbums] = useState<PhotoAlbum[]>(DEFAULT_ALBUMS);
  const [activeAlbumId, setActiveAlbumId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentQuote, setCurrentQuote] = useState<string>(getRandomQuote());
  const [isDevicePortrait, setIsDevicePortrait] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );

  // --- UI Modal States ---
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState<boolean>(false);
  const [isKioskGuideOpen, setIsKioskGuideOpen] = useState<boolean>(false);
  const [isNightModeActive, setIsNightModeActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);

  // --- Configuration State ---
  const [frameSettings, setFrameSettings] = useState<FrameSettings>(() => 
    photoStorage.getFrameSettings({
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
      layoutMode: 'single'
    })
  );

  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(() =>
    photoStorage.getWidgetSettings({
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
        { id: 'an-1', title: 'Tết Nguyên Đán', date: '2027-02-06', icon: '🏮' },
        { id: 'an-2', title: 'Kỷ niệm Ngày Gia Đình', date: '2026-06-28', icon: '👨‍👩‍👧‍👦' }
      ],
      widgetPosition: 'bottom-left',
      widgetSize: 'md',
      overlayOpacity: 0.95
    })
  );

  const [nightSettings, setNightSettings] = useState<NightModeSettings>(() =>
    photoStorage.getNightModeSettings({
      enabled: true,
      startHour: 22,
      startMinute: 0,
      endHour: 6,
      endMinute: 0,
      dimLevel: 0.2,
      clockColor: 'amber',
      enablePixelShift: true
    })
  );

  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() =>
    photoStorage.getSoundSettings({
      track: 'off',
      volume: 0.4
    })
  );

  // Monitor screen orientation changes (Landscape vs Portrait)
  useEffect(() => {
    const handleResize = () => {
      setIsDevicePortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Filter photos by active album
  const currentAlbumPhotos = React.useMemo(() => {
    if (activeAlbumId === 'all') return photos;
    const list = photos.filter(p => p.albumId === activeAlbumId);
    return list.length > 0 ? list : photos;
  }, [photos, activeAlbumId]);

  // Load custom photos and albums from IndexedDB on startup
  useEffect(() => {
    async function loadSavedData() {
      const customPhotos = await photoStorage.getAllCustomPhotos();
      const customAlbums = await photoStorage.getCustomAlbums();
      
      if (customAlbums.length > 0) {
        setAlbums([...DEFAULT_ALBUMS, ...customAlbums]);
      }
      if (customPhotos.length > 0) {
        setPhotos([...DEFAULT_PHOTOS, ...customPhotos]);
      }
      const savedActiveAlbum = photoStorage.getActiveAlbumId();
      if (savedActiveAlbum) {
        setActiveAlbumId(savedActiveAlbum);
      }
    }
    loadSavedData();
  }, []);

  // Request WakeLock to keep old iPad screen awake
  useEffect(() => {
    wakeLockManager.requestWakeLock().then(success => {
      setIsWakeLockActive(success);
    });

    const handleTouchStart = () => {
      wakeLockManager.requestWakeLock().then(success => {
        setIsWakeLockActive(success);
      });
    };

    window.addEventListener('click', handleTouchStart, { once: true });
    window.addEventListener('touchstart', handleTouchStart, { once: true });

    return () => {
      window.removeEventListener('click', handleTouchStart);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Auto Night Schedule Checker
  useEffect(() => {
    const checkNightSchedule = () => {
      if (!nightSettings.enabled) return;
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTotalMin = currentH * 60 + currentM;

      const startTotalMin = nightSettings.startHour * 60 + nightSettings.startMinute;
      const endTotalMin = nightSettings.endHour * 60 + nightSettings.endMinute;

      let isNight = false;
      if (startTotalMin > endTotalMin) {
        // Overnight, e.g. 22:00 to 06:00
        isNight = currentTotalMin >= startTotalMin || currentTotalMin < endTotalMin;
      } else {
        isNight = currentTotalMin >= startTotalMin && currentTotalMin < endTotalMin;
      }

      setIsNightModeActive(isNight);
    };

    checkNightSchedule();
    const timer = setInterval(checkNightSchedule, 30000); // Check every 30s
    return () => clearInterval(timer);
  }, [nightSettings]);

  // Soundscape track & volume sync
  useEffect(() => {
    if (isNightModeActive) {
      soundEngine.stop();
    } else {
      soundEngine.play(soundSettings.track, soundSettings.volume);
    }
  }, [soundSettings.track, soundSettings.volume, isNightModeActive]);

  // Slideshow advance timer
  const handleNextPhoto = useCallback(() => {
    if (currentAlbumPhotos.length <= 1) return;
    const step = frameSettings.layoutMode === 'dual' ? 2 : 1;
    if (frameSettings.shuffle) {
      let nextIdx = Math.floor(Math.random() * currentAlbumPhotos.length);
      if (nextIdx === currentIndex && currentAlbumPhotos.length > 1) {
        nextIdx = (nextIdx + 1) % currentAlbumPhotos.length;
      }
      setCurrentIndex(nextIdx);
    } else {
      setCurrentIndex(prev => (prev + step) % currentAlbumPhotos.length);
    }
    // Occasionally cycle family quote
    if (Math.random() > 0.6) {
      setCurrentQuote(getRandomQuote());
    }
  }, [currentAlbumPhotos, currentIndex, frameSettings.shuffle, frameSettings.layoutMode]);

  const handlePrevPhoto = useCallback(() => {
    if (currentAlbumPhotos.length <= 1) return;
    const step = frameSettings.layoutMode === 'dual' ? 2 : 1;
    setCurrentIndex(prev => (prev - step + currentAlbumPhotos.length) % currentAlbumPhotos.length);
  }, [currentAlbumPhotos, frameSettings.layoutMode]);

  useEffect(() => {
    if (!isPlaying || isNightModeActive || currentAlbumPhotos.length === 0) return;
    const intervalMs = (frameSettings.slideshowInterval || 15) * 1000;
    const timer = setInterval(() => {
      handleNextPhoto();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, isNightModeActive, frameSettings.slideshowInterval, handleNextPhoto, currentAlbumPhotos]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= currentAlbumPhotos.length) {
      setCurrentIndex(0);
    }
  }, [currentAlbumPhotos, currentIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || isPhotoManagerOpen || isKioskGuideOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPhoto();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNightModeActive(prev => !prev);
      } else if (e.key === 'o' || e.key === 'O') {
        // Toggle orientation
        const nextOrient: OrientationMode = 
          frameSettings.orientation === 'auto' ? 'landscape' :
          frameSettings.orientation === 'landscape' ? 'portrait' : 'auto';
        handleUpdateFrameSettings({ ...frameSettings, orientation: nextOrient });
      } else if (e.key === 'r' || e.key === 'R') {
        // Rotate +90deg
        const nextRot = ((frameSettings.rotation + 90) % 360) as ScreenRotation;
        handleUpdateFrameSettings({ ...frameSettings, rotation: nextRot });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPhoto, handlePrevPhoto, isSettingsOpen, isPhotoManagerOpen, isKioskGuideOpen, frameSettings]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Frame Settings Handlers
  const handleUpdateFrameSettings = (newSettings: FrameSettings) => {
    setFrameSettings(newSettings);
    photoStorage.saveFrameSettings(newSettings);
  };

  const handleUpdateWidgetSettings = (newSettings: WidgetSettings) => {
    setWidgetSettings(newSettings);
    photoStorage.saveWidgetSettings(newSettings);
  };

  const handleUpdateNightSettings = (newSettings: NightModeSettings) => {
    setNightSettings(newSettings);
    photoStorage.saveNightModeSettings(newSettings);
  };

  const handleUpdateSoundSettings = (newSettings: SoundSettings) => {
    setSoundSettings(newSettings);
    photoStorage.saveSoundSettings(newSettings);
  };

  const handleChangeTheme = (theme: FrameTheme) => {
    const updated = { ...frameSettings, theme };
    setFrameSettings(updated);
    photoStorage.saveFrameSettings(updated);
  };

  const handleChangeSoundTrack = (track: SoundTrackType) => {
    const updated = { ...soundSettings, track };
    setSoundSettings(updated);
    photoStorage.saveSoundSettings(updated);
  };

  const handleChangeSoundVolume = (volume: number) => {
    const updated = { ...soundSettings, volume };
    setSoundSettings(updated);
    photoStorage.saveSoundSettings(updated);
  };

  const handleSelectAlbum = (albumId: string) => {
    setActiveAlbumId(albumId);
    photoStorage.saveActiveAlbumId(albumId);
    setCurrentIndex(0);
  };

  // Orientation & Layout Handlers
  const handleChangeOrientation = (orientation: OrientationMode) => {
    const updated = { ...frameSettings, orientation };
    setFrameSettings(updated);
    photoStorage.saveFrameSettings(updated);
  };

  const handleRotateScreen = () => {
    const nextRotation = ((frameSettings.rotation + 90) % 360) as ScreenRotation;
    const updated = { ...frameSettings, rotation: nextRotation };
    setFrameSettings(updated);
    photoStorage.saveFrameSettings(updated);
  };

  const handleChangeLayoutMode = (layoutMode: LayoutMode) => {
    const updated = { ...frameSettings, layoutMode };
    setFrameSettings(updated);
    photoStorage.saveFrameSettings(updated);
  };

  // Photo Management Handlers
  const handleAddPhotos = async (newPhotos: PhotoItem[]) => {
    for (const photo of newPhotos) {
      await photoStorage.savePhoto(photo);
    }
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await photoStorage.deletePhoto(photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleCreateAlbum = async (name: string, description: string) => {
    const newAlbum: PhotoAlbum = {
      id: `custom-album-${Date.now()}`,
      name,
      description,
      isCustom: true
    };
    await photoStorage.saveAlbum(newAlbum);
    setAlbums(prev => [...prev, newAlbum]);
  };

  const handleResetDefaultPhotos = async () => {
    setPhotos(DEFAULT_PHOTOS);
    setAlbums(DEFAULT_ALBUMS);
    setActiveAlbumId('all');
    setCurrentIndex(0);
  };

  const currentPhoto = currentAlbumPhotos[currentIndex] || DEFAULT_PHOTOS[0];
  const nextPhoto = currentAlbumPhotos[(currentIndex + 1) % currentAlbumPhotos.length];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white select-none font-roboto">
      
      {/* 1. Main Photo Display Frame */}
      {currentPhoto && (
        <PhotoFrame
          photo={currentPhoto}
          nextPhoto={nextPhoto}
          settings={frameSettings}
          isDevicePortrait={isDevicePortrait}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
          smartHubContent={
            <SmartHubPanel 
              settings={widgetSettings} 
              quote={currentQuote} 
            />
          }
        />
      )}

      {/* 2. Smart Overlay Widgets (Only in standard mode, when not in split smart hub view) */}
      {!isNightModeActive && frameSettings.layoutMode !== 'split-smart-hub' && (
        <SmartWidgets
          settings={widgetSettings}
          currentPhoto={currentPhoto}
          quote={currentQuote}
        />
      )}

      {/* 3. Floating Auto-hiding Dock Control Bar */}
      {!isNightModeActive && (
        <ControlBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
          isShuffle={frameSettings.shuffle}
          onToggleShuffle={() => handleUpdateFrameSettings({ ...frameSettings, shuffle: !frameSettings.shuffle })}
          currentTheme={frameSettings.theme}
          onChangeTheme={handleChangeTheme}
          soundTrack={soundSettings.track}
          soundVolume={soundSettings.volume}
          onChangeSoundTrack={handleChangeSoundTrack}
          onChangeSoundVolume={handleChangeSoundVolume}
          onToggleNightMode={() => setIsNightModeActive(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPhotoManager={() => setIsPhotoManagerOpen(true)}
          onOpenKioskGuide={() => setIsKioskGuideOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          isWakeLockActive={isWakeLockActive}
          onToggleWakeLock={() => {
            if (isWakeLockActive) {
              wakeLockManager.releaseWakeLock();
              setIsWakeLockActive(false);
            } else {
              wakeLockManager.requestWakeLock().then(res => setIsWakeLockActive(res));
            }
          }}
          albums={albums}
          activeAlbumId={activeAlbumId}
          onSelectAlbum={handleSelectAlbum}
          totalPhotos={currentAlbumPhotos.length}
          currentIndex={currentIndex}
          // Orientation and layout
          orientation={frameSettings.orientation}
          onChangeOrientation={handleChangeOrientation}
          rotation={frameSettings.rotation}
          onRotateScreen={handleRotateScreen}
          layoutMode={frameSettings.layoutMode}
          onChangeLayoutMode={handleChangeLayoutMode}
        />
      )}

      {/* 4. Night Mode Overlay (Anti burn-in pixel shift, gentle amber/crimson minimal clock) */}
      {isNightModeActive && (
        <NightModeOverlay
          settings={nightSettings}
          onExit={() => setIsNightModeActive(false)}
        />
      )}

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        frameSettings={frameSettings}
        onUpdateFrameSettings={handleUpdateFrameSettings}
        widgetSettings={widgetSettings}
        onUpdateWidgetSettings={handleUpdateWidgetSettings}
        nightSettings={nightSettings}
        onUpdateNightSettings={handleUpdateNightSettings}
        soundSettings={soundSettings}
        onUpdateSoundSettings={handleUpdateSoundSettings}
      />

      {/* 6. Photo & Album Manager Modal */}
      <PhotoManagerModal
        isOpen={isPhotoManagerOpen}
        onClose={() => setIsPhotoManagerOpen(false)}
        photos={photos}
        albums={albums}
        onAddPhotos={handleAddPhotos}
        onDeletePhoto={handleDeletePhoto}
        onCreateAlbum={handleCreateAlbum}
        onResetDefaultPhotos={handleResetDefaultPhotos}
      />

      {/* 7. iPad Kiosk Mode & Setup Guide Modal */}
      <KioskGuideModal
        isOpen={isKioskGuideOpen}
        onClose={() => setIsKioskGuideOpen(false)}
      />

      {/* 8. PWA Offline Status Indicator */}
      <OfflineIndicator />

    </main>
  );
}
