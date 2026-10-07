import React, { useState, useEffect } from 'react';
import { getCurrentLunarDate, LunarDateResult } from '../utils/lunarCalendar';
import { WidgetSettings } from '../types';
import { weatherLocationService, RealWeatherData } from '../utils/weatherService';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  CloudSun, 
  Heart, 
  Clock, 
  Navigation
} from 'lucide-react';

interface SmartHubPanelProps {
  settings: WidgetSettings;
  quote?: string;
}

export const SmartHubPanel: React.FC<SmartHubPanelProps> = ({
  settings,
  quote
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [lunarDate, setLunarDate] = useState<LunarDateResult>(getCurrentLunarDate());
  const [weather, setWeather] = useState<RealWeatherData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) {
        setLunarDate(getCurrentLunarDate());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time weather via browser GPS or city name
  useEffect(() => {
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
    const weatherTimer = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherTimer);
    };
  }, [settings.useGPS, settings.weatherCity]);

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[time.getDay()];
  const hoursStr = time.getHours().toString().padStart(2, '0');
  const minutesStr = time.getMinutes().toString().padStart(2, '0');
  const secondsStr = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex flex-col justify-between h-full space-y-6 text-white font-roboto">
      
      {/* 1. Large Luxury Digital Clock */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-6xl md:text-7xl font-light font-roboto-slab tracking-tight text-amber-200 drop-shadow-lg">
            {hoursStr}:{minutesStr}
          </span>
          <span className="text-xl font-normal text-amber-400/80 font-mono">
            {secondsStr}
          </span>
        </div>
        <div className="text-base text-slate-200 mt-1 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-amber-400" />
          <span>{dayName}, {time.getDate()} tháng {time.getMonth() + 1}, {time.getFullYear()}</span>
        </div>
      </div>

      {/* 2. Detailed Vietnamese Lunar Calendar (Âm Lịch Chi Tiết) */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/25 space-y-2">
        <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Lịch Âm Việt Nam
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-normal">
            {lunarDate.solarTerm || 'Tiết Khí'}
          </span>
        </div>
        <div className="text-xl font-bold text-amber-100 font-roboto-slab">
          {lunarDate.formattedString}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs text-amber-200/80">
          <div>
            <span className="opacity-70">Ngày Can Chi:</span> <strong className="text-white">{lunarDate.canChiDay}</strong>
          </div>
          <div>
            <span className="opacity-70">Tháng Can Chi:</span> <strong className="text-white">{lunarDate.canChiMonth}</strong>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Weather & Local GPS Info */}
      <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/25 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-sky-300 font-medium flex items-center gap-1">
              {settings.useGPS !== false && <Navigation className="w-2.5 h-2.5 text-emerald-400 inline" />}
              {weather?.cityName || settings.weatherCity || 'Hà Nội'}
            </div>
            <div className="text-2xl font-bold text-white">{weather?.temperature ?? 28}°C</div>
          </div>
        </div>
        <div className="text-right text-xs text-sky-200/80">
          <p>{weather?.condition || 'Nắng nhẹ & thoáng mát'}</p>
          <p className="text-[11px] opacity-75 mt-0.5">Độ ẩm: {weather?.humidity ?? 65}% · Gió: {weather?.windSpeed ?? 12} km/h</p>
        </div>
      </div>

      {/* 4. Family Quote & Anniversaries */}
      <div className="p-4 rounded-2xl bg-neutral-800/60 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
          <Heart className="w-4 h-4 animate-pulse" />
          <span>Thông Điệp Yêu Thương</span>
        </div>
        <p className="text-xs md:text-sm italic text-amber-100/90 leading-relaxed font-roboto-slab">
          "{settings.customQuote || quote || 'Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.'}"
        </p>
      </div>

    </div>
  );
};
