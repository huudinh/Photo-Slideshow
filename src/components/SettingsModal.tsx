import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Clock, 
  Moon, 
  Layers, 
  Volume2, 
  Heart, 
  Plus, 
  Trash2,
  Monitor,
  Smartphone,
  RotateCw,
  Columns,
  Square,
  Sparkles,
  Navigation,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { weatherLocationService } from '../utils/weatherService';
import { 
  FrameSettings, 
  NightModeSettings, 
  SoundSettings, 
  WidgetSettings,
  FrameTheme,
  TransitionType,
  SoundTrackType,
  AnniversaryItem,
  OrientationMode,
  LayoutMode,
  ScreenRotation
} from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameSettings: FrameSettings;
  onUpdateFrameSettings: (settings: FrameSettings) => void;
  widgetSettings: WidgetSettings;
  onUpdateWidgetSettings: (settings: WidgetSettings) => void;
  nightSettings: NightModeSettings;
  onUpdateNightSettings: (settings: NightModeSettings) => void;
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  frameSettings,
  onUpdateFrameSettings,
  widgetSettings,
  onUpdateWidgetSettings,
  nightSettings,
  onUpdateNightSettings,
  soundSettings,
  onUpdateSoundSettings
}) => {
  const [activeTab, setActiveTab] = useState<'orientation' | 'frame' | 'widgets' | 'anniversaries' | 'night' | 'sound'>('orientation');
  const [newAnnivTitle, setNewAnnivTitle] = useState('');
  const [newAnnivDate, setNewAnnivDate] = useState('');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleTestGPS = async () => {
    setIsLocating(true);
    setGpsStatus('Đang yêu cầu tọa độ GPS từ trình duyệt...');
    try {
      const data = await weatherLocationService.fetchWeatherByGPS();
      setGpsStatus(`✅ Đã định vị thành công: ${data.cityName} (${data.temperature}°C, ${data.condition})`);
      onUpdateWidgetSettings({
        ...widgetSettings,
        useGPS: true,
        weatherCity: data.cityName
      });
    } catch (err: any) {
      setGpsStatus(`❌ Lỗi: ${err.message || 'Không thể lấy GPS. Vui lòng cho phép quyền vị trí trong Safari/Trình duyệt'}`);
    } finally {
      setIsLocating(false);
    }
  };

  if (!isOpen) return null;

  const handleAddAnniversary = () => {
    if (!newAnnivTitle.trim() || !newAnnivDate) return;
    const newItem: AnniversaryItem = {
      id: `anniv-${Date.now()}`,
      title: newAnnivTitle.trim(),
      date: newAnnivDate,
      icon: '🎉'
    };
    onUpdateWidgetSettings({
      ...widgetSettings,
      anniversaries: [...(widgetSettings.anniversaries || []), newItem]
    });
    setNewAnnivTitle('');
    setNewAnnivDate('');
  };

  const handleDeleteAnniversary = (id: string) => {
    onUpdateWidgetSettings({
      ...widgetSettings,
      anniversaries: widgetSettings.anniversaries.filter(a => a.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto font-roboto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-roboto-slab">Cài Đặt Khung Tranh Thông Minh</h3>
              <p className="text-xs text-neutral-400">Tùy biến hiển thị ngang/dọc, âm lịch, hiệu ứng & âm thanh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 bg-neutral-950/60 border-b border-neutral-800 overflow-x-auto text-xs font-medium">
          
          <button
            onClick={() => setActiveTab('orientation')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'orientation' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>Xem Ngang & Dọc</span>
          </button>

          <button
            onClick={() => setActiveTab('frame')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'frame' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Khung & Chuyển Ảnh</span>
          </button>

          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'widgets' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Đồng Hồ & Âm Lịch</span>
          </button>

          <button
            onClick={() => setActiveTab('anniversaries')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'anniversaries' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Ngày Kỷ Niệm ({widgetSettings.anniversaries?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('night')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'night' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Chế Độ Ban Đêm</span>
          </button>

          <button
            onClick={() => setActiveTab('sound')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'sound' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Âm Thanh Nền</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          
          {/* TAB 0: ORIENTATION & VIEWING MODES (XEM NGANG VÀ DỌC) */}
          {activeTab === 'orientation' && (
            <div className="space-y-5">
              
              {/* Orientation Setting */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Hướng đặt thiết bị (iPad / iPhone / Màn hình):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'auto', label: 'Tự động cảm biến', desc: 'Tự xoay theo chiều người dùng cầm iPad', icon: <RotateCw className="w-5 h-5" /> },
                    { id: 'landscape', label: 'Khóa Xem Ngang', desc: 'Tối ưu khi đặt iPad trên chân đế ngang', icon: <Monitor className="w-5 h-5" /> },
                    { id: 'portrait', label: 'Khóa Xem Dọc', desc: 'Tối ưu khi đặt iPad đứng trên bàn', icon: <Smartphone className="w-5 h-5" /> }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, orientation: opt.id as OrientationMode })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        frameSettings.orientation === opt.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-amber-400 mb-1.5">
                        {opt.icon}
                        <span className="font-bold text-white text-sm">{opt.label}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 leading-relaxed">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Modes */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Bố cục hiển thị ảnh thông minh:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'single', label: 'Ảnh đơn toàn khung', desc: 'Một bức ảnh trung tâm với bo viền nghệ thuật', icon: <Square className="w-5 h-5" /> },
                    { id: 'dual', label: 'Ghép 2 ảnh dọc song song', desc: 'Tự động ghép 2 ảnh chân dung cạnh nhau trong 1 khung gỗ đôi', icon: <Columns className="w-5 h-5" /> },
                    { id: 'split-smart-hub', label: 'Màn hình Smart Hub', desc: 'Chia đôi màn hình: 1 bên ảnh, 1 bên đồng hồ & âm lịch', icon: <Sliders className="w-5 h-5" /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, layoutMode: item.id as LayoutMode })}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                        frameSettings.layoutMode === item.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-amber-400 mb-1.5">
                        {item.icon}
                        <span className="font-bold text-white text-sm">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 leading-relaxed">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Split Portraits in Landscape Mode */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-200 block text-sm">Tự động ghép ảnh dọc khi xoay ngang</span>
                  <span className="text-[11px] text-neutral-400">
                    Khi màn hình nằm ngang và gặp ảnh chụp đứng (chân dung), tự động ghép với ảnh tiếp theo để không bị viền đen thừa 2 bên
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={frameSettings.autoSplitPortrait}
                  onChange={(e) => onUpdateFrameSettings({ ...frameSettings, autoSplitPortrait: e.target.checked })}
                  className="w-5 h-5 rounded accent-amber-500 shrink-0"
                />
              </div>

              {/* Fixed Screen Rotation Angle */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Xoay góc hiển thị cố định (Hữu ích khi cắm dây sạc iPad theo hướng khác nhau):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { deg: 0, label: 'Mặc định (0°)' },
                    { deg: 90, label: 'Xoay phải (90°)' },
                    { deg: 180, label: 'Đảo ngược (180°)' },
                    { deg: 270, label: 'Xoay trái (270°)' }
                  ].map(r => (
                    <button
                      key={r.deg}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, rotation: r.deg as ScreenRotation })}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                        frameSettings.rotation === r.deg
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: FRAME & DISPLAY */}
          {activeTab === 'frame' && (
            <div className="space-y-5">
              {/* Slideshow Interval */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Thời gian đổi ảnh (Khoảng nghỉ giữa các bức ảnh):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { sec: 5, label: '5 giây' },
                    { sec: 10, label: '10 giây' },
                    { sec: 20, label: '20 giây' },
                    { sec: 30, label: '30 giây' },
                    { sec: 60, label: '1 phút' },
                    { sec: 300, label: '5 phút' }
                  ].map(item => (
                    <button
                      key={item.sec}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, slideshowInterval: item.sec })}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                        frameSettings.slideshowInterval === item.sec
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transition Style */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Hiệu ứng chuyển ảnh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ken-burns', label: 'Ken Burns (Điện ảnh)', desc: 'Thu phóng chậm nhẹ nhàng' },
                    { id: 'fade', label: 'Mờ ảo (Crossfade)', desc: 'Chuyển cảnh mượt mà' },
                    { id: 'slide', label: 'Trượt ngang', desc: 'Lướt album tinh tế' },
                    { id: 'polaroid-stack', label: 'Polaroid cổ điển', desc: 'Phong cách ảnh in liền' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, transition: item.id as TransitionType })}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        frameSettings.transition === item.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="font-bold text-slate-100">{item.label}</span>
                      <span className="text-[10px] text-neutral-400 mt-1">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Style Selection */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">
                  Kiểu dáng khung bao quanh ảnh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'oak-wood', label: 'Gỗ sồi tự nhiên', icon: '🪵' },
                    { id: 'dark-walnut', label: 'Gỗ óc chó sang trọng', icon: '🌲' },
                    { id: 'nordic-white', label: 'Viền trắng Bắc Âu', icon: '⚪' },
                    { id: 'gallery-black', label: 'Khung đen nghệ thuật', icon: '🖤' },
                    { id: 'vintage-gold', label: 'Khung mạ vàng cổ điển', icon: '👑' },
                    { id: 'frameless', label: 'Tràn viền điện ảnh', icon: '🪟' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => onUpdateFrameSettings({ ...frameSettings, theme: item.id as FrameTheme })}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        frameSettings.theme === item.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passe-partout (Matte) Width & Tone */}
              {frameSettings.theme !== 'frameless' && (
                <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200">Độ dày bo viền đệm (Matte / Passe-partout):</span>
                      <p className="text-[11px] text-neutral-400">Tạo chiều sâu nghệ thuật như tranh lồng khung kính</p>
                    </div>
                    <div className="flex gap-1.5">
                      {(['none', 'thin', 'medium', 'wide'] as const).map(size => (
                        <button
                          key={size}
                          onClick={() => onUpdateFrameSettings({ ...frameSettings, matteSize: size })}
                          className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-semibold border ${
                            frameSettings.matteSize === size
                              ? 'border-amber-400 bg-amber-500 text-neutral-950'
                              : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {size === 'none' ? 'Không' : size === 'thin' ? 'Mỏng' : size === 'medium' ? 'Vừa' : 'Dày'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-700/40">
                    <span className="font-semibold text-slate-200">Màu viền đệm lót:</span>
                    <div className="flex gap-2">
                      {[
                        { id: 'white', label: 'Trắng tinh', color: 'bg-white' },
                        { id: 'ivory', label: 'Trắng ngà', color: 'bg-[#fbf7ee]' },
                        { id: 'cream', label: 'Kem ấm', color: 'bg-[#f4eedb]' },
                        { id: 'charcoal', label: 'Than xám', color: 'bg-[#1e2024]' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => onUpdateFrameSettings({ ...frameSettings, matteColor: m.id as any })}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                            frameSettings.matteColor === m.id
                              ? 'border-amber-400 text-amber-200 font-bold'
                              : 'border-neutral-700 text-neutral-400'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${m.color} border border-neutral-500`} />
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WIDGETS & OVERLAYS */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Clock Toggle */}
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Hiện Đồng Hồ Số</span>
                    <span className="text-[11px] text-neutral-400">Giờ, phút, giây cập nhật trực tiếp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showClock}
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showClock: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                </div>

                {/* Vietnamese Lunar Date Toggle */}
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-amber-300 block">Lịch Âm Việt Nam (Can Chi)</span>
                    <span className="text-[11px] text-neutral-400">Mùng/ngày âm, Can Chi, Tiết khí</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showLunarDate}
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showLunarDate: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                </div>

                {/* Weather Toggle */}
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Thời Tiết Hiện Tại</span>
                    <span className="text-[11px] text-neutral-400">Nhiệt độ & thời tiết địa phương</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showWeather}
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showWeather: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                </div>

                {/* Photo Info Toggle */}
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Thông Tin Bức Ảnh</span>
                    <span className="text-[11px] text-neutral-400">Tiêu đề, ngày chụp & địa điểm</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showPhotoInfo}
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showPhotoInfo: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                </div>

                {/* Family Quote Toggle */}
                <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between col-span-full">
                  <div>
                    <span className="font-semibold text-slate-200 block">Lời Nhắn & Châm Ngôn Gia Đình</span>
                    <span className="text-[11px] text-neutral-400">Hiện thông điệp yêu thương hoặc câu chúc ấm áp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showFamilyQuote}
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showFamilyQuote: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500"
                  />
                </div>

              </div>

              {/* Custom Family Memo Editor */}
              {widgetSettings.showFamilyQuote && (
                <div className="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700/60 space-y-2">
                  <label className="block font-semibold text-amber-200">
                    Tùy chỉnh lời nhắn riêng của gia đình bạn:
                  </label>
                  <input
                    type="text"
                    value={widgetSettings.customQuote}
                    placeholder="Ví dụ: Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc."
                    onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, customQuote: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Để trống nếu muốn hệ thống tự động đổi các câu châm ngôn gia đình ý nghĩa mỗi ngày.
                  </p>
                </div>
              )}

              {/* Weather and GPS Location Settings */}
              {widgetSettings.showWeather && (
                <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sky-200 block">Định vị GPS tự động từ trình duyệt</span>
                      <span className="text-[11px] text-neutral-400">
                        Tự động cập nhật thời tiết & nhiệt độ chính xác theo vị trí thực tế của iPad/thiết bị
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={widgetSettings.useGPS !== false}
                      onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, useGPS: e.target.checked })}
                      className="w-5 h-5 rounded accent-sky-500 shrink-0"
                    />
                  </div>

                  {widgetSettings.useGPS !== false ? (
                    <div className="pt-2 border-t border-neutral-700/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Vị trí hiện tại: <strong className="text-white">{widgetSettings.weatherCity || 'Đang lấy tọa độ GPS...'}</strong></span>
                      </div>
                      <button
                        onClick={handleTestGPS}
                        disabled={isLocating}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>{isLocating ? 'Đang định vị...' : '📍 Lấy lại vị trí GPS ngay'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-neutral-700/50 flex items-center gap-3">
                      <span className="font-semibold text-slate-200 whitespace-nowrap">Thành phố thủ công:</span>
                      <input
                        type="text"
                        value={widgetSettings.weatherCity}
                        onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, weatherCity: e.target.value })}
                        placeholder="Hà Nội / TP. Hồ Chí Minh / Đà Nẵng / Cần Thơ..."
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  )}

                  {gpsStatus && (
                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700 text-[11px] text-sky-300 animate-in fade-in">
                      {gpsStatus}
                    </div>
                  )}
                </div>
              )}

              {/* Widget Position */}
              <div className="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700/60 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Vị trí hiển thị tiện ích trên màn hình:</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'bottom-left', label: 'Góc dưới trái' },
                    { id: 'bottom-right', label: 'Góc dưới phải' },
                    { id: 'top-left', label: 'Góc trên trái' },
                    { id: 'top-right', label: 'Góc trên phải' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      onClick={() => onUpdateWidgetSettings({ ...widgetSettings, widgetPosition: pos.id as any })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                        widgetSettings.widgetPosition === pos.id
                          ? 'border-amber-400 bg-amber-500 text-neutral-950'
                          : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANNIVERSARIES */}
          {activeTab === 'anniversaries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block text-sm">Đếm Ngày Kỷ Niệm Gia Đình</span>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Tự động đếm ngược ngày sinh nhật con, ngày cưới, ngày họp mặt gia đình
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={widgetSettings.showAnniversary}
                  onChange={(e) => onUpdateWidgetSettings({ ...widgetSettings, showAnniversary: e.target.checked })}
                  className="w-5 h-5 rounded accent-amber-500"
                />
              </div>

              {/* Add Anniversary Form */}
              <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Tên kỷ niệm (ví dụ: Kỷ niệm ngày cưới)"
                  value={newAnnivTitle}
                  onChange={(e) => setNewAnnivTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs flex-1 min-w-[200px]"
                />
                <input
                  type="date"
                  value={newAnnivDate}
                  onChange={(e) => setNewAnnivDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
                />
                <button
                  onClick={handleAddAnniversary}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>

              {/* Anniversaries List */}
              <div className="space-y-2">
                {widgetSettings.anniversaries?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎉</span>
                      <div>
                        <span className="font-semibold text-slate-100 block">{item.title}</span>
                        <span className="text-amber-400 text-[11px]">{item.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAnniversary(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NIGHT MODE & ANTI BURN-IN */}
          {activeTab === 'night' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
                <Moon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-200">Chế độ Ban Đêm & Bảo Vệ Màn Hình Cũ</h4>
                  <p className="text-neutral-300 text-[11px] mt-0.5 leading-relaxed">
                    Tự động chuyển thành đồng hồ siêu tối giản ánh sáng dịu vào ban đêm, giúp không bị chói mắt trong phòng ngủ và tích hợp tính năng Pixel-Shift chống lưu ảnh (burn-in) cho màn hình iPad cũ chạy 24/7.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Tự động bật Chế độ Ban Đêm theo giờ</span>
                  <span className="text-[11px] text-neutral-400">Từ 22:00 tối đến 06:00 sáng hôm sau</span>
                </div>
                <input
                  type="checkbox"
                  checked={nightSettings.enabled}
                  onChange={(e) => onUpdateNightSettings({ ...nightSettings, enabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-amber-500"
                />
              </div>

              {/* Night Clock Color */}
              <div>
                <label className="block font-semibold text-slate-200 mb-2">Màu sắc đồng hồ ban đêm:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'amber', label: 'Hổ phách (Amber)', desc: 'Dịu mắt nhất', bg: 'bg-amber-500' },
                    { id: 'crimson', label: 'Đỏ thẫm (Crimson)', desc: 'Không phá vỡ giấc ngủ', bg: 'bg-rose-600' },
                    { id: 'warm-white', label: 'Trắng ấm (Warm White)', desc: 'Cổ điển thanh lịch', bg: 'bg-stone-300' },
                    { id: 'deep-blue', label: 'Xanh trăng (Moonlight)', desc: 'Bình yên', bg: 'bg-sky-400' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateNightSettings({ ...nightSettings, clockColor: c.id as any })}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                        nightSettings.clockColor === c.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full ${c.bg}`} />
                        <span className="font-semibold">{c.label}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pixel Shift Anti-Burn-in Toggle */}
              <div className="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Chống Lưu Ảnh Màn Hình (Pixel Shift)</span>
                  <span className="text-[11px] text-neutral-400">Dịch chuyển nhẹ các điểm ảnh mỗi vài phút để bảo vệ tấm nền LCD/OLED cũ</span>
                </div>
                <input
                  type="checkbox"
                  checked={nightSettings.enablePixelShift}
                  onChange={(e) => onUpdateNightSettings({ ...nightSettings, enablePixelShift: e.target.checked })}
                  className="w-5 h-5 rounded accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SOUNDSCAPES */}
          {activeTab === 'sound' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sky-200">Âm Thanh Tự Nhiên Thư Giãn (Web Audio API)</h4>
                  <p className="text-neutral-300 text-[11px] mt-0.5">
                    Tạo âm thanh trực tiếp từ trình duyệt, 100% không tốn dữ liệu mạng 4G/Wifi, tạo không gian ấm cúng trong phòng khách hoặc góc làm việc.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'off', label: 'Tắt âm thanh', icon: '🔇' },
                  { id: 'rain', label: 'Tiếng mưa rơi mái hiên', icon: '🌧️' },
                  { id: 'ocean', label: 'Sóng biển êm dịu', icon: '🌊' },
                  { id: 'fireplace', label: 'Lửa sưởi tí tách ấm áp', icon: '🔥' },
                  { id: 'windchime', label: 'Chuông gió tĩnh tâm', icon: '🎐' },
                  { id: 'birds', label: 'Tiếng chim hót sớm mai', icon: '🐦' },
                  { id: 'lofi-piano', label: 'Giai điệu Lofi Piano', icon: '🎹' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => onUpdateSoundSettings({ ...soundSettings, track: s.id as SoundTrackType })}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                      soundSettings.track === s.id
                        ? 'border-sky-400 bg-sky-500/20 text-sky-200 font-bold'
                        : 'border-neutral-700 bg-neutral-800/60 text-neutral-300'
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {soundSettings.track !== 'off' && (
                <div className="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700 space-y-2">
                  <div className="flex justify-between items-center text-slate-200 font-medium">
                    <span>Âm lượng âm thanh:</span>
                    <span className="font-mono text-sky-300">{Math.round(soundSettings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundSettings.volume}
                    onChange={(e) => onUpdateSoundSettings({ ...soundSettings, volume: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="max-w-[200px]">
            <PWAInstallButton variant="compact" />
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shadow-lg"
          >
            Đóng & Áp dụng
          </button>
        </div>

      </div>
    </div>
  );
};
