import React, { useState, useEffect } from 'react';
import { getCurrentLunarDate, LunarDateResult } from '../utils/lunarCalendar';
import { PhotoItem, WidgetSettings } from '../types';
import { weatherLocationService, RealWeatherData } from '../utils/weatherService';
import { 
  Clock, 
  CloudSun, 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  Sparkles,
  CloudRain,
  Sun,
  Cloud,
  Navigation
} from 'lucide-react';

interface SmartWidgetsProps {
  settings: WidgetSettings;
  currentPhoto?: PhotoItem;
  quote?: string;
  themeStyle?: string;
}

export const SmartWidgets: React.FC<SmartWidgetsProps> = ({
  settings,
  currentPhoto,
  quote,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [lunarDate, setLunarDate] = useState<LunarDateResult>(getCurrentLunarDate());
  const [weather, setWeather] = useState<RealWeatherData | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      // Cập nhật âm lịch mỗi khi sang ngày mới
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        setLunarDate(getCurrentLunarDate());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time weather via browser GPS or city name
  useEffect(() => {
    if (!settings.showWeather) return;

    let isMounted = true;
    const fetchWeather = async () => {
      let data: RealWeatherData;
      if (settings.useGPS !== false) {
        data = await weatherLocationService.fetchWeatherByGPS();
      } else {
        data = await weatherLocationService.fetchWeatherByCityName(settings.weatherCity || 'Hà Nội');
      }
      if (isMounted) {
        setWeather(data);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const weatherTimer = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherTimer);
    };
  }, [settings.showWeather, settings.useGPS, settings.weatherCity]);

  // Format date strings in Vietnamese
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[time.getDay()];
  const solarDateStr = `${dayName}, ngày ${time.getDate()} tháng ${time.getMonth() + 1}, ${time.getFullYear()}`;
  
  const hoursStr = time.getHours().toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  // Next upcoming anniversary calculation
  const nextAnniversary = React.useMemo(() => {
    if (!settings.showAnniversary || !settings.anniversaries || settings.anniversaries.length === 0) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = settings.anniversaries.map(a => {
      const target = new Date(a.date);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...a, diffDays };
    });

    // Return the closest upcoming or today's
    const upcoming = items.filter(i => i.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays);
    if (upcoming.length > 0) return upcoming[0];
    return items[0]; // fallback
  }, [settings.showAnniversary, settings.anniversaries, time.getDate()]);

  // Position class
  const getPositionClasses = () => {
    switch (settings.widgetPosition) {
      case 'top-left':
        return 'top-4 left-4 items-start text-left';
      case 'top-right':
        return 'top-4 right-4 items-end text-right';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end text-right';
      case 'bottom-left':
      default:
        return 'bottom-4 left-4 items-start text-left';
    }
  };

  return (
    <div 
      className={`absolute z-20 pointer-events-none flex flex-col gap-3 max-w-[90vw] md:max-w-md transition-all duration-500 ${getPositionClasses()}`}
      style={{ opacity: settings.overlayOpacity }}
    >
      {/* 1. Main Time & Date Card */}
      {settings.showClock && (
        <div className="backdrop-blur-md bg-black/45 border border-white/15 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex flex-col gap-1 drop-shadow-lg">
          {/* Digital Clock */}
          {settings.clockType === 'digital' && (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-light tracking-tight font-serif-luxury drop-shadow-md text-amber-100/95">
                {hoursStr}:{minutesStr}
              </span>
              <span className="text-sm font-light text-amber-200/70">
                {secondsStr}
              </span>
            </div>
          )}

          {/* Minimal Clock */}
          {settings.clockType === 'minimal' && (
            <div className="text-3xl md:text-4xl font-extralight tracking-widest text-white/90">
              {hoursStr}:{minutesStr}
            </div>
          )}

          {/* Dương lịch */}
          <div className="text-xs md:text-sm font-medium text-slate-200/90 flex items-center gap-1.5 mt-0.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{solarDateStr}</span>
          </div>

          {/* Âm lịch Việt Nam */}
          {settings.showLunarDate && (
            <div className="text-xs md:text-sm font-medium text-amber-300/95 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                Âm lịch: <strong className="font-semibold text-amber-200">{lunarDate.formattedString}</strong>
                {lunarDate.solarTerm && <span className="ml-1.5 opacity-80">({lunarDate.solarTerm})</span>}
              </span>
            </div>
          )}

          {/* Thời tiết GPS thực tế */}
          {settings.showWeather && (
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 pt-1 border-t border-white/10">
              <CloudSun className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span className="flex items-center gap-1 font-medium text-white">
                {settings.useGPS !== false && <Navigation className="w-2.5 h-2.5 text-emerald-400 inline" />}
                {weather?.cityName || settings.weatherCity || 'Hà Nội'}
              </span>
              <span className="font-bold text-sky-200">{weather?.temperature ?? 28}°C</span>
              <span className="text-sky-200/80 truncate">· {weather?.condition || 'Nắng nhẹ & mát mẻ'}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Photo Info Badge (Tiêu đề, ngày tháng chụp & địa điểm) */}
      {settings.showPhotoInfo && currentPhoto && (
        <div className="backdrop-blur-md bg-black/40 border border-white/15 text-white px-4 py-2.5 rounded-xl shadow-xl max-w-sm">
          <h4 className="text-sm md:text-base font-semibold text-amber-100 truncate">
            {currentPhoto.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
            {currentPhoto.date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400/80" />
                {currentPhoto.date}
              </span>
            )}
            {currentPhoto.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-rose-400" />
                {currentPhoto.location}
              </span>
            )}
          </div>
          {currentPhoto.notes && (
            <p className="text-xs italic text-slate-300/85 mt-1 line-clamp-2 border-l-2 border-amber-400/40 pl-2">
              "{currentPhoto.notes}"
            </p>
          )}
        </div>
      )}

      {/* 3. Family Quote & Warm Messages */}
      {settings.showFamilyQuote && (
        <div className="backdrop-blur-md bg-black/35 border border-white/10 text-white px-4 py-2 rounded-xl shadow-lg max-w-sm flex items-start gap-2">
          <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-xs md:text-sm font-light italic text-amber-100/90 leading-relaxed font-serif-luxury">
            "{settings.customQuote || quote || 'Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.'}"
          </p>
        </div>
      )}

      {/* 4. Anniversary Countdown (Ngày kỷ niệm đặc biệt) */}
      {settings.showAnniversary && nextAnniversary && (
        <div className="backdrop-blur-md bg-amber-950/60 border border-amber-500/30 text-white px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
            {nextAnniversary.icon || '🎉'}
          </div>
          <div className="text-xs">
            <span className="font-semibold text-amber-200 block">{nextAnniversary.title}</span>
            <span className="text-amber-300/80">
              {nextAnniversary.diffDays === 0
                ? '🌟 Hôm nay là ngày kỷ niệm!'
                : nextAnniversary.diffDays > 0
                ? `Còn ${nextAnniversary.diffDays} ngày nữa (${nextAnniversary.date})`
                : `Đã qua ${Math.abs(nextAnniversary.diffDays)} ngày`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
