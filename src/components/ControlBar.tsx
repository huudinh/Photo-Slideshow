import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sliders, 
  Image as ImageIcon, 
  Maximize, 
  Minimize, 
  HelpCircle, 
  Layers, 
  ShieldCheck,
  FolderOpen,
  RotateCw,
  Smartphone,
  Monitor,
  Columns,
  Square
} from 'lucide-react';
import { FrameTheme, LayoutMode, OrientationMode, PhotoAlbum, SoundTrackType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  currentTheme: FrameTheme;
  onChangeTheme: (theme: FrameTheme) => void;
  soundTrack: SoundTrackType;
  soundVolume: number;
  onChangeSoundTrack: (track: SoundTrackType) => void;
  onChangeSoundVolume: (volume: number) => void;
  onToggleNightMode: () => void;
  onOpenSettings: () => void;
  onOpenPhotoManager: () => void;
  onOpenKioskGuide: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isWakeLockActive: boolean;
  onToggleWakeLock: () => void;
  albums: PhotoAlbum[];
  activeAlbumId: string;
  onSelectAlbum: (albumId: string) => void;
  totalPhotos: number;
  currentIndex: number;
  // Orientation & Layout additions
  orientation: OrientationMode;
  onChangeOrientation: (mode: OrientationMode) => void;
  rotation: number;
  onRotateScreen: () => void;
  layoutMode: LayoutMode;
  onChangeLayoutMode: (mode: LayoutMode) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  isShuffle,
  onToggleShuffle,
  currentTheme,
  onChangeTheme,
  soundTrack,
  soundVolume,
  onChangeSoundTrack,
  onChangeSoundVolume,
  onToggleNightMode,
  onOpenSettings,
  onOpenPhotoManager,
  onOpenKioskGuide,
  isFullscreen,
  onToggleFullscreen,
  isWakeLockActive,
  onToggleWakeLock,
  albums,
  activeAlbumId,
  onSelectAlbum,
  totalPhotos,
  currentIndex,
  orientation,
  onChangeOrientation,
  rotation,
  onRotateScreen,
  layoutMode,
  onChangeLayoutMode
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const [showOrientationMenu, setShowOrientationMenu] = useState(false);

  // Auto-hide toolbar after 4.5 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      setIsVisible(true);
      clearTimeout(timeout);
      // If a popover menu is open, do not auto hide
      if (!showThemeMenu && !showSoundMenu && !showAlbumMenu && !showOrientationMenu) {
        timeout = setTimeout(() => {
          setIsVisible(false);
        }, 4500);
      }
    };

    const handleUserActivity = () => {
      resetTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [showThemeMenu, showSoundMenu, showAlbumMenu, showOrientationMenu]);

  const frameThemes: { id: FrameTheme; label: string; icon: string }[] = [
    { id: 'oak-wood', label: 'Gỗ sồi ấm áp', icon: '🪵' },
    { id: 'dark-walnut', label: 'Gỗ óc chó sang trọng', icon: '🌲' },
    { id: 'nordic-white', label: 'Bo viền trắng Bắc Âu', icon: '⚪' },
    { id: 'gallery-black', label: 'Khung đen nghệ thuật', icon: '🖤' },
    { id: 'vintage-gold', label: 'Khung vàng cổ điển', icon: '👑' },
    { id: 'polaroid', label: 'Phong cách Polaroid', icon: '📸' },
    { id: 'frameless', label: 'Tràn viền điện ảnh', icon: '🪟' },
  ];

  const soundOptions: { id: SoundTrackType; label: string; icon: string }[] = [
    { id: 'off', label: 'Tắt âm thanh', icon: '🔇' },
    { id: 'rain', label: 'Tiếng mưa rơi mái hiên', icon: '🌧️' },
    { id: 'ocean', label: 'Sóng biển êm đềm', icon: '🌊' },
    { id: 'fireplace', label: 'Lửa sưởi ấm cúng', icon: '🔥' },
    { id: 'windchime', label: 'Chuông gió tĩnh tâm', icon: '🎐' },
    { id: 'birds', label: 'Tiếng chim rừng sớm mai', icon: '🐦' },
    { id: 'lofi-piano', label: 'Giai điệu Lofi Piano', icon: '🎹' },
  ];

  const isAnyMenuOpen = showAlbumMenu || showThemeMenu || showSoundMenu || showOrientationMenu;

  const closeAllMenus = () => {
    setShowAlbumMenu(false);
    setShowThemeMenu(false);
    setShowSoundMenu(false);
    setShowOrientationMenu(false);
  };

  return (
    <>
      {/* Invisible backdrop to dismiss open dropdown on outside click */}
      {isAnyMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-transparent"
          onClick={closeAllMenus}
        />
      )}

      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
        } font-roboto`}
      >
        {/* Dock Bar Container */}
        <div className="flex items-center gap-1.5 md:gap-2 px-3 py-2 bg-neutral-900/85 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-200">
        
        {/* Photo counter / Album Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlbumMenu(!showAlbumMenu);
              setShowThemeMenu(false);
              setShowSoundMenu(false);
              setShowOrientationMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition text-amber-200"
            title="Chọn Album ảnh"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline max-w-[85px] truncate">
              {activeAlbumId === 'all' ? 'Tất cả' : albums.find(a => a.id === activeAlbumId)?.name || 'Album'}
            </span>
            <span className="text-white/60 text-[11px] font-mono">
              ({totalPhotos > 0 ? `${currentIndex + 1}/${totalPhotos}` : '0'})
            </span>
          </button>

          {/* Album Dropdown Menu */}
          {showAlbumMenu && (
            <div className="absolute bottom-full left-0 mb-3 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 text-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                Bộ sưu tập ảnh
              </div>
              <button
                onClick={() => { onSelectAlbum('all'); setShowAlbumMenu(false); }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                  activeAlbumId === 'all' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                <span>Tất cả ảnh ({totalPhotos})</span>
              </button>
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => { onSelectAlbum(album.id); setShowAlbumMenu(false); }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                    activeAlbumId === album.id ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span className="truncate">{album.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-white/15 mx-0.5" />

        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white"
          title="Ảnh trước (Phím mũi tên trái)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className="p-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl shadow-lg transition active:scale-95"
          title={isPlaying ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white"
          title="Ảnh tiếp theo (Phím mũi tên phải)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Shuffle Button */}
        <button
          onClick={onToggleShuffle}
          className={`p-2 rounded-xl transition ${
            isShuffle ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-white/15 text-slate-400'
          }`}
          title={isShuffle ? 'Trình chiếu ngẫu nhiên (Đang bật)' : 'Trình chiếu theo thứ tự'}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-white/15 mx-0.5" />

        {/* --- ORIENTATION & ROTATION MENU (XEM NGANG & DỌC) --- */}
        <div className="relative">
          <button
            onClick={() => {
              setShowOrientationMenu(!showOrientationMenu);
              setShowThemeMenu(false);
              setShowSoundMenu(false);
              setShowAlbumMenu(false);
            }}
            className={`p-2 rounded-xl transition flex items-center gap-1 ${
              orientation !== 'auto' || rotation !== 0
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'hover:bg-white/15 text-slate-300'
            }`}
            title="Tùy chọn Xem Ngang / Dọc & Bố cục"
          >
            {orientation === 'landscape' ? (
              <Monitor className="w-4 h-4" />
            ) : orientation === 'portrait' ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <RotateCw className="w-4 h-4" />
            )}
          </button>

          {/* Orientation & Layout Popover */}
          {showOrientationMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                <span>Hướng Xem Ngang & Dọc</span>
                {rotation !== 0 && <span className="text-amber-400">Xoay {rotation}°</span>}
              </div>

              {/* Mode Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => { 
                    onChangeOrientation('auto'); 
                    setShowOrientationMenu(false);
                  }}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    orientation === 'auto'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Tự động</span>
                </button>

                <button
                  onClick={() => { 
                    onChangeOrientation('landscape'); 
                    setShowOrientationMenu(false);
                  }}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    orientation === 'landscape'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Xem Ngang</span>
                </button>

                <button
                  onClick={() => { 
                    onChangeOrientation('portrait'); 
                    setShowOrientationMenu(false);
                  }}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                    orientation === 'portrait'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Xem Dọc</span>
                </button>
              </div>

              {/* Layout Modes */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 px-1 block">Bố cục hiển thị:</span>
                
                <button
                  onClick={() => {
                    onChangeLayoutMode('single');
                    setShowOrientationMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                    layoutMode === 'single'
                      ? 'bg-amber-500/25 text-amber-300 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Ảnh đơn toàn khung</span>
                </button>

                <button
                  onClick={() => {
                    onChangeLayoutMode('dual');
                    setShowOrientationMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                    layoutMode === 'dual'
                      ? 'bg-amber-500/25 text-amber-300 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Ghép 2 ảnh dọc song song</span>
                </button>

                <button
                  onClick={() => {
                    onChangeLayoutMode('split-smart-hub');
                    setShowOrientationMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                    layoutMode === 'split-smart-hub'
                      ? 'bg-amber-500/25 text-amber-300 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Màn hình Smart Hub (Ảnh + Lịch/Giờ)</span>
                </button>
              </div>

              {/* Quick 90deg Rotate Button */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    onRotateScreen();
                    setShowOrientationMenu(false);
                  }}
                  className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-amber-200 rounded-xl flex items-center justify-center gap-1.5 transition text-xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Xoay màn hình (+90°)</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Frame Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowSoundMenu(false);
              setShowAlbumMenu(false);
              setShowOrientationMenu(false);
            }}
            className={`p-2 rounded-xl transition flex items-center gap-1 ${
              showThemeMenu ? 'bg-white/20 text-white' : 'hover:bg-white/15 text-slate-300'
            }`}
            title="Thay đổi kiểu khung tranh"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Theme Dropdown Menu */}
          {showThemeMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 text-xs">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                Kiểu dáng Khung Tranh
              </div>
              {frameThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    onChangeTheme(theme.id);
                    setShowThemeMenu(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    currentTheme === theme.id
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-base">{theme.icon}</span>
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ambient Relaxation Sound */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSoundMenu(!showSoundMenu);
              setShowThemeMenu(false);
              setShowAlbumMenu(false);
              setShowOrientationMenu(false);
            }}
            className={`p-2 rounded-xl transition ${
              soundTrack !== 'off' ? 'bg-sky-500/20 text-sky-300 animate-pulse' : 'hover:bg-white/15 text-slate-300'
            }`}
            title="Âm thanh thư giãn tự nhiên"
          >
            {soundTrack !== 'off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Sound Menu Popover */}
          {showSoundMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                <span>Âm thanh thư giãn</span>
                <span className="text-sky-300 font-normal">Offline WebAudio</span>
              </div>
              <div className="flex flex-col gap-1">
                {soundOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onChangeSoundTrack(opt.id);
                    }}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition ${
                      soundTrack === opt.id
                        ? 'bg-sky-500/25 text-sky-200 font-semibold'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>

              {soundTrack !== 'off' && (
                <div className="mt-1 pt-2 border-t border-white/10 flex items-center gap-2 px-1">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => onChangeSoundVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Night Mode Button */}
        <button
          onClick={onToggleNightMode}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-amber-300"
          title="Bật Chế độ Ban Đêm (Đồng hồ dịu mắt)"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Photo Manager (Add/Upload Photos) */}
        <button
          onClick={onOpenPhotoManager}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white"
          title="Quản lý & Tải thêm ảnh từ iPad"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white"
          title="Cài đặt đồng hồ, âm lịch, hiệu ứng"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* iPad Setup / Guided Access Help Guide */}
        <button
          onClick={onOpenKioskGuide}
          className="p-2 hover:bg-white/15 rounded-xl transition text-amber-400/90 hover:text-amber-300"
          title="Hướng dẫn cấu hình iPad cũ thành khung tranh chuyên dụng"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Screen Wake Lock Status */}
        <button
          onClick={onToggleWakeLock}
          className={`p-2 rounded-xl transition ${
            isWakeLockActive ? 'text-emerald-400 hover:bg-emerald-500/15' : 'text-slate-500 hover:bg-white/10'
          }`}
          title={isWakeLockActive ? 'Màn hình luôn sáng (Đang kích hoạt)' : 'Chạm để giữ sáng màn hình liên tục'}
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white"
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

      </div>
    </div>
    </>
  );
};
