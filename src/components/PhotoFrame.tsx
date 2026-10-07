import React, { useState, useEffect } from 'react';
import { FrameSettings, PhotoItem } from '../types';

interface PhotoFrameProps {
  photo: PhotoItem;
  nextPhoto?: PhotoItem;
  settings: FrameSettings;
  isDevicePortrait: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleControls?: () => void;
  smartHubContent?: React.ReactNode;
}

export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  photo,
  nextPhoto,
  settings,
  isDevicePortrait,
  onNext,
  onPrev,
  onToggleControls,
  smartHubContent
}) => {
  const [kenBurnsIndex, setKenBurnsIndex] = useState<number>(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Determine effective orientation (Auto detected or forced by user setting)
  const isEffectivePortrait = 
    settings.orientation === 'portrait' ? true :
    settings.orientation === 'landscape' ? false :
    isDevicePortrait;

  // Rotate Ken Burns animation style each time photo changes
  useEffect(() => {
    setKenBurnsIndex(prev => (prev % 3) + 1);
  }, [photo.id]);

  // Touch swipe support for iPad / iPhone
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (diff > 60 && onPrev) {
      onPrev();
    } else if (diff < -60 && onNext) {
      onNext();
    }
    setTouchStartX(null);
  };

  // Double tap to toggle UI controls
  let lastTap = 0;
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (onToggleControls) onToggleControls();
    }
    lastTap = now;
  };

  // Get Frame Border styling
  const getFrameThemeClass = () => {
    switch (settings.theme) {
      case 'oak-wood':
        return 'frame-oak-wood p-3 md:p-6 lg:p-7 rounded-lg';
      case 'dark-walnut':
        return 'frame-dark-walnut p-3 md:p-6 lg:p-7 rounded-lg';
      case 'nordic-white':
        return 'frame-nordic-white p-3 md:p-5 lg:p-6 rounded-sm shadow-2xl';
      case 'gallery-black':
        return 'frame-gallery-black p-3 md:p-6 lg:p-7 rounded-none border border-neutral-800';
      case 'vintage-gold':
        return 'frame-vintage-gold p-4 md:p-6 lg:p-8 rounded-xl';
      case 'polaroid':
        return 'frame-polaroid p-3 pb-12 md:p-5 md:pb-14 rounded-sm shadow-2xl';
      case 'frameless':
      default:
        return 'p-0';
    }
  };

  // Get Matte (Passe-partout) styling
  const getMatteClass = () => {
    if (settings.theme === 'frameless' || settings.matteSize === 'none') {
      return 'p-0';
    }

    let sizeClass = 'p-2 md:p-3.5';
    if (settings.matteSize === 'thin') sizeClass = 'p-1.5 md:p-2.5';
    if (settings.matteSize === 'wide') sizeClass = 'p-3 md:p-6 lg:p-8';

    let colorClass = 'matte-white';
    if (settings.matteColor === 'ivory') colorClass = 'matte-ivory';
    if (settings.matteColor === 'cream') colorClass = 'matte-cream';
    if (settings.matteColor === 'charcoal') colorClass = 'matte-charcoal';

    return `${sizeClass} ${colorClass} rounded-sm shadow-inner transition-all duration-300`;
  };

  // Transition animation class
  const getImageAnimClass = () => {
    if (settings.transition === 'ken-burns') {
      return `animate-ken-burns-${kenBurnsIndex}`;
    }
    return 'transition-transform duration-700 hover:scale-105';
  };

  // Check if we should render Dual Photo mode (either forced or auto portrait pair on landscape screen)
  const isDualMode = 
    settings.layoutMode === 'dual' || 
    (!isEffectivePortrait && settings.autoSplitPortrait && photo.aspectRatio && photo.aspectRatio < 1.0 && nextPhoto);

  // Rotation transform style
  const getRotationTransform = () => {
    if (!settings.rotation) return undefined;
    return `rotate(${settings.rotation}deg)`;
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-neutral-950 font-roboto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
      style={{
        transform: getRotationTransform(),
        transition: 'transform 0.5s ease-in-out'
      }}
    >
      {/* Blurred ambient background for aspect ratio gap filling */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url(${photo.url})` }}
      />

      {/* Main Container tailored to Layout Mode */}
      {settings.layoutMode === 'split-smart-hub' && !isEffectivePortrait ? (
        /* --- SMART HUB SPLIT VIEW (Ảnh bên trái + Bảng tin thông minh bên phải) --- */
        <div className="relative z-10 w-full h-full p-4 md:p-8 flex flex-row items-center gap-6 max-w-7xl mx-auto">
          {/* Left Photo Frame */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className={`w-full h-full max-h-[88vh] flex items-center justify-center ${getFrameThemeClass()}`}>
              <div className={`w-full h-full flex items-center justify-center overflow-hidden ${getMatteClass()}`}>
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black rounded-sm shadow-inner">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className={`w-full h-full object-cover ${getImageAnimClass()}`}
                    loading="eager"
                  />
                  {/* Photo Title Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <p className="font-medium text-sm text-amber-100 truncate">{photo.title}</p>
                    <p className="text-xs text-neutral-300">{photo.date} {photo.location ? `· ${photo.location}` : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Smart Hub Info Panel */}
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-h-[88vh] bg-neutral-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
              {smartHubContent}
            </div>
          </div>
        </div>
      ) : isDualMode && nextPhoto ? (
        /* --- DUAL PORTRAIT PHOTOS (Ghép đôi 2 ảnh dọc song song trong 1 khung) --- */
        <div 
          className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ${
            settings.theme !== 'frameless' ? 'max-w-[96vw] max-h-[96vh] m-auto' : ''
          }`}
        >
          <div className={`w-full h-full flex items-center justify-center ${getFrameThemeClass()}`}>
            <div className={`w-full h-full flex items-center justify-center overflow-hidden ${getMatteClass()}`}>
              
              {/* Dual Matting Openings */}
              <div className="w-full h-full grid grid-cols-2 gap-4 md:gap-6 p-2 md:p-4 bg-transparent">
                
                {/* Photo 1 */}
                <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-black rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className={`w-full h-full object-contain ${getImageAnimClass()}`}
                      loading="eager"
                    />
                  </div>
                  {settings.theme === 'polaroid' && (
                    <div className="w-full py-2 bg-white text-center font-script text-neutral-800 text-sm md:text-base">
                      {photo.title}
                    </div>
                  )}
                </div>

                {/* Photo 2 */}
                <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-black rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                      src={nextPhoto.url}
                      alt={nextPhoto.title}
                      className={`w-full h-full object-contain ${getImageAnimClass()}`}
                      loading="eager"
                    />
                  </div>
                  {settings.theme === 'polaroid' && (
                    <div className="w-full py-2 bg-white text-center font-script text-neutral-800 text-sm md:text-base">
                      {nextPhoto.title}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (
        /* --- SINGLE PHOTO VIEW (Ngang hoặc Dọc) --- */
        <div 
          className={`relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ${
            settings.theme !== 'frameless' ? 'max-w-[96vw] max-h-[96vh] m-auto' : ''
          }`}
        >
          <div 
            className={`w-full h-full flex items-center justify-center transition-all duration-500 ${getFrameThemeClass()}`}
          >
            {/* Inner Matte (Passe-partout) */}
            <div className={`w-full h-full flex items-center justify-center overflow-hidden ${getMatteClass()}`}>
              
              {/* Inner Bevel Border */}
              <div 
                className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-black ${
                  settings.hasInnerBevel && settings.theme !== 'frameless' 
                    ? 'shadow-[inset_0_3px_10px_rgba(0,0,0,0.6)] rounded-sm' 
                    : ''
                }`}
              >
                {/* Photo Display */}
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={photo.title || 'Family Photo'}
                    className={`w-full h-full object-contain ${getImageAnimClass()} will-change-transform`}
                    loading="eager"
                    style={{
                      WebkitTouchCallout: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Polaroid Signature Bar */}
                {settings.theme === 'polaroid' && (
                  <div className="absolute bottom-2 left-0 right-0 text-center font-script text-neutral-800 text-xl md:text-2xl drop-shadow-sm select-none">
                    {photo.title || 'Khoảnh khắc kỷ niệm'} {photo.date ? `· ${photo.date}` : ''}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
