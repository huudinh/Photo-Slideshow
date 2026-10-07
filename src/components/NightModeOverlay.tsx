import React, { useState, useEffect } from 'react';
import { NightModeSettings } from '../types';
import { getCurrentLunarDate, LunarDateResult } from '../utils/lunarCalendar';
import { Moon, Sun, Sparkles } from 'lucide-react';

interface NightModeOverlayProps {
  settings: NightModeSettings;
  onExit: () => void;
}

export const NightModeOverlay: React.FC<NightModeOverlayProps> = ({
  settings,
  onExit
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [lunarDate, setLunarDate] = useState<LunarDateResult>(getCurrentLunarDate());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      if (now.getSeconds() === 0) {
        setLunarDate(getCurrentLunarDate());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursStr = time.getHours().toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[time.getDay()];

  // Color theme
  const getColorClasses = () => {
    switch (settings.clockColor) {
      case 'amber':
        return {
          glow: 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          sub: 'text-amber-600/80',
          accent: 'text-amber-400'
        };
      case 'crimson':
        return {
          glow: 'text-rose-600 drop-shadow-[0_0_20px_rgba(225,29,72,0.3)]',
          sub: 'text-rose-700/80',
          accent: 'text-rose-500'
        };
      case 'deep-blue':
        return {
          glow: 'text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]',
          sub: 'text-sky-600/80',
          accent: 'text-sky-300'
        };
      case 'warm-white':
      default:
        return {
          glow: 'text-stone-300 drop-shadow-[0_0_20px_rgba(214,211,209,0.25)]',
          sub: 'text-stone-500',
          accent: 'text-stone-400'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div 
      onClick={onExit}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-700"
      style={{
        opacity: Math.max(0.4, 1 - (settings.dimLevel * 0.5))
      }}
    >
      {/* Anti burn-in floating container with slow pixel shift */}
      <div className={`flex flex-col items-center text-center p-8 ${settings.enablePixelShift ? 'animate-pixel-shift' : ''}`}>
        
        {/* Night mode icon badge */}
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs">
          <Moon className={`w-3.5 h-3.5 ${colors.accent}`} />
          <span className={colors.sub}>Chế độ Ban Đêm dịu mắt</span>
        </div>

        {/* Large Minimal Night Clock */}
        <div className="flex items-baseline justify-center gap-3">
          <span className={`text-7xl md:text-9xl font-extralight tracking-tight font-serif-luxury ${colors.glow}`}>
            {hoursStr}:{minutesStr}
          </span>
          <span className={`text-xl md:text-2xl font-light ${colors.sub}`}>
            {secondsStr}
          </span>
        </div>

        {/* Date & Lunar Date */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className={`text-base md:text-lg font-light tracking-wide ${colors.sub}`}>
            {dayName}, {time.getDate()} tháng {time.getMonth() + 1}, {time.getFullYear()}
          </div>
          <div className={`text-xs md:text-sm font-light flex items-center gap-1.5 ${colors.accent}`}>
            <Sparkles className="w-3 h-3" />
            <span>Âm lịch: {lunarDate.formattedString}</span>
          </div>
        </div>

        {/* Tap to Wake Hint */}
        <div className="mt-12 text-xs text-neutral-600 flex items-center gap-1.5 animate-pulse">
          <span>Chạm vào bất kỳ đâu để trở lại album ảnh</span>
        </div>
      </div>
    </div>
  );
};
